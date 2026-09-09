export type RootStackParamList = {
  Onboarding: { isEditing?: boolean } | undefined;
  Home: undefined;
  StageDetail: { stageId: string };
  Chat: { stageId?: string; askRemaining?: boolean } | undefined;
  WeeklyPlan: undefined;
  Report: undefined;
};
