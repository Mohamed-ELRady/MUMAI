import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import StageDetailScreen from '../screens/StageDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LanguageToggleButton() {
  const { lang, toggleLang } = useLanguage();
  return (
    <Pressable onPress={toggleLang} style={styles.langButton} hitSlop={8}>
      <Text style={styles.langButtonText}>{lang === 'ar' ? 'EN' : 'AR'}</Text>
    </Pressable>
  );
}

export default function RootNavigator() {
  const { profile, isLoading } = useAppStore();
  const { t } = useLanguage();
  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={profile ? 'Home' : 'Onboarding'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerBackTitle: t('backButton'),
          headerRight: () => <LanguageToggleButton />,
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('appName') }} />
        <Stack.Screen name="StageDetail" component={StageDetailScreen} options={{ title: t('stageDetailTitle') }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: t('chatTitle') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  langButton: {
    backgroundColor: colors.chipBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langButtonText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
});
