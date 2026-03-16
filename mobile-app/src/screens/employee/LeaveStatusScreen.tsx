import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
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
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function LeaveStatusScreen() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filter, setFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await LeaveService.getMyLeaves();
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const filtered =
    filter === 'ALL' ? leaves : leaves.filter((l) => l.status === filter);

  if (loading) return <LoadingSpinner message="Loading leaves..." />;

  const renderItem = ({ item }: { item: Leave }) => (
    <Card style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.leaveType}>
          {item.type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
        </Text>
        <Badge
          label={item.status}
          color={LEAVE_STATUS_COLORS[item.status]}
          size="sm"
        />
      </View>
      <View style={styles.dateRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>From</Text>
          <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>To</Text>
          <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Days</Text>
          <Text style={styles.dateValue}>{item.days}</Text>
        </View>
      </View>
      <Text style={styles.reason} numberOfLines={2}>
        {item.reason}
      </Text>
      {item.rejectedReason && (
        <Text style={styles.rejectedReason}>
          Rejection reason: {item.rejectedReason}
        </Text>
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

      <FlatList
        data={filtered}
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
            icon="calendar-outline"
            title="No Leaves Found"
            message="Your leave applications will appear here"
          />
        }
      />
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
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  leaveType: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  dateRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  dateBlock: { flex: 1 },
  dateLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },
  dateValue: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
  reason: { fontSize: FontSize.sm, color: Colors.textSecondary },
  rejectedReason: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
