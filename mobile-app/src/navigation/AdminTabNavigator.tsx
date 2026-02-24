import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EmployeesScreen from '../screens/admin/EmployeesScreen';
import LeaveManagementScreen from '../screens/admin/LeaveManagementScreen';
import AttendanceScreen from '../screens/employee/AttendanceScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import ProfileScreen from '../screens/employee/ProfileScreen';
import { Colors, FontSize } from '../constants/theme';
import { useNotificationStore } from '../store/useNotificationStore';

const Tab = createBottomTabNavigator();
const DashStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTitleStyle: { fontWeight: '600' as const, fontSize: FontSize.lg },
  headerShadowVisible: false,
  headerTintColor: Colors.text,
};

function DashStackNavigator() {
  return (
    <DashStack.Navigator screenOptions={screenOptions}>
      <DashStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <DashStack.Screen
        name="AdminEmployees"
        component={EmployeesScreen}
        options={{ title: 'Employees' }}
      />
      <DashStack.Screen
        name="AdminLeaves"
        component={LeaveManagementScreen}
        options={{ title: 'Leave Requests' }}
      />
      <DashStack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />
      <DashStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </DashStack.Navigator>
  );
}

export default function AdminTabNavigator() {
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
            Dashboard: 'grid-outline',
            Employees: 'people-outline',
            Leaves: 'document-text-outline',
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
      <Tab.Screen name="Dashboard" component={DashStackNavigator} />
      <Tab.Screen
        name="Employees"
        component={EmployeesScreen}
        options={{
          ...screenOptions,
          headerShown: true,
          title: 'Employees',
        }}
      />
      <Tab.Screen
        name="Leaves"
        component={LeaveManagementScreen}
        options={{
          ...screenOptions,
          headerShown: true,
          title: 'Leave Requests',
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
