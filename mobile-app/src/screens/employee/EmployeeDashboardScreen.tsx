import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../../components/dashboard/StatCard';
import QuickAction from '../../components/dashboard/QuickAction';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../store/useAuthStore';
import { DashboardService } from '../../services/dashboard.service';
import { AttendanceService } from '../../services/attendance.service';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { LEAVE_STATUS_COLORS } from '../../constants/config';
import { getGreeting, formatDate, formatTime, formatCurrency, getRoleLabel } from '../../utils/formatters';
import { DashboardStats, Attendance } from '../../types';

export default function EmployeeDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clockingIn, setClockingIn] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, attRes] = await Promise.all([
        DashboardService.getEmployeeStats(),
        AttendanceService.getMyAttendance({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
        }),
      ]);
      setStats(statsRes.data);
      const records = attRes.data as Attendance[];
      if (Array.isArray(records) && records.length > 0) {
        setTodayAttendance(records[0]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClockAction = async () => {
    setClockingIn(true);
    try {
      if (!todayAttendance?.clockIn) {
        const res = await AttendanceService.clockIn();
        setTodayAttendance(res.data);
        Alert.alert('Success', 'Clocked in successfully!');
      } else if (!todayAttendance?.clockOut) {
        const res = await AttendanceService.clockOut();
        setTodayAttendance(res.data);
        Alert.alert('Success', 'Clocked out successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed');
    } finally {
      setClockingIn(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const clockLabel = !todayAttendance?.clockIn
    ? 'Clock In'
    : !todayAttendance?.clockOut
      ? 'Clock Out'
      : 'Completed';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>
            {user?.employee?.firstName || user?.name || 'Employee'}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(user?.role || 'EMPLOYEE')} Dashboard</Text>
          </View>
        </View>
        <View style={styles.avatarWrap}>
          <Ionicons name="person" size={24} color={Colors.primary} />
        </View>
      </View>

      <Card style={styles.clockCard} variant="elevated">
        <View style={styles.clockRow}>
          <View>
            <Text style={styles.clockLabel}>Today's Attendance</Text>
            <Text style={styles.clockDate}>
              {formatDate(new Date().toISOString())}
            </Text>
          </View>
          <Badge
            label={clockLabel}
            color={
              !todayAttendance?.clockIn
                ? Colors.warning
                : !todayAttendance?.clockOut
                  ? Colors.success
                  : Colors.info
            }
          />
        </View>
        <View style={styles.clockTimes}>
          <View style={styles.clockTimeItem}>
            <Text style={styles.clockTimeLabel}>Clock In</Text>
            <Text style={styles.clockTimeValue}>
              {todayAttendance?.clockIn
                ? formatTime(todayAttendance.clockIn)
                : '--:--'}
            </Text>
          </View>
          <View style={styles.clockDivider} />
          <View style={styles.clockTimeItem}>
            <Text style={styles.clockTimeLabel}>Clock Out</Text>
            <Text style={styles.clockTimeValue}>
              {todayAttendance?.clockOut
                ? formatTime(todayAttendance.clockOut)
                : '--:--'}
            </Text>
          </View>
        </View>
        {(!todayAttendance?.clockIn || !todayAttendance?.clockOut) && (
          <View style={styles.clockBtnWrap}>
            <QuickAction
              title={!todayAttendance?.clockIn ? 'Clock In' : 'Clock Out'}
              icon={
                !todayAttendance?.clockIn ? 'log-in-outline' : 'log-out-outline'
              }
              color={!todayAttendance?.clockIn ? Colors.success : Colors.error}
              onPress={handleClockAction}
            />
          </View>
        )}
      </Card>

      <View style={styles.statsRow}>
        <StatCard
          title="Leave Balance"
          value={
            stats?.leaveBalance?.reduce((sum, b) => sum + b.balance, 0) ?? 0
          }
          icon="calendar-outline"
          color={Colors.info}
        />
        <StatCard
          title="Present Days"
          value={stats?.recentAttendance?.filter((a) => a.status === 'PRESENT').length ?? 0}
          icon="checkmark-circle-outline"
          color={Colors.success}
        />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <Card>
        <View style={styles.actionsGrid}>
          <QuickAction title="Apply Leave" icon="add-circle-outline" color={Colors.primary} onPress={() => navigation.navigate('LeaveApply')} />
          <QuickAction title="Leave Status" icon="list-outline" color={Colors.secondary} onPress={() => navigation.navigate('LeaveStatus')} />
          <QuickAction title="Attendance" icon="time-outline" color={Colors.success} onPress={() => navigation.navigate('Attendance')} />
          <QuickAction title="Salary Slips" icon="wallet-outline" color={Colors.warning} onPress={() => navigation.navigate('SalarySlip')} />
        </View>
        <View style={styles.actionsGrid}>
          <QuickAction title="Documents" icon="document-outline" color={Colors.info} onPress={() => navigation.navigate('Documents')} />
          <QuickAction title="Support" icon="chatbubbles-outline" color="#E11D48" onPress={() => navigation.navigate('Support')} />
          <QuickAction title="HR Bot" icon="chatbubble-ellipses-outline" color="#8B5CF6" onPress={() => navigation.navigate('Chatbot')} />
          <QuickAction title="Notifications" icon="notifications-outline" color="#F59E0B" onPress={() => navigation.navigate('Notifications')} />
        </View>
      </Card>

      {stats?.upcomingLeaves && stats.upcomingLeaves.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Leaves</Text>
          {stats.upcomingLeaves.slice(0, 3).map((leave) => (
            <Card key={leave.id} style={styles.leaveItem}>
              <View style={styles.leaveRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaveType}>{leave.type}</Text>
                  <Text style={styles.leaveDates}>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </Text>
                </View>
                <Badge
                  label={leave.status}
                  color={LEAVE_STATUS_COLORS[leave.status]}
                  size="sm"
                />
              </View>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  userName: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  roleBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockCard: { marginBottom: Spacing.lg },
  clockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  clockLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  clockDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clockTimes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockTimeItem: { flex: 1, alignItems: 'center' },
  clockTimeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  clockTimeValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  clockDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  clockBtnWrap: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  leaveItem: { marginBottom: Spacing.sm },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaveType: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  leaveDates: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
