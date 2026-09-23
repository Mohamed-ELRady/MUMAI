import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { MILESTONES } from '../data/milestones';
import { colors, radii, spacing } from '../theme/theme';
import { genderizeChildText } from '../domain/child';

export default function TimelineScreen() {
  const { profile, milestoneStatuses, milestoneUpdatedAt, observations } = useAppStore();
  const { t, pick, lang, isRTL } = useLanguage();
  const textAlign = isRTL ? 'right' : 'left';
  const events = useMemo(() => {
    const milestoneEvents = Object.entries(milestoneUpdatedAt).flatMap(([id, date]) => {
      const milestone = MILESTONES.find((item) => item.id === id); const status = milestoneStatuses[id];
      return milestone && status ? [{ id: `m-${id}`, date, title: genderizeChildText(pick(milestone.title), profile?.gender, lang), detail: genderizeChildText(t(status === 'achieved' ? 'statusAchieved' : status === 'emerging' ? 'statusEmerging' : 'statusNotObserved'), profile?.gender, lang) }] : [];
    });
    const notes = observations.map((note) => ({ id: `n-${note.id}`, date: note.createdAt, title: t('timelineObservation'), detail: note.text }));
    return [...milestoneEvents, ...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [milestoneStatuses, milestoneUpdatedAt, observations, profile?.gender, lang]);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    {!events.length && <Text style={[styles.empty, { textAlign }]}>{t('timelineEmpty')}</Text>}
    {events.map((event) => <View key={event.id} style={styles.card}><Text style={[styles.date, { textAlign }]}>{new Date(event.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</Text><Text style={[styles.title, { textAlign }]}>{event.title}</Text><Text style={[styles.detail, { textAlign }]}>{event.detail}</Text></View>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.lg },
  empty: { color: colors.textMuted, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  date: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' }, title: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: spacing.xs }, detail: { color: colors.textMuted, marginTop: spacing.xs, lineHeight: 20 },
});
