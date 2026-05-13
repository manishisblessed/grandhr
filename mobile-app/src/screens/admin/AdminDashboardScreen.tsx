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
import StatCard from '../../components/dashboard/StatCard';
import QuickAction from '../../components/dashboard/QuickAction';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import Donut from '../../components/charts/Donut';
import { useAuthStore } from '../../store/useAuthStore';
import { DashboardService } from '../../services/dashboard.service';
import { EmployeeService } from '../../services/employee.service';
import {
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
  ThemeColors,
} from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import {
  formatCurrency,
  formatDate,
  getInitials,
  getRoleLabel,
} from '../../utils/formatters';
import { DashboardStats, Employee } from '../../types';

const attendanceTrend = [
  { day: 'Mon', present: 92 },
  { day: 'Tue', present: 95 },
  { day: 'Wed', present: 88 },
  { day: 'Thu', present: 93 },
  { day: 'Fri', present: 90 },
  { day: 'Sat', present: 70 },
  { day: 'Sun', present: 12 },
];

const departmentSplit = [
  { name: 'Engineering', value: 42, color: '#8B5CF6' },
  { name: 'Sales', value: 26, color: '#6366F1' },
  { name: 'Operations', value: 18, color: '#06B6D4' },
  { name: 'HR & Admin', value: 14, color: '#F59E0B' },
];

