export type RootStackParamList = {
  Onboarding: { isEditing?: boolean; isAdding?: boolean } | undefined;
  Home: undefined;
  StageDetail: { stageId: string };
  Chat: { stageId?: string; askRemaining?: boolean } | undefined;
  WeeklyPlan: undefined;
  Report: undefined;
  Children: undefined;
  Timeline: undefined;
  Privacy: undefined;
};
