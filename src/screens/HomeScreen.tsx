import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const isCompact = width < 600;

  const ageMonths = useAgeMonths(profile?.birthDateISO);
  const currentStage = useMemo(() => currentStageForAge(ageMonths), [ageMonths]);
  useEffect(() => { if (!profile) navigation.replace('Onboarding'); }, [profile, navigation]);

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={AGE_STAGES}
        keyExtractor={(s) => s.id}
        style={styles.list}
        contentContainerStyle={[styles.listContent, isCompact && styles.listContentCompact]}
        ListHeaderComponent={(
          <View>
            <View style={[styles.header, { flexDirection: rowDir, alignItems: 'center' }]}>
              {profile.photoUri && <Image source={{ uri: profile.photoUri }} style={styles.profilePhoto} />}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.greeting, isCompact && styles.greetingCompact, { textAlign }]} numberOfLines={2}>
                  {t('trackingGrowthOf')} {profile.name}
                </Text>
                <Text style={[styles.ageText, { textAlign }]}>
                  {t('currentAgeLabel')} {formatAge(ageMonths, lang)}
                </Text>
                {profile.bloodType && <Text style={[styles.bloodType, { textAlign }]}>{t('bloodTypeValue', { type: profile.bloodType })}</Text>}
                {profile.isDemo && <Text style={[styles.demoBadge, { textAlign }]}>{t('demoBadge')}</Text>}
              </View>
              <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Onboarding', { isEditing: true })} hitSlop={8} style={styles.editButton}>
                <Text style={styles.editButtonText}>{t('editProfileButton')}</Text>
              </Pressable>
            </View>

            <Pressable accessibilityRole="button" style={styles.chatBanner} onPress={() => navigation.navigate('Chat')}>
              <Text style={[styles.chatBannerText, { textAlign }]}>{t('chatBanner')}</Text>
            </Pressable>

            <View style={[styles.actionRow, { flexDirection: rowDir }]}>
              <Pressable accessibilityRole="button" style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => navigation.navigate('WeeklyPlan')}>
                <Text style={[styles.actionTitle, { textAlign }]}>{t('weeklyPlanCard')}</Text>
                <Text style={[styles.actionHint, { textAlign }]}>{t('weeklyPlanCardHint')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => navigation.navigate('Report')}>
                <Text style={[styles.actionTitle, { textAlign }]}>{t('reportCard')}</Text>
                <Text style={[styles.actionHint, { textAlign }]}>{t('reportCardHint')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => navigation.navigate('Timeline')}>
                <Text style={[styles.actionTitle, { textAlign }]}>{t('timelineCard')}</Text>
                <Text style={[styles.actionHint, { textAlign }]}>{t('timelineCardHint')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => navigation.navigate('Children')}>
                <Text style={[styles.actionTitle, { textAlign }]}>{t('childrenCard')}</Text>
                <Text style={[styles.actionHint, { textAlign }]}>{t('childrenCardHint')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => navigation.navigate('Privacy')}>
                <Text style={[styles.actionTitle, { textAlign }]}>{t('privacyCard')}</Text>
                <Text style={[styles.actionHint, { textAlign }]}>{t('privacyCardHint')}</Text>
              </Pressable>
            </View>
            {profile.bloodType && <Text style={[styles.bloodDisclaimer, { textAlign }]}>{t('bloodTypeDisclaimer')}</Text>}
          </View>
        )}
        renderItem={({ item }) => {
          const stageMilestones = MILESTONES.filter((m) => m.ageStageId === item.id);
          const doneCount = stageMilestones.filter((m) => completedMilestoneIds.includes(m.id)).length;
          const recordedCount = stageMilestones.filter((m) => milestoneStatuses[m.id]).length;
          const isCurrent = item.id === currentStage.id;
          const isPast = stageIndex(item.id) < stageIndex(currentStage.id);
          const isFuture = item.minMonths > ageMonths;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isFuture }}
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
              {isPast && stageMilestones.some((m) => milestoneStatuses[m.id] === 'not_observed' || milestoneStatuses[m.id] === 'emerging') && <View style={styles.alertDot} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 980, alignSelf: 'center', backgroundColor: colors.background },
  header: { marginBottom: spacing.md },
  profilePhoto: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: colors.primary, marginHorizontal: spacing.sm },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  greetingCompact: { fontSize: 19 },
  ageText: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs },
  bloodType: { fontSize: 12, color: colors.secondary, fontWeight: '700', marginTop: 2 },
  demoBadge: { fontSize: 11, color: colors.primaryDark, fontWeight: '800', marginTop: 3 },
  editButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.xs },
  editButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  chatBanner: {
    backgroundColor: colors.chipBg,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chatBannerText: { color: colors.primaryDark, fontSize: 14, fontWeight: '600' },
  actionRow: { gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  actionCard: { flexGrow: 1, flexBasis: 170, minHeight: 92, backgroundColor: '#EAF5F2', borderRadius: radii.md, borderWidth: 1, borderColor: '#CBE4DE', padding: spacing.md, justifyContent: 'center' },
  actionCardCompact: { flexBasis: 145, minHeight: 88, padding: 12 },
  actionTitle: { color: colors.secondary, fontSize: 15, fontWeight: '800' },
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
  bloodDisclaimer: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginBottom: spacing.md },
  list: { width: '100%' },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  listContentCompact: { padding: spacing.md, paddingBottom: spacing.xl },
});
