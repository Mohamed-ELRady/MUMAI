import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { exportBackup, pickBackup } from '../services/dataTransfer';
import { colors, radii, spacing } from '../theme/theme';
import { genderizeChildText } from '../domain/child';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

function confirm(message: string, cancel: string, ok: string, action: () => void) {
  if (Platform.OS === 'web') { if (window.confirm(message)) action(); return; }
  Alert.alert('', message, [{ text: cancel, style: 'cancel' }, { text: ok, style: 'destructive', onPress: action }]);
}

export default function PrivacyScreen({ navigation }: Props) {
  const { profile, exportData, importData, deleteAllData } = useAppStore();
  const { t, lang, isRTL } = useLanguage();
  const [notice, setNotice] = useState('');
  const textAlign = isRTL ? 'right' : 'left';

  async function handleExport() {
    try { await exportBackup(exportData()); setNotice(t('dataExported')); } catch { setNotice(t('dataImportError')); }
  }
  async function handleImport() {
    try {
      const raw = await pickBackup();
      if (raw === null) return;
      const success = importData(raw);
      setNotice(t(success ? 'dataImported' : 'dataImportError'));
      if (success) navigation.popToTop();
    } catch { setNotice(t('dataImportError')); }
  }
  function handleDelete() {
    confirm(t('deleteAllConfirm'), t('cancelButton'), t('confirmButton'), deleteAllData);
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.card}><Text style={[styles.intro, { textAlign }]}>{genderizeChildText(t('privacyIntro'), profile?.gender, lang)}</Text></View>
    <Pressable accessibilityRole="button" style={styles.button} onPress={handleExport}><Text style={styles.buttonText}>{t('exportData')}</Text></Pressable>
    <Pressable accessibilityRole="button" style={styles.button} onPress={handleImport}><Text style={styles.buttonText}>{t('importData')}</Text></Pressable>
    <Pressable accessibilityRole="button" style={styles.dangerButton} onPress={handleDelete}><Text style={styles.dangerText}>{t('deleteAllData')}</Text></Pressable>
    {!!notice && <Text accessibilityRole="alert" style={[styles.notice, { textAlign }]}>{notice}</Text>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  intro: { color: colors.text, fontSize: 15, lineHeight: 24 },
  button: { minHeight: 50, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  dangerButton: { minHeight: 50, borderRadius: radii.md, borderWidth: 1, borderColor: colors.urgent, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  dangerText: { color: colors.urgent, fontWeight: '800', fontSize: 15 },
  notice: { color: colors.secondary, fontWeight: '700', padding: spacing.sm },
});
