import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { AttendanceService } from '../../services/attendance.service';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { ATTENDANCE_STATUS_COLORS } from '../../constants/config';
import { formatDate, formatTime, formatHours } from '../../utils/formatters';
import { Attendance } from '../../types';

export default function AttendanceScreen() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      const res = await AttendanceService.getMyAttendance({
        startDate,
        endDate,
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  if (loading) return <LoadingSpinner message="Loading attendance..." />;

  const present = records.filter((r) => r.status === 'PRESENT').length;
  const late = records.filter((r) => r.isLate).length;

  const renderItem = ({ item }: { item: Attendance }) => (
    <Card style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
        <Badge
          label={item.status}
          color={ATTENDANCE_STATUS_COLORS[item.status] || Colors.textTertiary}
          size="sm"
        />
      </View>
      <View style={styles.itemTimes}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>In</Text>
          <Text style={styles.timeValue}>
            {item.clockIn ? formatTime(item.clockIn) : '--:--'}
          </Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Out</Text>
          <Text style={styles.timeValue}>
            {item.clockOut ? formatTime(item.clockOut) : '--:--'}
          </Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Hours</Text>
          <Text style={styles.timeValue}>
            {item.totalHours ? formatHours(item.totalHours) : '--'}
          </Text>
        </View>
      </View>
      {item.isLate && item.lateMinutes && (
        <Text style={styles.lateText}>Late by {item.lateMinutes} min</Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{records.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {present}
          </Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>
            {late}
          </Text>
          <Text style={styles.summaryLabel}>Late</Text>
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAttendance();
            }}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="No Attendance Records"
            message="Your attendance for this month will appear here"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  list: { padding: Spacing.lg },
  item: { marginBottom: Spacing.md },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemDate: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  itemTimes: { flexDirection: 'row' },
  timeBlock: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },
  timeValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  lateText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
});
