import React from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, radii, spacing } from '../theme/theme';
import { childGenderLabel, genderizeChildText } from '../domain/child';

type Props = NativeStackScreenProps<RootStackParamList, 'Children'>;

export default function ChildrenScreen({ navigation }: Props) {
  const { children, activeChildId, switchChild, deleteChild } = useAppStore();
  const { t, lang, isRTL } = useLanguage();
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';
  function remove(id: string) {
    const target = children.find((child) => child.id === id);
    const message = genderizeChildText(t('deleteChildConfirm'), target?.profile.gender, lang);
    const action = () => { deleteChild(id); };
    if (Platform.OS === 'web') { if (window.confirm(message)) action(); }
    else Alert.alert('', message, [{ text: t('cancelButton'), style: 'cancel' }, { text: t('confirmButton'), style: 'destructive', onPress: action }]);
  }
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    {children.map((child) => <View key={child.id} style={[styles.card, child.id === activeChildId && styles.activeCard]}>
      <View style={{ flexDirection: rowDir, alignItems: 'center', gap: spacing.md }}>
        {child.profile.photoUri ? <Image source={{ uri: child.profile.photoUri }} style={styles.photo} /> : <View style={styles.placeholder}><Text>👶</Text></View>}
        <View style={{ flex: 1 }}><Text style={[styles.name, { textAlign }]}>{child.profile.name}</Text><Text style={[styles.date, { textAlign }]}>{child.profile.birthDateISO}{child.profile.gender ? ` · ${childGenderLabel(child.profile.gender, lang)}` : ''}</Text></View>
        {child.id === activeChildId && <Text style={styles.badge}>{t('activeChild')}</Text>}
      </View>
      <View style={[styles.actions, { flexDirection: rowDir }]}>
        {child.id !== activeChildId && <Pressable accessibilityRole="button" style={styles.select} onPress={() => { switchChild(child.id); if (child.profile.gender) navigation.navigate('Home'); }}><Text style={styles.selectText}>{t('switchChild')}</Text></Pressable>}
        <Pressable accessibilityRole="button" style={styles.delete} onPress={() => remove(child.id)}><Text style={styles.deleteText}>{t('deleteChild')}</Text></Pressable>
      </View>
    </View>)}
    <Pressable accessibilityRole="button" style={styles.add} onPress={() => navigation.navigate('Onboarding', { isAdding: true })}><Text style={styles.addText}>＋ {t('addAnotherChild')}</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.lg },
  card: { padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: spacing.md },
  activeCard: { borderColor: colors.primary, borderWidth: 2 }, photo: { width: 52, height: 52, borderRadius: 26 },
  placeholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.text, fontSize: 18, fontWeight: '800' }, date: { color: colors.textMuted, marginTop: 3 },
  badge: { color: '#fff', backgroundColor: colors.secondary, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radii.pill, fontSize: 11, fontWeight: '800' },
  actions: { marginTop: spacing.md, gap: spacing.sm }, select: { minHeight: 44, flex: 1, backgroundColor: colors.primary, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }, selectText: { color: '#fff', fontWeight: '800' },
  delete: { minHeight: 44, flex: 1, borderWidth: 1, borderColor: colors.urgent, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }, deleteText: { color: colors.urgent, fontWeight: '700' },
  add: { minHeight: 50, borderRadius: radii.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, addText: { color: colors.primaryDark, fontWeight: '800' },
});