export default function AdminDashboardScreen() {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, empRes] = await Promise.all([
        DashboardService.getAdminStats(),
        EmployeeService.getAll({ page: 1, limit: 6 }),
      ]);
      setStats(statsRes.data);
      const empPayload: any = empRes.data;
      const list: Employee[] = Array.isArray(empPayload)
        ? empPayload
        : empPayload?.employees || empPayload?.data || [];
      setEmployees(list);
      setTotalEmployees(
        empPayload?.pagination?.total ??
          statsRes.data?.totalEmployees ??
          list.length,
      );
    } catch {
      // silent
    } finally {
      setLoading(false);
      setEmpLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const firstName = user?.employee?.firstName || user?.name || 'there';
  const presentToday = stats?.presentToday ?? Math.max(0, totalEmployees - 8);
  const presentPct =
    totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const maxTrend = Math.max(...attendanceTrend.map((d) => d.present));

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
          label={todayLabel}
          variant="gradient"
          gradient="brand"
          size="sm"
          icon={<Ionicons name="sparkles" size={12} color="#fff" />}
          style={{ marginBottom: Spacing.md }}
        />
        <Text style={styles.heroTitle}>Hi {firstName}, welcome back</Text>
        <Text style={styles.heroSubtitle}>
          Your team has{' '}
          <Text style={styles.heroBold}>{totalEmployees} active employees</Text>{' '}
          today. Here's what's happening across the company.
        </Text>

        <View style={styles.heroActions}>
          <Button
            title="Add employee"
            variant="gradient"
            gradient="brand"
            icon={<Ionicons name="people-outline" size={16} color="#fff" />}
            onPress={() => navigation.navigate('AdminEmployees')}
          />
          <Button
            title="Approve leaves"
            variant="outline"
            icon={
              <Ionicons name="airplane-outline" size={16} color={Colors.text} />
            }
            onPress={() => navigation.navigate('AdminLeaves')}
          />
        </View>
      </LinearGradient>

      {/* KPIs */}
      <View style={styles.kpiGrid}>
        {loading ? (
          <>
            <Skeleton height={120} radius={BorderRadius.lg} style={{ flex: 1 }} />
            <Skeleton height={120} radius={BorderRadius.lg} style={{ flex: 1 }} />
          </>
        ) : (
          <>
            <StatCard
              title="Total employees"
              value={totalEmployees}
              subtitle="+12% this quarter"
              icon="people-outline"
              gradient="violetIndigo"
            />
            <StatCard
              title="Present today"
              value={presentToday}
              subtitle={`${presentPct}% attendance`}
              icon="checkmark-circle-outline"
              gradient="emeraldTeal"
            />
          </>
        )}
      </View>
      <View style={styles.kpiGrid}>
        {loading ? (
          <>
            <Skeleton height={120} radius={BorderRadius.lg} style={{ flex: 1 }} />
            <Skeleton height={120} radius={BorderRadius.lg} style={{ flex: 1 }} />
          </>
        ) : (
          <>
            <StatCard
              title="Leave requests"
              value={stats?.pendingLeaves ?? 0}
              subtitle="awaiting approval"
              icon="airplane-outline"
              gradient="amberOrange"
            />
            <StatCard
              title="Payroll month"
              value={
                stats?.totalPayroll
                  ? formatCurrency(stats.totalPayroll)
                  : '—'
              }
              subtitle="On track"
              icon="wallet-outline"
              gradient="pinkRose"
            />
          </>
        )}
      </View>

      {/* Attendance trend (custom bar chart) */}
      <Card>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Attendance this week</Text>
            <Text style={styles.cardDescription}>
              Daily present % across the company
            </Text>
          </View>
          <Badge
            label="+4.2% w/w"
            color={Colors.success}
            icon={
              <Ionicons name="trending-up" size={12} color={Colors.success} />
            }
            size="sm"
          />
        </View>
        <View style={styles.chartArea}>
          {attendanceTrend.map((d) => {
            const h = Math.max(8, (d.present / maxTrend) * 120);
            return (
              <View key={d.day} style={styles.chartCol}>
                <Text style={styles.chartValue}>{d.present}</Text>
                <View style={styles.chartBarTrack}>
                  <LinearGradient
                    colors={Gradients.violetIndigo}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[styles.chartBar, { height: h }]}
                  />
                </View>
                <Text style={styles.chartLabel}>{d.day}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Workforce mix */}
      <Card>
        <Text style={styles.cardTitle}>Workforce mix</Text>
        <Text style={styles.cardDescription}>By department</Text>
        <View style={{ marginTop: Spacing.md, alignItems: 'center' }}>
          <Donut
            segments={departmentSplit.map((d) => ({
              label: d.name,
              value: d.value,
              color: d.color,
            }))}
            size={170}
            thickness={20}
            centerValue={String(totalEmployees)}
            centerLabel="people"
          />
        </View>
      </Card>

      {/* Quick actions cards */}
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsCardGrid}>
        <QuickAction
          variant="card"
          title="Add employee"
          description="Onboard a new team member"
          icon="people-outline"
          gradient="violetIndigo"
          onPress={() => navigation.navigate('AdminEmployees')}
        />
        <QuickAction
          variant="card"
          title="Mark attendance"
          description="Today / yesterday / bulk"
          icon="time-outline"
          gradient="emeraldTeal"
          onPress={() => navigation.navigate('Attendance')}
        />
      </View>
      <View style={styles.actionsCardGrid}>
        <QuickAction
          variant="card"
          title="Approve leaves"
          description="Pending approvals queue"
          icon="airplane-outline"
          gradient="amberOrange"
          onPress={() => navigation.navigate('AdminLeaves')}
        />
        <QuickAction
          variant="card"
          title="Automation"
          description="Recurring tasks & rules"
          icon="flash-outline"
          gradient="pinkRose"
          onPress={() => navigation.navigate('Automation')}
        />
      </View>

      {/* Recent employees */}
      <View style={styles.sectionRow}>
        <View>
          <Text style={styles.sectionTitle}>Recently added</Text>
          <Text style={styles.cardDescription}>Your latest joiners</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AdminEmployees')}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>
      <Card padding="none" style={{ overflow: 'hidden' }}>
        {empLoading ? (
          <View style={{ padding: Spacing.lg, gap: Spacing.md }}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.md,
                }}
              >
                <Skeleton width={40} height={40} radius={20} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width={'40%'} height={12} />
                  <Skeleton width={'60%'} height={10} />
                </View>
              </View>
            ))}
          </View>
        ) : employees.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No employees yet</Text>
            <Text style={styles.emptyDesc}>
              Add your first team member to get started.
            </Text>
            <Button
              title="Add employee"
              variant="gradient"
              gradient="brand"
              size="sm"
              style={{ marginTop: Spacing.md }}
              onPress={() => navigation.navigate('AdminEmployees')}
            />
          </View>
        ) : (
          employees.map((e, idx) => {
            const fullName =
              `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() ||
              (e as any)?.user?.email ||
              'Unknown';
            const role = (e as any).designation?.name || getRoleLabel((e as any)?.user?.role || 'EMPLOYEE');
            return (
              <View
                key={e.id}
                style={[
                  styles.empRow,
                  idx > 0 && {
                    borderTopWidth: 1,
                    borderTopColor: Colors.borderLight,
                  },
                ]}
              >
                <LinearGradient
                  colors={Gradients.violetIndigoSoft}
                  style={styles.empAvatar}
                >
                  <Text style={styles.empInitials}>
                    {getInitials(fullName)}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.empName} numberOfLines={1}>
                    {fullName}
                  </Text>
                  <Text style={styles.empMeta} numberOfLines={1}>
                    {(e as any)?.user?.email || e.email} · {e.employeeId}
                  </Text>
                </View>
                <Badge label={role} variant="outline" size="sm" />
              </View>
            );
          })
        )}
      </Card>

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
  heroBold: { fontWeight: '700', color: Colors.text },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },

  kpiGrid: { flexDirection: 'row', gap: Spacing.md },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  cardDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
    paddingTop: Spacing.lg,
  },
  chartCol: { alignItems: 'center', flex: 1, gap: 4 },
  chartValue: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  chartBarTrack: {
    width: '60%',
    height: 130,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  deptRow: { gap: 6 },
  deptHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  deptDot: { width: 8, height: 8, borderRadius: 4 },
  deptName: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  deptValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  deptTrack: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  deptFill: { height: '100%', borderRadius: BorderRadius.full },

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

  actionsCardGrid: { flexDirection: 'row', gap: Spacing.md },

  empRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  empAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empInitials: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  empName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  empMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  emptyWrap: { padding: Spacing.xxl, alignItems: 'center' },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
