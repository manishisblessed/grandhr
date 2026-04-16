import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { ADMIN_ROLES } from '../constants/config';
import AuthNavigator from './AuthNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import EmployeeTabNavigator from './EmployeeTabNavigator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConsentGate from '../components/common/ConsentGate';
import IdleWatcher from '../components/common/IdleWatcher';
import AppLockGate from '../components/common/AppLockGate';

export default function AppNavigator() {
  const { user, isAuthenticated, isInitialized, initialize } = useAuthStore();
  const fetchNotifications = useNotificationStore((s) => s.fetch);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isInitialized) {
    return <LoadingSpinner message="Loading..." />;
  }

  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role);

  return (
    <ConsentGate>
      <IdleWatcher>
        <View style={{ flex: 1 }}>
          <NavigationContainer>
            {!isAuthenticated ? (
              <AuthNavigator />
            ) : isAdmin ? (
              <AdminTabNavigator />
            ) : (
              <EmployeeTabNavigator />
            )}
          </NavigationContainer>
          {isAuthenticated && <AppLockGate />}
        </View>
      </IdleWatcher>
    </ConsentGate>
  );
}
