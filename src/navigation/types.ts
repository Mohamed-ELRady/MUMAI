export type RootStackParamList = {
  Onboarding: { isEditing?: boolean } | undefined;
  Home: undefined;
  StageDetail: { stageId: string };
  Chat: { stageId?: string } | undefined;
};
