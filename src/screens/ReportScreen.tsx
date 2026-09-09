import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { currentStageForAge } from '../data/ageHelpers';
import { useAgeMonths } from '../data/useAgeMonths';
import { DOMAIN_LABELS, MILESTONES } from '../data/milestones';
import { useLanguage } from '../i18n/LanguageContext';
import { generateReportHtml, statusCounts } from '../services/reportService';
import { useAppStore } from '../store/AppStore';
import { colors, radii, spacing } from '../theme/theme';

export default function ReportScreen() {
  const { profile, milestoneStatuses, observations, savedQuestions, addObservation, removeObservation } = useAppStore();
  const { t, pick, lang, isRTL } = useLanguage();
  const ageMonths = useAgeMonths(profile?.birthDateISO);
  const [note, setNote] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(false);
  const stage = currentStageForAge(ageMonths);
  const counts = statusCounts(milestoneStatuses, stage.id);
  const currentMilestones = useMemo(() => MILESTONES.filter((item) => item.ageStageId === stage.id), [stage.id]);
  const textAlign = isRTL ? 'right' : 'left';

  function saveNote() {
    if (!note.trim()) return;
    addObservation(note);
    setNote('');
  }

  async function exportReport() {
    if (!profile || working) return;
    setWorking(true); setError(false);
    const html = generateReportHtml({ profile, ageMonths, lang, milestoneStatuses, observations, savedQuestions });
    try {
      if (Platform.OS === 'web') await Print.printAsync({ html });
      else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf', dialogTitle: t('reportTitle') });
        else await Print.printAsync({ html });
      }
    } catch { setError(true); } finally { setWorking(false); }
  }

  if (!profile) return null;
  return <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.summaryCard}>
      <Text style={[styles.title, { textAlign }]}>{profile.name} · {pick(stage.label)}</Text>
      <Text style={[styles.intro, { textAlign }]}>{t('reportIntro')}</Text>
      <Text style={[styles.counts, { textAlign }]}>{t('reportCounts', { done: counts.achieved, emerging: counts.emerging, notObserved: counts.notObserved })}</Text>
    </View>

    <View style={styles.statusList}>
      {currentMilestones.map((item) => {
        const status = milestoneStatuses[item.id];
        const label = status === 'achieved' ? t('statusAchieved') : status === 'emerging' ? t('statusEmerging') : status === 'not_observed' ? t('statusNotObserved') : '—';
        return <View key={item.id} style={[styles.statusRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={{ flex: 1 }}><Text style={[styles.skill, { textAlign }]}>{pick(item.title)}</Text><Text style={[styles.domain, { textAlign }]}>{pick(DOMAIN_LABELS[item.domain])}</Text></View>
          <Text style={[styles.statusLabel, status === 'achieved' ? styles.achieved : status === 'emerging' ? styles.emerging : status === 'not_observed' ? styles.notObserved : styles.unrecorded]}>{label}</Text>
        </View>;
      })}
    </View>

    <Text style={[styles.sectionTitle, { textAlign }]}>{t('reportObservations')}</Text>
    <TextInput accessibilityLabel={t('reportObservationPlaceholder')} value={note} onChangeText={setNote} placeholder={t('reportObservationPlaceholder')} placeholderTextColor={colors.textMuted} multiline maxLength={1000} style={[styles.noteInput, { textAlign }]} />
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !note.trim() }} disabled={!note.trim()} onPress={saveNote} style={[styles.addButton, !note.trim() && styles.disabled]}><Text style={styles.addButtonText}>{t('reportAddObservation')}</Text></Pressable>
    {observations.length === 0 ? <Text style={[styles.empty, { textAlign }]}>{t('reportNoObservations')}</Text> : observations.slice().reverse().map((item) => <View key={item.id} style={styles.noteCard}>
      <Text style={[styles.noteDate, { textAlign }]}>{new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</Text>
      <Text style={[styles.noteText, { textAlign }]}>{item.text}</Text>
      <Pressable accessibilityRole="button" onPress={() => removeObservation(item.id)} hitSlop={8}><Text style={[styles.delete, { textAlign }]}>{t('reportDeleteObservation')}</Text></Pressable>
    </View>)}

    <Text style={[styles.sectionTitle, { textAlign }]}>{t('reportQuestions')}</Text>
    {savedQuestions.length === 0 ? <Text style={[styles.empty, { textAlign }]}>{t('reportNoQuestions')}</Text> : savedQuestions.slice().reverse().map((item) => <View key={item.id} style={styles.questionCard}>
      <Text style={[styles.noteDate, { textAlign }]}>{new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</Text>
      <Text style={[styles.noteText, { textAlign }]}>{item.text}</Text>
    </View>)}

    <Text style={[styles.disclaimer, { textAlign }]}>{t('reportDisclaimer')}</Text>
    {error && <Text accessibilityRole="alert" style={[styles.error, { textAlign }]}>{t('reportExportError')}</Text>}
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: working }} disabled={working} onPress={exportReport} style={[styles.exportButton, working && styles.disabled]}>
      {working ? <ActivityIndicator color="#fff" /> : <Text style={styles.exportText}>{t(Platform.OS === 'web' ? 'reportExport' : 'reportShare')}</Text>}
    </Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg, paddingBottom: spacing.xl },
  summaryCard: { backgroundColor: '#3A5F59', borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' }, intro: { color: '#E8F3F0', fontSize: 13, lineHeight: 20, marginTop: spacing.sm },
  counts: { color: '#fff', fontWeight: '700', marginTop: spacing.md }, statusList: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  statusRow: { alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }, skill: { color: colors.text, fontSize: 13, fontWeight: '600' },
  domain: { color: colors.textMuted, fontSize: 11, marginTop: 2 }, statusLabel: { fontSize: 11, fontWeight: '800', marginHorizontal: spacing.sm, maxWidth: 110 },
  achieved: { color: colors.success }, emerging: { color: '#9A6917' }, notObserved: { color: colors.urgent }, unrecorded: { color: colors.textMuted },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.sm },
  noteInput: { minHeight: 96, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, color: colors.text, textAlignVertical: 'top' },
  addButton: { alignSelf: 'flex-start', backgroundColor: colors.secondary, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 10, marginTop: spacing.sm }, addButtonText: { color: '#fff', fontWeight: '800' },
  empty: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: spacing.lg }, noteCard: { backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: colors.secondary, padding: spacing.md, marginTop: spacing.md, borderRadius: radii.sm },
  noteDate: { color: colors.textMuted, fontSize: 11 }, noteText: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: spacing.xs }, delete: { color: colors.urgent, fontSize: 12, fontWeight: '700', marginTop: spacing.sm },
  questionCard: { backgroundColor: colors.chipBg, padding: spacing.md, marginTop: spacing.sm, borderRadius: radii.md },
  disclaimer: { color: colors.textMuted, fontSize: 12, lineHeight: 19, marginTop: spacing.xl }, error: { color: colors.urgent, marginTop: spacing.md },
  exportButton: { backgroundColor: colors.primaryDark, borderRadius: radii.md, alignItems: 'center', padding: spacing.md, marginTop: spacing.md }, exportText: { color: '#fff', fontWeight: '800' }, disabled: { opacity: 0.5 },
});
