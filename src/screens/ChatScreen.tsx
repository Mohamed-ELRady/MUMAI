import React, { useState, useRef, useEffect } from 'react';
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
import { currentStageForAge } from '../data/ageHelpers';
import { useAgeMonths } from '../data/useAgeMonths';
import { getAssistantResponse, MAX_QUERY_LENGTH } from '../services/aiChatService';
import { colors, spacing, radii } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  lang: 'ar' | 'en';
  source?: 'local' | 'proxy';
  connectionFailed?: boolean;
}

let msgCounter = 0;
const nextId = () => String(msgCounter++);

export default function ChatScreen({ route }: Props) {
  const { profile, completedMilestoneIds } = useAppStore();
  const { t, lang, isRTL } = useLanguage();
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const ageMonths = useAgeMonths(profile?.birthDateISO);
  const stageId = route.params?.stageId ?? currentStageForAge(ageMonths).id;
  const babyName = profile?.name ?? t('defaultChildName');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(route.params?.askRemaining ? t('chatRemainingQuestion') : '');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const sending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function handleSend(suggestion?: string) {
    const text = (suggestion ?? input).trim();
    if (!text || sending.current) return;
    sending.current = true;
    setInput('');
    setMessages((m) => [...m, { id: nextId(), role: 'user', text, lang }]);
    setLoading(true);
    try {
      const reply = await getAssistantResponse(text, {
        babyName: profile?.name,
        ageMonths,
        currentStageId: stageId,
        lang,
        completedMilestoneIds,
      }, messages);
      if (mounted.current) setMessages((m) => [...m, { id: nextId(), role: 'assistant', lang, ...reply }]);
    } catch {
      if (mounted.current) {
        setInput((draft) => draft || text);
        setMessages((m) => [...m, { id: nextId(), role: 'assistant', lang, text: t('chatError') }]);
      }
    } finally {
      sending.current = false;
      if (mounted.current) setLoading(false);
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
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<View style={[styles.bubble, styles.bubbleAssistant, { maxWidth: '100%' }]}><Text style={[styles.bubbleTextAssistant, { textAlign }]}>{t('chatIntro', { name: babyName })}</Text></View>}
        ListFooterComponent={messages.length === 0 ? <View style={{ gap: spacing.sm }}>
          {(['chatOverviewQuestion', ageMonths < 12 ? 'chatBabblingQuestion' : 'chatSpeechQuestion', 'chatRemainingQuestion'] as const).map((key) => <Pressable key={key} accessibilityRole="button" disabled={loading} onPress={() => handleSend(t(key))} style={{ padding: spacing.sm, backgroundColor: colors.chipBg, borderRadius: radii.sm }}><Text style={{ color: colors.primaryDark, textAlign }}>{t(key)}</Text></Pressable>)}
        </View> : null}
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
            <Text selectable style={[item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant, { textAlign: item.lang === 'ar' ? 'right' : 'left' }]}>
              {item.text}
            </Text>
            {item.source && <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: spacing.sm, textAlign }}>{t(item.connectionFailed ? 'chatConnectionFailed' : item.source === 'proxy' ? 'chatProxy' : 'chatLocal')}</Text>}
          </View>
        )}
      />
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator accessibilityLabel={t('chatThinking')} color={colors.primary} />
        </View>
      )}
      <View style={[styles.inputRow, { flexDirection: rowDir }]}>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading || !input.trim() }} style={[styles.sendButton, (loading || !input.trim()) && { opacity: 0.5 }]} onPress={() => handleSend()} disabled={loading || !input.trim()}>
          <Text style={styles.sendButtonText}>{t('sendButton')}</Text>
        </Pressable>
        <TextInput
          style={[styles.input, { textAlign }]}
          accessibilityLabel={t('chatPlaceholder')}
          maxLength={MAX_QUERY_LENGTH}
          value={input}
          onChangeText={setInput}
          placeholder={t('chatPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          onSubmitEditing={() => handleSend()}
          submitBehavior="submit"
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
