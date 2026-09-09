import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { AGE_STAGES, MILESTONES, RED_FLAGS, DOMAIN_LABELS, Domain } from '../data/milestones';
import { colors, spacing, radii, severityColors, severityStringKey } from '../theme/theme';
import { MilestoneStatus } from '../store/persistedState';

type Props = NativeStackScreenProps<RootStackParamList, 'StageDetail'>;

const DOMAIN_ORDER: Domain[] = ['gross_motor', 'fine_motor', 'language', 'social_emotional', 'cognitive'];

export default function StageDetailScreen({ route, navigation }: Props) {
  const { stageId } = route.params;
  const stage = AGE_STAGES.find((s) => s.id === stageId);
  const { milestoneStatuses, setMilestoneStatus } = useAppStore();
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
    (m) => m.ageStageId === stageId && milestoneStatuses[m.id] !== 'achieved'
  ).length;
  const choices: { status: MilestoneStatus; label: 'statusAchieved' | 'statusEmerging' | 'statusNotObserved' }[] = [
    { status: 'achieved', label: 'statusAchieved' }, { status: 'emerging', label: 'statusEmerging' }, { status: 'not_observed', label: 'statusNotObserved' },
  ];

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
              const selected = milestoneStatuses[m.id];
              return (
                <View key={m.id} style={styles.milestoneRow}>
                  <Text style={[styles.milestoneText, { textAlign }]}>{pick(m.title)}</Text>
                  <View accessibilityRole="radiogroup" style={[styles.statusRow, { flexDirection: rowDir }]}>
                    {choices.map((choice) => {
                      const active = selected === choice.status;
                      return <Pressable key={choice.status} accessibilityRole="radio" accessibilityState={{ selected: active }} accessibilityLabel={`${pick(m.title)}: ${t(choice.label)}`}
                        onPress={() => setMilestoneStatus(m.id, choice.status)} style={[styles.statusChip, active && styles[`status_${choice.status}`]]}>
                        <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>{t(choice.label)}</Text>
                      </Pressable>;
                    })}
                  </View>
                </View>
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
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  milestoneText: { fontSize: 14, color: colors.text, fontWeight: '600', marginBottom: spacing.sm },
  statusRow: { gap: spacing.xs },
  statusChip: { flex: 1, minHeight: 42, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, paddingVertical: spacing.xs },
  status_achieved: { backgroundColor: colors.success, borderColor: colors.success },
  status_emerging: { backgroundColor: colors.warning, borderColor: colors.warning },
  status_not_observed: { backgroundColor: colors.urgent, borderColor: colors.urgent },
  statusChipText: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  statusChipTextActive: { color: '#fff' },
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
