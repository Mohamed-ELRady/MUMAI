export const colors = {
  background: '#FFF8F3',
  surface: '#FFFFFF',
  primary: '#A84F45',
  primaryDark: '#7E352F',
  secondary: '#2F6F64',
  text: '#3A2E2A',
  textMuted: '#6B5F5A',
  border: '#F0E4DD',
  success: '#2F6F50',
  warning: '#855600',
  urgent: '#A82E2A',
  chipBg: '#FBEAE4',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const severityColors: Record<string, string> = {
  normal_variant_possible: colors.success,
  needs_evaluation: colors.warning,
  urgent: colors.urgent,
};

export const severityStringKey = {
  normal_variant_possible: 'severityNormalVariant',
  needs_evaluation: 'severityNeedsEvaluation',
  urgent: 'severityUrgent',
} as const;
