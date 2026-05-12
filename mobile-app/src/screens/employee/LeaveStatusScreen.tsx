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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { LeaveService } from '../../services/leave.service';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
} from '../../constants/theme';
import { LEAVE_STATUS_COLORS } from '../../constants/config';
import { formatDate } from '../../utils/formatters';
import { Leave, LeaveBalance, LeaveStatus } from '../../types';

const FILTERS: { label: string; value: LeaveStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const LEAVE_TYPE_LABELS: Record<string, string> = {
  CASUAL_LEAVE: 'Casual',
  SICK_LEAVE: 'Sick',
  EARNED_LEAVE: 'Earned',
  MATERNITY_LEAVE: 'Maternity',
  PATERNITY_LEAVE: 'Paternity',
  COMP_OFF: 'Comp Off',
  LOP: 'Loss of Pay',
};

export default function LeaveStatusScreen() {
  const navigation = useNavigation<any>();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [filter, setFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [leavesRes, balRes] = await Promise.all([
        LeaveService.getMyLeaves(),
        LeaveService.getBalance().catch(() => ({ data: [] })),
      ]);
      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      setBalances(Array.isArray(balRes.data) ? (balRes.data as any) : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered =
    filter === 'ALL' ? leaves : leaves.filter((l) => l.status === filter);

  const counts = {
    PENDING: leaves.filter((l) => l.status === 'PENDING').length,
    APPROVED: leaves.filter((l) => l.status === 'APPROVED').length,
    REJECTED: leaves.filter((l) => l.status === 'REJECTED').length,
  };

  const totalBalance = balances.reduce((s, b) => s + b.balance, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchAll();
          }}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Hero balance */}
      <LinearGradient
        colors={Gradients.amberOrange}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroLabel}>YOUR LEAVE BALANCE</Text>
            <Text style={styles.heroValue}>{totalBalance}</Text>
            <Text style={styles.heroSub}>days available across all types</Text>
          </View>
          <View style={styles.heroIconWrap}>
            <Ionicons name="airplane" size={28} color="#fff" />
          </View>
        </View>
        <Button
          title="Apply for leave"
          variant="gradient"
          gradient={['#FFFFFF', '#FFFFFF']}
          icon={<Ionicons name="add" size={18} color={Colors.warning} />}
          textStyle={{ color: Colors.warning }}
          onPress={() => navigation.navigate('LeaveApply')}
          fullWidth
          style={{ marginTop: Spacing.md }}
        />
      </LinearGradient>

      {/* Per-type balance breakdown */}
      {balances.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Balance by type</Text>
          <View style={styles.balanceGrid}>
            {balances.map((b) => {
              const used = b.used || 0;
              const total = b.accrued + (b.carryForward || 0);
              const pct = total > 0 ? (used / total) * 100 : 0;
              return (
                <View key={b.leaveType} style={styles.balanceItem}>
                  <Text style={styles.balanceType}>
                    {LEAVE_TYPE_LABELS[b.leaveType] || b.leaveType}
                  </Text>
                  <Text style={styles.balanceVal}>
                    <Text style={styles.balanceBig}>{b.balance}</Text>
                    <Text style={styles.balanceTotal}> / {total}</Text>
                  </Text>
                  <View style={styles.balanceTrack}>
                    <View
                      style={[
                        styles.balanceFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: Colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <Text style={[styles.statTileValue, { color: Colors.warning }]}>
            {counts.PENDING}
          </Text>
          <Text style={styles.statTileLabel}>Pending</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statTileValue, { color: Colors.success }]}>
            {counts.APPROVED}
          </Text>
          <Text style={styles.statTileLabel}>Approved</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statTileValue, { color: Colors.error }]}>
            {counts.REJECTED}
          </Text>
          <Text style={styles.statTileLabel}>Rejected</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count =
            f.value === 'ALL'
              ? leaves.length
              : leaves.filter((l) => l.status === f.value).length;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, active && styles.filterActive]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  active && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    active && styles.filterBadgeTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Leaves list */}
      {loading ? (
        <View style={{ gap: Spacing.sm }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} radius={BorderRadius.lg} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="calendar-outline"
            title="No leaves found"
            message={
              filter === 'ALL'
                ? "You haven't applied for any leaves yet"
                : `No ${filter.toLowerCase()} leaves`
            }
          />
        </Card>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {filtered.map((l) => (
            <Card key={l.id}>
              <View style={styles.leaveHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaveType}>
                    {LEAVE_TYPE_LABELS[l.type] || l.type}
                  </Text>
                  <Text style={styles.leaveDays}>
                    {l.days} day{l.days > 1 ? 's' : ''}
                  </Text>
                </View>
                <Badge
                  label={l.status}
                  color={LEAVE_STATUS_COLORS[l.status]}
                  size="sm"
                />
              </View>
              <View style={styles.leaveDates}>
                <View style={styles.leaveDateBlock}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={Colors.textTertiary}
                  />
                  <Text style={styles.leaveDateText}>
                    {formatDate(l.startDate)} – {formatDate(l.endDate)}
                  </Text>
                </View>
              </View>
              {l.reason ? (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonLabel}>Reason</Text>
                  <Text style={styles.reasonText} numberOfLines={3}>
                    {l.reason}
                  </Text>
                </View>
              ) : null}
              {l.rejectedReason ? (
                <View style={[styles.reasonBox, styles.rejectionBox]}>
                  <Text
                    style={[styles.reasonLabel, { color: Colors.error }]}
                  >
                    Rejection reason
                  </Text>
                  <Text style={[styles.reasonText, { color: Colors.error }]}>
                    {l.rejectedReason}
                  </Text>
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      )}

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroValue: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '800',
    marginTop: 4,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  balanceGrid: { gap: Spacing.md },
  balanceItem: {},
  balanceType: { fontSize: FontSize.xs, color: Colors.textSecondary },
  balanceVal: { marginTop: 2, marginBottom: 6 },
  balanceBig: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  balanceTotal: { fontSize: FontSize.sm, color: Colors.textTertiary },
  balanceTrack: {
    height: 5,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  balanceFill: { height: '100%', borderRadius: BorderRadius.full },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  statTileValue: { fontSize: FontSize.xxl, fontWeight: '800' },
  statTileLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  filterRow: { gap: Spacing.sm, paddingVertical: 2 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  filterTextActive: { color: '#fff' },
  filterBadge: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 6,
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterBadgeTextActive: { color: '#fff' },

  leaveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  leaveType: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  leaveDays: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  leaveDates: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  leaveDateBlock: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  leaveDateText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  reasonBox: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  rejectionBox: { backgroundColor: Colors.errorLight },
  reasonLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  reasonText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 19,
  },
});
