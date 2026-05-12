import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { ToastProvider } from './src/components/common/Toast';
import OfflineBanner from './src/components/common/OfflineBanner';
import PushManager from './src/components/common/PushManager';
import { Telemetry } from './src/services/telemetry';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  useEffect(() => {
    Telemetry.init();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <ThemedStatusBar />
            <AppNavigator />
            <PushManager />
            <OfflineBanner />
          </ToastProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
