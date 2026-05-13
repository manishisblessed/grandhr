import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { LeaveService } from '../../services/leave.service';
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
import { formatDate, getInitials } from '../../utils/formatters';
import { Haptic } from '../../utils/haptics';
import { Leave, LeaveStatus } from '../../types';

const FILTERS: { label: string; value: LeaveStatus | 'ALL' }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'All', value: 'ALL' },
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

export default function LeaveManagementScreen() {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const modalStyles = useThemedStyles(makeModalStyles);
  const toast = useToast();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [filter, setFilter] = useState<LeaveStatus | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Leave | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const res = await LeaveService.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setAllLeaves(data);
      setLeaves(data);
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
    PENDING: allLeaves.filter((l) => l.status === 'PENDING').length,
    APPROVED: allLeaves.filter((l) => l.status === 'APPROVED').length,
    REJECTED: allLeaves.filter((l) => l.status === 'REJECTED').length,
  };

  const closeModal = () => {
    setSelected(null);
    setRejectionReason('');
  };

  const submitDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selected) return;
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      Haptic.warning();
      toast.warning('Please provide a rejection reason');
      return;
    }
    Haptic.medium();
    setProcessing(true);
    try {
      await LeaveService.updateStatus(selected.id, {
        status,
        rejectedReason:
          status === 'REJECTED' ? rejectionReason.trim() : undefined,
      });
      Haptic.success();
      toast.success(`Leave ${status.toLowerCase()}. Employee will be notified.`);
      closeModal();
      fetchAll();
    } catch (e: any) {
      Haptic.error();
      toast.error(
        e?.response?.data?.message || `Failed to ${status.toLowerCase()}`,
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
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
        {/* Hero stats */}
        <LinearGradient
          colors={Gradients.violetIndigo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEyebrow}>LEAVE QUEUE</Text>
          <Text style={styles.heroTitle}>Approvals dashboard</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{counts.PENDING}</Text>
              <Text style={styles.heroStatLabel}>Pending</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{counts.APPROVED}</Text>
              <Text style={styles.heroStatLabel}>Approved</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{counts.REJECTED}</Text>
              <Text style={styles.heroStatLabel}>Rejected</Text>
            </View>
          </View>
        </LinearGradient>

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
                ? allLeaves.length
                : allLeaves.filter((l) => l.status === f.value).length;
            return (
              <TouchableOpacity
                key={f.value}
                style={[styles.filterChip, active && styles.filterActive]}
                onPress={() => setFilter(f.value)}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
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

        {loading ? (
          <View style={{ gap: Spacing.sm }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={140} radius={BorderRadius.lg} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon="checkmark-done-outline"
              title={
                filter === 'PENDING' ? 'No pending requests' : 'No requests'
              }
              message={
                filter === 'PENDING'
                  ? 'All caught up — nothing waiting for approval'
                  : 'No leave requests found in this filter'
              }
            />
          </Card>
        ) : (
          <View style={{ gap: Spacing.sm }}>
            {filtered.map((l) => {
              const empName = l.employee
                ? `${l.employee.firstName} ${l.employee.lastName}`
                : 'Employee';
              return (
                <Card key={l.id}>
                  <View style={styles.itemHead}>
                    <LinearGradient
                      colors={Gradients.violetIndigoSoft}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {getInitials(empName)}
                      </Text>
                    </LinearGradient>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.empName} numberOfLines={1}>
                        {empName}
                      </Text>
                      <Text style={styles.empMeta} numberOfLines={1}>
                        {l.employee?.employeeId} ·{' '}
                        {LEAVE_TYPE_LABELS[l.type] || l.type}
                      </Text>
                    </View>
                    <Badge
                      label={l.status}
                      color={LEAVE_STATUS_COLORS[l.status]}
                      size="sm"
                    />
                  </View>

                  <View style={styles.itemRow}>
                    <View style={styles.dateBox}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={Colors.textTertiary}
                      />
                      <Text style={styles.dateText}>
                        {formatDate(l.startDate)} – {formatDate(l.endDate)}
                      </Text>
                    </View>
                    <Text style={styles.daysBadge}>
                      {l.days} day{l.days > 1 ? 's' : ''}
                    </Text>
                  </View>

                  {l.reason ? (
                    <Text style={styles.reasonText} numberOfLines={2}>
                      {l.reason}
                    </Text>
                  ) : null}

                  {l.status === 'PENDING' && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => {
                          setSelected(l);
                          setRejectionReason('');
                        }}
                      >
                        <Ionicons name="close" size={16} color={Colors.error} />
                        <Text
                          style={[
                            styles.actionBtnText,
                            { color: Colors.error },
                          ]}
                        >
                          Reject
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.reviewBtn]}
                        onPress={() => {
                          setSelected(l);
                          setRejectionReason('');
                        }}
                      >
                        <Ionicons name="eye-outline" size={16} color="#fff" />
                        <Text
                          style={[styles.actionBtnText, { color: '#fff' }]}
                        >
                          Review
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      {/* Approval modal */}
      <Modal
        transparent
        visible={!!selected}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Review request</Text>
              <TouchableOpacity onPress={closeModal} style={modalStyles.close}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {selected && (
              <ScrollView style={{ maxHeight: 480 }}>
                <View style={modalStyles.empCard}>
                  <LinearGradient
                    colors={Gradients.violetIndigoSoft}
                    style={modalStyles.empAvatar}
                  >
                    <Text style={modalStyles.empAvatarText}>
                      {getInitials(
                        selected.employee
                          ? `${selected.employee.firstName} ${selected.employee.lastName}`
                          : 'EM',
                      )}
                    </Text>
                  </LinearGradient>
                  <View>
                    <Text style={modalStyles.empName}>
                      {selected.employee?.firstName}{' '}
                      {selected.employee?.lastName}
                    </Text>
                    <Text style={modalStyles.empMeta}>
                      {selected.employee?.employeeId}
                    </Text>
                  </View>
                </View>

                <View style={modalStyles.detailGrid}>
                  <View style={modalStyles.detailItem}>
                    <Text style={modalStyles.detailLabel}>Type</Text>
                    <Text style={modalStyles.detailValue}>
                      {LEAVE_TYPE_LABELS[selected.type] || selected.type}
                    </Text>
                  </View>
                  <View style={modalStyles.detailItem}>
                    <Text style={modalStyles.detailLabel}>Duration</Text>
                    <Text style={modalStyles.detailValue}>
                      {selected.days} day{selected.days > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={modalStyles.detailItem}>
                    <Text style={modalStyles.detailLabel}>From</Text>
                    <Text style={modalStyles.detailValue}>
                      {formatDate(selected.startDate)}
                    </Text>
                  </View>
                  <View style={modalStyles.detailItem}>
                    <Text style={modalStyles.detailLabel}>To</Text>
                    <Text style={modalStyles.detailValue}>
                      {formatDate(selected.endDate)}
                    </Text>
                  </View>
                </View>

                <Text style={modalStyles.detailLabel}>Reason</Text>
                <View style={modalStyles.reasonBox}>
                  <Text style={modalStyles.reasonText}>
                    {selected.reason || 'No reason provided'}
                  </Text>
                </View>

                {selected.status === 'PENDING' && (
                  <>
                    <Text style={modalStyles.detailLabel}>
                      Rejection reason{' '}
                      <Text style={{ color: Colors.textTertiary }}>
                        (required if rejecting)
                      </Text>
                    </Text>
                    <TextInput
                      style={modalStyles.input}
                      placeholder="Provide a reason if rejecting..."
                      placeholderTextColor={Colors.textTertiary}
                      value={rejectionReason}
                      onChangeText={setRejectionReason}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </>
                )}
              </ScrollView>
            )}

            {selected?.status === 'PENDING' && (
              <View style={modalStyles.footer}>
                <Button
                  title="Reject"
                  variant="danger"
                  onPress={() => submitDecision('REJECTED')}
                  loading={processing}
                  icon={<Ionicons name="close" size={16} color="#fff" />}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Approve"
                  variant="gradient"
                  gradient="emeraldTeal"
                  onPress={() => submitDecision('APPROVED')}
                  loading={processing}
                  icon={<Ionicons name="checkmark" size={16} color="#fff" />}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginTop: 4,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '800' },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
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

  itemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  empName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  empMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  daysBadge: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '700',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  reasonText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  rejectBtn: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  reviewBtn: { backgroundColor: Colors.primary },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '700' },
});

const makeModalStyles = (Colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  close: { padding: 6 },
  empCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  empAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empAvatarText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  empName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  empMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  detailItem: { width: '50%', paddingVertical: Spacing.sm },
  detailLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  reasonBox: {
    backgroundColor: Colors.surfaceMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  reasonText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  input: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 80,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
