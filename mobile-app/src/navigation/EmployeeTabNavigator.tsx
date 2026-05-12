import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import EmployeeDashboardScreen from '../screens/employee/EmployeeDashboardScreen';
import AttendanceScreen from '../screens/employee/AttendanceScreen';
import LeaveApplyScreen from '../screens/employee/LeaveApplyScreen';
import LeaveStatusScreen from '../screens/employee/LeaveStatusScreen';
import SalarySlipScreen from '../screens/employee/SalarySlipScreen';
import ProfileScreen from '../screens/employee/ProfileScreen';
import DocumentsScreen from '../screens/employee/DocumentsScreen';
import EmployeeIdCardScreen from '../screens/employee/EmployeeIdCardScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import SupportScreen from '../screens/common/SupportScreen';
import ChatbotScreen from '../screens/common/ChatbotScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import PrivacyPolicyScreen from '../screens/common/PrivacyPolicyScreen';
import TermsScreen from '../screens/common/TermsScreen';
import OpenSourceLicensesScreen from '../screens/common/OpenSourceLicensesScreen';
import AboutScreen from '../screens/common/AboutScreen';
import DeleteAccountScreen from '../screens/common/DeleteAccountScreen';
import { Colors, FontSize } from '../constants/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LeaveStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTitleStyle: { fontWeight: '600' as const, fontSize: FontSize.lg },
  headerShadowVisible: false,
  headerTintColor: Colors.text,
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="EmployeeDashboard" component={EmployeeDashboardScreen} options={{ title: 'Dashboard' }} />
      <HomeStack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <HomeStack.Screen name="LeaveApply" component={LeaveApplyScreen} options={{ title: 'Apply Leave' }} />
      <HomeStack.Screen name="LeaveStatus" component={LeaveStatusScreen} options={{ title: 'Leave Status' }} />
      <HomeStack.Screen name="SalarySlip" component={SalarySlipScreen} options={{ title: 'Salary Slips' }} />
      <HomeStack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'My Documents' }} />
      <HomeStack.Screen name="IdCard" component={EmployeeIdCardScreen} options={{ title: 'My ID Card' }} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <HomeStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
      <HomeStack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'HR Assistant' }} />
    </HomeStack.Navigator>
  );
}

function LeaveStackNavigator() {
  return (
    <LeaveStack.Navigator screenOptions={screenOptions}>
      <LeaveStack.Screen name="LeaveStatusMain" component={LeaveStatusScreen} options={{ title: 'My Leaves' }} />
      <LeaveStack.Screen name="LeaveApply" component={LeaveApplyScreen} options={{ title: 'Apply Leave' }} />
    </LeaveStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={screenOptions}>
      <MoreStack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: 'Settings' }} />
      <MoreStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
      <MoreStack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'My Documents' }} />
      <MoreStack.Screen name="IdCard" component={EmployeeIdCardScreen} options={{ title: 'My ID Card' }} />
      <MoreStack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'HR Assistant' }} />
      <MoreStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <MoreStack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms of Service' }} />
      <MoreStack.Screen name="OpenSourceLicenses" component={OpenSourceLicensesScreen} options={{ title: 'Open-source Licenses' }} />
      <MoreStack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      <MoreStack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete Account' }} />
    </MoreStack.Navigator>
  );
}

export default function EmployeeTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: '500' },
        tabBarStyle: {
          borderTopColor: Colors.borderLight,
          backgroundColor: Colors.surface,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home-outline',
            Leaves: 'calendar-outline',
            Salary: 'wallet-outline',
            Profile: 'person-outline',
            More: 'menu-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Leaves" component={LeaveStackNavigator} />
      <Tab.Screen name="Salary" component={SalarySlipScreen} options={{ ...screenOptions, headerShown: true, title: 'Salary Slips' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ ...screenOptions, headerShown: true, title: 'My Profile' }} />
      <Tab.Screen name="More" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}
