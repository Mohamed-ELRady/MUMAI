export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  StageDetail: { stageId: string };
  Chat: { stageId?: string } | undefined;
};
