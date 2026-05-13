import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EmployeesScreen from '../screens/admin/EmployeesScreen';
import LeaveManagementScreen from '../screens/admin/LeaveManagementScreen';
import AutomationScreen from '../screens/admin/AutomationScreen';
import AttendanceScreen from '../screens/employee/AttendanceScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import SupportScreen from '../screens/common/SupportScreen';
import ChatbotScreen from '../screens/common/ChatbotScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import PrivacyPolicyScreen from '../screens/common/PrivacyPolicyScreen';
import TermsScreen from '../screens/common/TermsScreen';
import OpenSourceLicensesScreen from '../screens/common/OpenSourceLicensesScreen';
import AboutScreen from '../screens/common/AboutScreen';
import DeleteAccountScreen from '../screens/common/DeleteAccountScreen';
import ProfileScreen from '../screens/employee/ProfileScreen';
import DocumentsScreen from '../screens/employee/DocumentsScreen';
import SalarySlipScreen from '../screens/employee/SalarySlipScreen';
import { FontSize, ThemeColors } from '../constants/theme';
import { useColors } from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator();
const DashStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

const buildScreenOptions = (Colors: ThemeColors) => ({
  headerStyle: { backgroundColor: Colors.surface },
  headerTitleStyle: { fontWeight: '600' as const, fontSize: FontSize.lg },
  headerShadowVisible: false,
  headerTintColor: Colors.text,
});

function DashStackNavigator() {
  const Colors = useColors();
  const screenOptions = buildScreenOptions(Colors);
  return (
    <DashStack.Navigator screenOptions={screenOptions}>
      <DashStack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <DashStack.Screen name="AdminEmployees" component={EmployeesScreen} options={{ title: 'Employees' }} />
      <DashStack.Screen name="AdminLeaves" component={LeaveManagementScreen} options={{ title: 'Leave Requests' }} />
      <DashStack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <DashStack.Screen name="Automation" component={AutomationScreen} options={{ title: 'Automation' }} />
      <DashStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <DashStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
      <DashStack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'HR Assistant' }} />
    </DashStack.Navigator>
  );
}

function MoreStackNavigator() {
  const Colors = useColors();
  const screenOptions = buildScreenOptions(Colors);
  return (
    <MoreStack.Navigator screenOptions={screenOptions}>
      <MoreStack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: 'Settings' }} />
      <MoreStack.Screen name="SalarySlip" component={SalarySlipScreen} options={{ title: 'Salary Slips' }} />
      <MoreStack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Documents' }} />
      <MoreStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
      <MoreStack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'HR Assistant' }} />
      <MoreStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <MoreStack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms of Service' }} />
      <MoreStack.Screen name="OpenSourceLicenses" component={OpenSourceLicensesScreen} options={{ title: 'Open-source Licenses' }} />
      <MoreStack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      <MoreStack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete Account' }} />
    </MoreStack.Navigator>
  );
}

export default function AdminTabNavigator() {
  const Colors = useColors();
  const screenOptions = buildScreenOptions(Colors);
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
            Dashboard: 'grid-outline',
            Employees: 'people-outline',
            Leaves: 'document-text-outline',
            Profile: 'person-outline',
            More: 'menu-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashStackNavigator} />
      <Tab.Screen name="Employees" component={EmployeesScreen} options={{ ...screenOptions, headerShown: true, title: 'Employees' }} />
      <Tab.Screen name="Leaves" component={LeaveManagementScreen} options={{ ...screenOptions, headerShown: true, title: 'Leave Requests' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ ...screenOptions, headerShown: true, title: 'My Profile' }} />
      <Tab.Screen name="More" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}
