import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider } from './src/store/AppStore';
import { LanguageProvider } from './src/i18n/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppStoreProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AppStoreProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
