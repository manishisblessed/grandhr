import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CompanyOnboardingScreen from '../screens/auth/CompanyOnboardingScreen';
import { Flags } from '../constants/flags';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  CompanyOnboarding: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      {Flags.allowCompanySignup && (
        <>
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="CompanyOnboarding" component={CompanyOnboardingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
