import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { LeaveService } from '../../services/leave.service';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { LEAVE_STATUS_COLORS } from '../../constants/config';
import { formatDate } from '../../utils/formatters';
import { Leave, LeaveStatus } from '../../types';

const FILTERS: { label: string; value: LeaveStatus | 'ALL' }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'All', value: 'ALL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function LeaveManagementScreen() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filter, setFilter] = useState<LeaveStatus | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      const params = filter !== 'ALL' ? { status: filter } : undefined;
      const res = await LeaveService.getAll(params);
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchLeaves();
  }, [fetchLeaves]);

  const handleAction = (leave: Leave, status: 'APPROVED' | 'REJECTED') => {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Leave`,
      `Are you sure you want to ${action} this leave request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: status === 'REJECTED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await LeaveService.updateStatus(leave.id, { status });
              fetchLeaves();
              Alert.alert('Success', `Leave ${action}d successfully`);
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || `Failed to ${action}`,
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Leave }) => (
    <Card style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empName}>
            {item.employee
              ? `${item.employee.firstName} ${item.employee.lastName}`
              : 'Employee'}
          </Text>
          <Text style={styles.leaveType}>
            {item.type.charAt(0) + item.type.slice(1).toLowerCase()} Leave
          </Text>
        </View>
        <Badge
          label={item.status}
          color={LEAVE_STATUS_COLORS[item.status]}
          size="sm"
        />
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dates}>
          {formatDate(item.startDate)} — {formatDate(item.endDate)}
        </Text>
        <Text style={styles.days}>{item.days} day(s)</Text>
      </View>

      <Text style={styles.reason} numberOfLines={2}>
        {item.reason}
      </Text>

      {item.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleAction(item, 'APPROVED')}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleAction(item, 'REJECTED')}
          >
            <Ionicons name="close" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingSpinner message="Loading leave requests..." />
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchLeaves();
              }}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No Leave Requests"
              message="Leave requests will appear here"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterRow: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: Spacing.lg },
  item: { marginBottom: Spacing.md },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  empName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  leaveType: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dates: { fontSize: FontSize.sm, color: Colors.text },
  days: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.primary },
  reason: { fontSize: FontSize.sm, color: Colors.textSecondary },
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
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  approveBtn: { backgroundColor: Colors.success },
  rejectBtn: { backgroundColor: Colors.error },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: FontSize.sm },
});
