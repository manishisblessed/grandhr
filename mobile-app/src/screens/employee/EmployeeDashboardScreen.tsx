import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../components/common/Toast';
import StatCard from '../../components/dashboard/StatCard';
import QuickAction from '../../components/dashboard/QuickAction';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import Sparkline from '../../components/charts/Sparkline';
import { useAuthStore } from '../../store/useAuthStore';
import { DashboardService } from '../../services/dashboard.service';
import { AttendanceService } from '../../services/attendance.service';
import {
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
  ThemeColors,
} from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { LEAVE_STATUS_COLORS } from '../../constants/config';
import {
  getGreeting,
  formatDate,
  formatTime,
  getRoleLabel,
} from '../../utils/formatters';
import { DashboardStats, Attendance } from '../../types';

export default function EmployeeDashboardScreen() {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation<any>();
  const toast = useToast();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(
    null,
  );
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
    if (clockingIn) return;
    setClockingIn(true);
    try {
      if (!todayAttendance?.clockIn) {
        const res = await AttendanceService.clockIn();
        setTodayAttendance(res.data);
        toast.success('Clocked in');
      } else if (!todayAttendance?.clockOut) {
        const res = await AttendanceService.clockOut();
        setTodayAttendance(res.data);
        toast.success('Clocked out');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not update attendance');
    } finally {
      setClockingIn(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const firstName = user?.employee?.firstName || user?.name || 'there';
  const empId = user?.employee?.employeeId || '—';
  const leaveBalance =
    stats?.leaveBalance?.reduce((sum, b) => sum + b.balance, 0) ?? 0;
  const presentDays =
    stats?.recentAttendance?.filter((a) => a.status === 'PRESENT').length ?? 0;
  const totalRecent = stats?.recentAttendance?.length ?? 0;
  const presentPct = totalRecent > 0 ? (presentDays / totalRecent) * 100 : 0;
  const leavePct = Math.min(100, (leaveBalance / 24) * 100);

  const clockLabel = !todayAttendance?.clockIn
    ? 'Clock In'
    : !todayAttendance?.clockOut
      ? 'Clock Out'
      : 'Completed';

  const clockColor = !todayAttendance?.clockIn
    ? Colors.warning
    : !todayAttendance?.clockOut
      ? Colors.success
      : Colors.info;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Hero */}
      <LinearGradient
        colors={Gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Badge
          label={`Hi ${firstName}!`}
          variant="gradient"
          gradient="brand"
          size="sm"
          icon={
            <Ionicons name="sparkles" size={12} color="#fff" />
          }
          style={{ marginBottom: Spacing.md }}
        />
        <Text style={styles.heroTitle}>Welcome to your workplace</Text>
        <Text style={styles.heroSubtitle}>
          Employee ID{' '}
          <Text style={styles.heroId}>{empId}</Text>
          {'  '}— {getGreeting()}. Punch in for the day, view documents, or apply for leave.
        </Text>

        <View style={styles.heroActions}>
          <Button
            title={clockLabel === 'Completed' ? 'Done for today' : clockLabel}
            variant="gradient"
            gradient="brand"
            icon={
              <Ionicons
                name={
                  !todayAttendance?.clockIn
                    ? 'log-in-outline'
                    : !todayAttendance?.clockOut
                      ? 'log-out-outline'
                      : 'checkmark-circle-outline'
                }
                size={16}
                color="#fff"
              />
            }
            onPress={handleClockAction}
            loading={clockingIn}
            disabled={clockLabel === 'Completed'}
          />
          <Button
            title="Apply leave"
            variant="outline"
            icon={
              <Ionicons name="airplane-outline" size={16} color={Colors.text} />
            }
            onPress={() => navigation.navigate('LeaveApply')}
          />
        </View>
      </LinearGradient>

      {/* Today's attendance card */}
      <Card style={styles.clockCard} variant="elevated">
        <View style={styles.clockRow}>
          <View>
            <Text style={styles.clockLabel}>Today's Attendance</Text>
            <Text style={styles.clockDate}>
              {formatDate(new Date().toISOString())}
            </Text>
          </View>
          <Badge label={clockLabel} color={clockColor} />
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
      </Card>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        {loading ? (
          <>
            <Skeleton height={120} radius={BorderRadius.lg} style={{ flex: 1 }} />
            <Skeleton height={120} radius={BorderRadius.lg} style={{ flex: 1 }} />
          </>
        ) : (
          <>
            <StatCard
              title="Present days"
              value={`${presentDays}${totalRecent ? ` / ${totalRecent}` : ''}`}
              subtitle="this period"
              icon="checkmark-circle-outline"
              gradient="emeraldTeal"
              progress={presentPct}
            />
            <StatCard
              title="Leave balance"
              value={leaveBalance}
              subtitle="days remaining"
              icon="airplane-outline"
              gradient="amberOrange"
              progress={leavePct}
            />
          </>
        )}
      </View>

      {/* Quick links */}
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.quickGrid}>
        <QuickAction
          title="Apply Leave"
          icon="add-circle-outline"
          gradient="violetIndigo"
          onPress={() => navigation.navigate('LeaveApply')}
        />
        <QuickAction
          title="My Leaves"
          icon="list-outline"
          gradient="pinkRose"
          onPress={() => navigation.navigate('LeaveStatus')}
        />
        <QuickAction
          title="Attendance"
          icon="time-outline"
          gradient="emeraldTeal"
          onPress={() => navigation.navigate('Attendance')}
        />
        <QuickAction
          title="Salary Slips"
          icon="wallet-outline"
          gradient="amberOrange"
          onPress={() => navigation.navigate('SalarySlip')}
        />
      </View>
      <View style={styles.quickGrid}>
        <QuickAction
          title="ID Card"
          icon="card-outline"
          gradient="brand"
          onPress={() => navigation.navigate('IdCard')}
        />
        <QuickAction
          title="Documents"
          icon="document-text-outline"
          gradient="cyanSky"
          onPress={() => navigation.navigate('Documents')}
        />
        <QuickAction
          title="HR Bot"
          icon="chatbubble-ellipses-outline"
          gradient="violetIndigoSoft"
          onPress={() => navigation.navigate('Chatbot')}
        />
        <QuickAction
          title="Support"
          icon="headset-outline"
          gradient="redOrange"
          onPress={() => navigation.navigate('Support')}
        />
      </View>

      {/* Attendance trend sparkline */}
      {stats?.recentAttendance && stats.recentAttendance.length > 1 && (
        <Card>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>Your activity</Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                Hours logged in recent attendance
              </Text>
            </View>
            <Badge
              label={`${presentDays}/${totalRecent} days`}
              color={Colors.success}
              size="sm"
            />
          </View>
          <View style={{ marginTop: Spacing.md, alignItems: 'center' }}>
            <Sparkline
              data={stats.recentAttendance
                .slice(0, 14)
                .reverse()
                .map((a) => a.totalHours || 0)}
              width={300}
              height={64}
              stroke={Colors.primary}
            />
          </View>
        </Card>
      )}

      {/* Upcoming leaves */}
      {stats?.upcomingLeaves && stats.upcomingLeaves.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Upcoming leaves</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LeaveStatus')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <Card padding="none" style={{ overflow: 'hidden' }}>
            {stats.upcomingLeaves.slice(0, 3).map((leave, idx) => (
              <View
                key={leave.id}
                style={[
                  styles.leaveRow,
                  idx > 0 && {
                    borderTopWidth: 1,
                    borderTopColor: Colors.borderLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.leaveIcon,
                    { backgroundColor: Colors.primary + '15' },
                  ]}
                >
                  <Ionicons
                    name="airplane-outline"
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaveType}>
                    {leave.type.replace(/_/g, ' ').toLowerCase()}
                  </Text>
                  <Text style={styles.leaveDates}>
                    {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                  </Text>
                </View>
                <Badge
                  label={leave.status}
                  color={LEAVE_STATUS_COLORS[leave.status]}
                  size="sm"
                />
              </View>
            ))}
          </Card>
        </>
      )}

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  heroId: { fontWeight: '700', color: Colors.text },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },

  clockCard: {},
  clockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  clockLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  clockDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clockTimes: { flexDirection: 'row', alignItems: 'center' },
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

  statsRow: { flexDirection: 'row', gap: Spacing.md },

  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },

  quickGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  leaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  leaveIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveType: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  leaveDates: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
