import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAgeMonths } from '../data/useAgeMonths';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWeeklyPlan, planFocusLabel, weekKey } from '../services/weeklyPlan';
import { useAppStore } from '../store/AppStore';
import { colors, radii, spacing } from '../theme/theme';

export default function WeeklyPlanScreen() {
  const { profile, milestoneStatuses, weeklyActivityChecks, toggleWeeklyActivity } = useAppStore();
  const { t, pick, lang, isRTL } = useLanguage();
  const ageMonths = useAgeMonths(profile?.birthDateISO);
  const key = weekKey();
  const plan = useMemo(() => buildWeeklyPlan(ageMonths, milestoneStatuses), [ageMonths, milestoneStatuses]);
  const checked = weeklyActivityChecks[key] ?? [];
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.introCard}>
      <Text style={[styles.eyebrow, { textAlign }]}>{t('weeklyProgress', { done: checked.filter((id) => plan.some((item) => item.id === id)).length, total: plan.length })}</Text>
      <Text style={[styles.intro, { textAlign }]}>{t('weeklyPlanIntro')}</Text>
    </View>
    {plan.map((activity, index) => {
      const done = checked.includes(activity.id);
      return <View key={activity.id} style={[styles.card, done && styles.cardDone]}>
        <View style={[styles.cardHeader, { flexDirection: rowDir }]}>
          <View style={[styles.number, done && styles.numberDone]}><Text style={styles.numberText}>{index + 1}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.moment, { textAlign }]}>{pick(activity.moment)}</Text>
            <Text style={[styles.title, { textAlign }]}>{pick(activity.title)}</Text>
          </View>
        </View>
        <Text style={[styles.instruction, { textAlign }]}>{pick(activity.instruction)}</Text>
        <Text style={[styles.focus, { textAlign }]}>{t('weeklyFocus')} {planFocusLabel(activity, lang)}</Text>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: done }} onPress={() => toggleWeeklyActivity(key, activity.id)} style={[styles.doneButton, done && styles.doneButtonActive]}>
          <Text style={[styles.doneButtonText, done && styles.doneButtonTextActive]}>{done ? '✓ ' : ''}{t('weeklyDone')}</Text>
        </Pressable>
      </View>;
    })}
    <Text style={[styles.safety, { textAlign }]}>{t('weeklySafety')}</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg, paddingBottom: spacing.xl },
  introCard: { backgroundColor: '#EAF5F2', borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#CBE4DE' },
  eyebrow: { color: '#39796C', fontSize: 12, fontWeight: '800', marginBottom: spacing.sm }, intro: { color: colors.text, fontSize: 15, lineHeight: 23 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md },
  cardDone: { borderColor: colors.secondary, backgroundColor: '#F8FCFB' }, cardHeader: { alignItems: 'center', marginBottom: spacing.sm },
  number: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.sm },
  numberDone: { backgroundColor: colors.secondary }, numberText: { color: colors.text, fontWeight: '800' }, moment: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 2 }, instruction: { color: colors.text, lineHeight: 22, fontSize: 14 },
  focus: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm }, doneButton: { borderWidth: 1, borderColor: colors.secondary, borderRadius: radii.pill, paddingVertical: 9, alignItems: 'center', marginTop: spacing.md },
  doneButtonActive: { backgroundColor: colors.secondary }, doneButtonText: { color: '#39796C', fontWeight: '700' }, doneButtonTextActive: { color: '#fff' },
  safety: { color: colors.textMuted, fontSize: 12, lineHeight: 19, padding: spacing.sm },
});
