export const colors = {
  background: '#FFF8F3',
  surface: '#FFFFFF',
  primary: '#E88C7D',
  primaryDark: '#C96A5C',
  secondary: '#7FB3A8',
  text: '#3A2E2A',
  textMuted: '#8A7A74',
  border: '#F0E4DD',
  success: '#5FA87E',
  warning: '#E0A63A',
  urgent: '#D9534F',
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
