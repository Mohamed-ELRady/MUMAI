import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { AGE_STAGES, MILESTONES } from '../data/milestones';
import { currentStageForAge, formatAge, stageIndex } from '../data/ageHelpers';
import { useAgeMonths } from '../data/useAgeMonths';
import { colors, spacing, radii } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { profile, completedMilestoneIds, milestoneStatuses } = useAppStore();
  const { t, pick, lang, isRTL } = useLanguage();
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const ageMonths = useAgeMonths(profile?.birthDateISO);
  const currentStage = useMemo(() => currentStageForAge(ageMonths), [ageMonths]);

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: rowDir, alignItems: 'center' }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { textAlign }]}>
            {t('trackingGrowthOf')} {profile.name}
          </Text>
          <Text style={[styles.ageText, { textAlign }]}>
            {t('currentAgeLabel')} {formatAge(ageMonths, lang)}
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Onboarding', { isEditing: true })} hitSlop={8}>
          <Text style={styles.editButtonText}>{t('editProfileButton')}</Text>
        </Pressable>
      </View>

      <Pressable accessibilityRole="button" style={styles.chatBanner} onPress={() => navigation.navigate('Chat')}>
        <Text style={[styles.chatBannerText, { textAlign }]}>{t('chatBanner')}</Text>
      </Pressable>

      <View style={[styles.actionRow, { flexDirection: rowDir }]}>
        <Pressable accessibilityRole="button" style={styles.actionCard} onPress={() => navigation.navigate('WeeklyPlan')}>
          <Text style={[styles.actionTitle, { textAlign }]}>{t('weeklyPlanCard')}</Text>
          <Text style={[styles.actionHint, { textAlign }]}>{t('weeklyPlanCardHint')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.actionCard} onPress={() => navigation.navigate('Report')}>
          <Text style={[styles.actionTitle, { textAlign }]}>{t('reportCard')}</Text>
          <Text style={[styles.actionHint, { textAlign }]}>{t('reportCardHint')}</Text>
        </Pressable>
      </View>

      <FlatList
        data={AGE_STAGES}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => {
          const stageMilestones = MILESTONES.filter((m) => m.ageStageId === item.id);
          const doneCount = stageMilestones.filter((m) => completedMilestoneIds.includes(m.id)).length;
          const recordedCount = stageMilestones.filter((m) => milestoneStatuses[m.id]).length;
          const isCurrent = item.id === currentStage.id;
          const isPast = stageIndex(item.id) < stageIndex(currentStage.id);
          const isFuture = item.minMonths > ageMonths;

          return (
            <Pressable
              disabled={isFuture}
              style={[
                styles.stageCard,
                { flexDirection: rowDir },
                isCurrent && styles.stageCardCurrent,
                isFuture && styles.stageCardDisabled,
              ]}
              onPress={() => !isFuture && navigation.navigate('StageDetail', { stageId: item.id })}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.stageLabel, { textAlign }, isFuture && styles.stageLabelDisabled]}>
                  {pick(item.label)}
                </Text>
                <Text style={[styles.stageProgress, { textAlign }]}>
                  {t('stageTrackingProgress', { recorded: recordedCount, total: stageMilestones.length, achieved: doneCount })}
                  {isFuture ? ` · ${t('notDueYet')}` : ''}
                </Text>
              </View>
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>{t('currentStageBadge')}</Text>
                </View>
              )}
              {isPast && doneCount < stageMilestones.length && <View style={styles.alertDot} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { marginBottom: spacing.md },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  ageText: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs },
  editButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  chatBanner: {
    backgroundColor: colors.chipBg,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chatBannerText: { color: colors.primaryDark, fontSize: 14, fontWeight: '600' },
  actionRow: { gap: spacing.sm, marginBottom: spacing.md },
  actionCard: { flex: 1, minHeight: 86, backgroundColor: '#EAF5F2', borderRadius: radii.md, borderWidth: 1, borderColor: '#CBE4DE', padding: spacing.md, justifyContent: 'center' },
  actionTitle: { color: '#39796C', fontSize: 15, fontWeight: '800' },
  actionHint: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs, lineHeight: 16 },
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  stageCardCurrent: { borderColor: colors.primary, borderWidth: 2 },
  stageCardDisabled: { opacity: 0.5 },
  stageLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  stageLabelDisabled: { color: colors.textMuted },
  stageProgress: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  currentBadge: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4, marginHorizontal: spacing.sm },
  currentBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  alertDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.warning, marginHorizontal: spacing.sm },
});
