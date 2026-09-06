import React from 'react';
import { Pressable, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <Pressable accessibilityRole="button" accessibilityLabel={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'} onPress={toggleLang} style={styles.langButton} hitSlop={8}>
      <Text style={styles.langButtonText}>{lang === 'ar' ? 'EN' : 'AR'}</Text>
    </Pressable>
  );
}

export default function RootNavigator() {
  const { profile, isLoading, storageError, retryStorage } = useAppStore();
  const { t, isLoading: languageLoading, isRTL } = useLanguage();
  if (isLoading || languageLoading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={storageError ? ['top', 'bottom'] : ['bottom']}>
      {storageError && <View style={{ padding: 12, backgroundColor: colors.chipBg }}>
        <Text accessibilityRole="alert" style={{ color: colors.text, textAlign: isRTL ? 'right' : 'left' }}>{t(storageError === 'load' ? 'storageLoadError' : 'storageSaveError')}</Text>
        <Pressable accessibilityRole="button" onPress={retryStorage}><Text style={{ color: colors.primaryDark, paddingTop: 8 }}>{t('retryButton')}</Text></Pressable>
      </View>}
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
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={({ route }) => ({
            headerShown: true,
            title: t(route.params?.isEditing ? 'editProfileTitle' : 'appName'),
          })}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('appName') }} />
        <Stack.Screen name="StageDetail" component={StageDetailScreen} options={{ title: t('stageDetailTitle') }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: t('chatTitle') }} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaView>
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
