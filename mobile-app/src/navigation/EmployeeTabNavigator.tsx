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
import NotificationsScreen from '../screens/common/NotificationsScreen';
import { Colors, FontSize } from '../constants/theme';
import { useNotificationStore } from '../store/useNotificationStore';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LeaveStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTitleStyle: { fontWeight: '600' as const, fontSize: FontSize.lg },
  headerShadowVisible: false,
  headerTintColor: Colors.text,
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen
        name="EmployeeDashboard"
        component={EmployeeDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <HomeStack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />
      <HomeStack.Screen
        name="LeaveApply"
        component={LeaveApplyScreen}
        options={{ title: 'Apply Leave' }}
      />
      <HomeStack.Screen
        name="LeaveStatus"
        component={LeaveStatusScreen}
        options={{ title: 'Leave Status' }}
      />
      <HomeStack.Screen
        name="SalarySlip"
        component={SalarySlipScreen}
        options={{ title: 'Salary Slips' }}
      />
      <HomeStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </HomeStack.Navigator>
  );
}

function LeaveStackNavigator() {
  return (
    <LeaveStack.Navigator screenOptions={screenOptions}>
      <LeaveStack.Screen
        name="LeaveStatusMain"
        component={LeaveStatusScreen}
        options={{ title: 'My Leaves' }}
      />
      <LeaveStack.Screen
        name="LeaveApply"
        component={LeaveApplyScreen}
        options={{ title: 'Apply Leave' }}
      />
    </LeaveStack.Navigator>
  );
}

export default function EmployeeTabNavigator() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

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
          };
          return (
            <Ionicons
              name={icons[route.name] || 'ellipse-outline'}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Leaves" component={LeaveStackNavigator} />
      <Tab.Screen
        name="Salary"
        component={SalarySlipScreen}
        options={{
          ...screenOptions,
          headerShown: true,
          title: 'Salary Slips',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          ...screenOptions,
          headerShown: true,
          title: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
}
