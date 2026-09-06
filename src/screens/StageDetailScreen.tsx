import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { AGE_STAGES, MILESTONES, RED_FLAGS, DOMAIN_LABELS, Domain } from '../data/milestones';
import { colors, spacing, radii, severityColors, severityStringKey } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'StageDetail'>;

const DOMAIN_ORDER: Domain[] = ['gross_motor', 'fine_motor', 'language', 'social_emotional', 'cognitive'];

export default function StageDetailScreen({ route, navigation }: Props) {
  const { stageId } = route.params;
  const stage = AGE_STAGES.find((s) => s.id === stageId);
  const { completedMilestoneIds, toggleMilestone } = useAppStore();
  const { t, pick, isRTL } = useLanguage();
  const [showRedFlags, setShowRedFlags] = useState(false);
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const milestonesByDomain = useMemo(() => {
    const map: Partial<Record<Domain, typeof MILESTONES>> = {};
    for (const d of DOMAIN_ORDER) {
      map[d] = MILESTONES.filter((m) => m.ageStageId === stageId && m.domain === d);
    }
    return map;
  }, [stageId]);

  const redFlags = RED_FLAGS.filter((rf) => rf.ageStageId === stageId);
  const unmetCount = MILESTONES.filter(
    (m) => m.ageStageId === stageId && !completedMilestoneIds.includes(m.id)
  ).length;

  if (!stage) return <View style={{ padding: spacing.lg }}><Text style={{ textAlign }}>{t('invalidStage')}</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={[styles.title, { textAlign }]}>{pick(stage.label)}</Text>
      <Text style={[styles.subtitle, { textAlign }]}>{t('stageDetailSubtitle')}</Text>

      {DOMAIN_ORDER.map((domain) => {
        const list = milestonesByDomain[domain] ?? [];
        if (list.length === 0) return null;
        return (
          <View key={domain} style={styles.domainSection}>
            <Text style={[styles.domainTitle, { textAlign }]}>{pick(DOMAIN_LABELS[domain])}</Text>
            {list.map((m) => {
              const done = completedMilestoneIds.includes(m.id);
              return (
                <Pressable
                  key={m.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  accessibilityLabel={pick(m.title)}
                  style={[styles.milestoneRow, { flexDirection: rowDir }]}
                  onPress={() => toggleMilestone(m.id)}
                >
                  <View style={[styles.checkbox, done && styles.checkboxDone]}>
                    {done && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.milestoneText, { textAlign }, done && styles.milestoneTextDone]}>
                    {pick(m.title)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      {unmetCount > 0 && (
        <Pressable style={styles.askButton} onPress={() => navigation.navigate('Chat', { stageId, askRemaining: true })}>
          <Text style={styles.askButtonText}>{t('askAboutRemaining', { n: unmetCount })}</Text>
        </Pressable>
      )}

      {redFlags.length > 0 && (
        <View style={styles.redFlagsSection}>
          <Pressable onPress={() => setShowRedFlags((v) => !v)}>
            <Text style={[styles.redFlagsToggle, { textAlign }]}>
              {t(showRedFlags ? 'hideRedFlags' : 'showRedFlags', { n: redFlags.length })}
            </Text>
          </Pressable>
          {showRedFlags &&
            redFlags.map((rf) => (
              <View key={rf.id} style={styles.redFlagCard}>
                <View style={[styles.redFlagHeader, { flexDirection: rowDir }]}>
                  <View style={[styles.severityDot, { backgroundColor: severityColors[rf.severity] }]} />
                  <Text style={[styles.redFlagSign, { textAlign }]}>{pick(rf.warningSign)}</Text>
                </View>
                <Text style={[styles.redFlagMeta, { textAlign }]}>
                  {t('possibleCausesLabel')} {rf.possibleCauses.map((c) => pick(c)).join(isRTL ? '، ' : ', ')}
                </Text>
                <Text style={[styles.redFlagMeta, { textAlign }]}>
                  {t('assessmentLabel')} {t(severityStringKey[rf.severity])}
                </Text>
                <Text style={[styles.redFlagMeta, { textAlign }]}>
                  {t('specialistLabel')} {pick(rf.specialist)}
                </Text>
                {!!rf.notes && (
                  <Text style={[styles.redFlagNotes, { textAlign }]}>{pick(rf.notes)}</Text>
                )}
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  domainSection: { marginBottom: spacing.lg },
  domainTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryDark, marginBottom: spacing.sm },
  milestoneRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  checkboxDone: { backgroundColor: colors.primary },
  checkmark: { color: '#fff', fontWeight: '700' },
  milestoneText: { flex: 1, fontSize: 14, color: colors.text },
  milestoneTextDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  askButton: {
    backgroundColor: colors.chipBg,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  askButtonText: { color: colors.primaryDark, fontWeight: '700' },
  redFlagsSection: { marginTop: spacing.sm },
  redFlagsToggle: { color: colors.textMuted, marginBottom: spacing.sm, fontWeight: '600' },
  redFlagCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  redFlagHeader: { alignItems: 'center', marginBottom: spacing.xs },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: spacing.xs },
  redFlagSign: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 },
  redFlagMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  redFlagNotes: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs, fontStyle: 'italic' },
});
