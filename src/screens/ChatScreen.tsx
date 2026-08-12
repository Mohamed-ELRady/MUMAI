import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { monthsBetween, currentStageForAge } from '../data/ageHelpers';
import { getAssistantReply } from '../services/aiChatService';
import { colors, spacing, radii } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

let msgCounter = 0;
const nextId = () => String(msgCounter++);

export default function ChatScreen({ route }: Props) {
  const { profile } = useAppStore();
  const { t, lang, isRTL } = useLanguage();
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const ageMonths = useMemo(
    () => (profile ? monthsBetween(profile.birthDateISO, new Date().toISOString()) : 0),
    [profile]
  );
  const stageId = route.params?.stageId ?? currentStageForAge(ageMonths).id;
  const babyName = profile?.name ?? t('defaultChildName');

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'assistant', text: t('chatIntro', { name: babyName }) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);
    setLoading(true);
    try {
      const reply = await getAssistantReply(text, {
        babyName: profile?.name,
        ageMonths,
        currentStageId: stageId,
        lang,
      });
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', text: reply }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user'
                ? [styles.bubbleUser, { alignSelf: isRTL ? 'flex-start' : 'flex-end' }]
                : [styles.bubbleAssistant, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }],
            ]}
          >
            <Text style={[item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant, { textAlign }]}>
              {item.text}
            </Text>
          </View>
        )}
      />
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      <View style={[styles.inputRow, { flexDirection: rowDir }]}>
        <Pressable style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Text style={styles.sendButtonText}>{t('sendButton')}</Text>
        </Pressable>
        <TextInput
          style={[styles.input, { textAlign }]}
          value={input}
          onChangeText={setInput}
          placeholder={t('chatPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          onSubmitEditing={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bubble: { maxWidth: '85%', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  bubbleAssistant: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleUser: { backgroundColor: colors.primary },
  bubbleTextAssistant: { color: colors.text, fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#fff', fontSize: 14, lineHeight: 20 },
  loadingRow: { paddingBottom: spacing.sm },
  inputRow: {
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    maxHeight: 100,
    color: colors.text,
    marginHorizontal: spacing.sm,
  },
  sendButton: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  sendButtonText: { color: '#fff', fontWeight: '700' },
});
