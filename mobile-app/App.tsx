import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { ToastProvider } from './src/components/common/Toast';
import { Telemetry } from './src/services/telemetry';

export default function App() {
  useEffect(() => {
    Telemetry.init();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </ToastProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
