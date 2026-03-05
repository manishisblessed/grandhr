import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StatCard from '../../components/dashboard/StatCard';
import QuickAction from '../../components/dashboard/QuickAction';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../store/useAuthStore';
import { DashboardService } from '../../services/dashboard.service';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { getGreeting, formatCurrency, getRoleLabel } from '../../utils/formatters';
import { DashboardStats } from '../../types';

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await DashboardService.getAdminStats();
      setStats(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>{user?.name || 'Admin'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleLabel(user?.role || '')} Dashboard</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            title="Employees"
            value={stats?.totalEmployees ?? 0}
            icon="people-outline"
            color={Colors.primary}
          />
          <StatCard
            title="Present Today"
            value={stats?.presentToday ?? 0}
            icon="checkmark-circle-outline"
            color={Colors.success}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Pending Leaves"
            value={stats?.pendingLeaves ?? 0}
            icon="calendar-outline"
            color={Colors.warning}
          />
          <StatCard
            title="Payroll"
            value={stats?.totalPayroll ? formatCurrency(stats.totalPayroll) : '0'}
            icon="wallet-outline"
            color={Colors.secondary}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <Card>
        <View style={styles.actionsGrid}>
          <QuickAction title="Employees" icon="people-outline" color={Colors.primary} onPress={() => navigation.navigate('AdminEmployees')} />
          <QuickAction title="Leave Requests" icon="document-text-outline" color={Colors.warning} onPress={() => navigation.navigate('AdminLeaves')} />
          <QuickAction title="Attendance" icon="time-outline" color={Colors.success} onPress={() => navigation.navigate('Attendance')} />
          <QuickAction title="Notifications" icon="notifications-outline" color={Colors.info} onPress={() => navigation.navigate('Notifications')} />
        </View>
        <View style={styles.actionsGrid}>
          <QuickAction title="Automation" icon="cog-outline" color={Colors.secondary} onPress={() => navigation.navigate('Automation')} />
          <QuickAction title="Support" icon="chatbubbles-outline" color="#E11D48" onPress={() => navigation.navigate('Support')} />
          <QuickAction title="HR Bot" icon="chatbubble-ellipses-outline" color="#8B5CF6" onPress={() => navigation.navigate('Chatbot')} />
          <QuickAction title="" icon="ellipse-outline" color="transparent" onPress={() => {}} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  header: { marginBottom: Spacing.xl },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  name: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  roleBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary },
  statsGrid: { gap: Spacing.md, marginBottom: Spacing.xl },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
});
