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
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { AttendanceService } from '../../services/attendance.service';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
} from '../../constants/theme';
import { ATTENDANCE_STATUS_COLORS } from '../../constants/config';
import { formatDate, formatTime, formatHours } from '../../utils/formatters';
import { Haptic } from '../../utils/haptics';
import { Attendance } from '../../types';

export default function AttendanceScreen() {
  const toast = useToast();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [today, setToday] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await AttendanceService.getMyAttendance({
        startDate: monthStart,
        endDate: todayStr,
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const sorted = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setRecords(sorted);
      const todayRec = sorted.find(
        (r) => new Date(r.date).toDateString() === new Date().toDateString(),
      );
      setToday(todayRec || null);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleClockIn = async () => {
    if (busy) return;
    Haptic.medium();
    setBusy(true);
    try {
      const res = await AttendanceService.clockIn();
      setToday(res.data);
      Haptic.success();
      toast.success('Clocked in. Have a productive day!');
      fetchAll();
    } catch (e: any) {
      Haptic.error();
      toast.error(e?.response?.data?.message || 'Failed to clock in');
    } finally {
      setBusy(false);
    }
  };

  const handleClockOut = async () => {
    if (busy) return;
    Haptic.medium();
    setBusy(true);
    try {
      const res = await AttendanceService.clockOut();
      setToday(res.data);
      Haptic.success();
      toast.success('Clocked out. See you tomorrow!');
      fetchAll();
    } catch (e: any) {
      Haptic.error();
      toast.error(e?.response?.data?.message || 'Failed to clock out');
    } finally {
      setBusy(false);
    }
  };

  const presentDays = records.filter((r) => r.status === 'PRESENT').length;
  const lateDays = records.filter((r) => r.isLate).length;
  const totalHours = records.reduce((s, r) => s + (r.totalHours || 0), 0);

  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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
      {/* Live clock hero */}
      <LinearGradient
        colors={Gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroLabel}>CURRENT TIME</Text>
        <Text style={styles.heroTime}>{timeStr}</Text>
        <Text style={styles.heroDate}>{dateStr}</Text>

        <View style={styles.heroAction}>
          {today?.clockOut ? (
            <View style={styles.completedPill}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.completedText}>
                Today complete · {formatHours(today.totalHours || 0)}
              </Text>
            </View>
          ) : today?.clockIn ? (
            <TouchableOpacity
              onPress={handleClockOut}
              activeOpacity={0.85}
              disabled={busy}
              style={[styles.heroBtn, { opacity: busy ? 0.6 : 1 }]}
            >
              <Ionicons name="log-out-outline" size={18} color={Colors.error} />
              <Text style={[styles.heroBtnText, { color: Colors.error }]}>
                Clock Out
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleClockIn}
              activeOpacity={0.85}
              disabled={busy}
              style={[styles.heroBtn, { opacity: busy ? 0.6 : 1 }]}
            >
              <Ionicons
                name="log-in-outline"
                size={18}
                color={Colors.success}
              />
              <Text style={[styles.heroBtnText, { color: Colors.success }]}>
                Clock In
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {today && (
          <View style={styles.heroFooter}>
            <View style={styles.heroFooterItem}>
              <Text style={styles.heroFooterLabel}>In</Text>
              <Text style={styles.heroFooterValue}>
                {today.clockIn ? formatTime(today.clockIn) : '--'}
              </Text>
            </View>
            <View style={styles.heroFooterItem}>
              <Text style={styles.heroFooterLabel}>Out</Text>
              <Text style={styles.heroFooterValue}>
                {today.clockOut ? formatTime(today.clockOut) : '--'}
              </Text>
            </View>
            <View style={styles.heroFooterItem}>
              <Text style={styles.heroFooterLabel}>Status</Text>
              <Text style={styles.heroFooterValue}>{today.status}</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Monthly stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: Colors.success }]}>
          <View style={styles.statTop}>
            <Text style={styles.statLabel}>Days Present</Text>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: Colors.success + '18' },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={Colors.success}
              />
            </View>
          </View>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {presentDays}
          </Text>
          <Text style={styles.statSub}>this month</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.warning }]}>
          <View style={styles.statTop}>
            <Text style={styles.statLabel}>Late</Text>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: Colors.warning + '18' },
              ]}
            >
              <Ionicons name="time" size={16} color={Colors.warning} />
            </View>
          </View>
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {lateDays}
          </Text>
          <Text style={styles.statSub}>arrivals</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.info }]}>
          <View style={styles.statTop}>
            <Text style={styles.statLabel}>Hours</Text>
            <View
              style={[styles.statIcon, { backgroundColor: Colors.info + '18' }]}
            >
              <Ionicons name="bar-chart" size={16} color={Colors.info} />
            </View>
          </View>
          <Text style={[styles.statValue, { color: Colors.info }]}>
            {totalHours.toFixed(1)}
          </Text>
          <Text style={styles.statSub}>total</Text>
        </View>
      </View>

      {/* History */}
      <View style={styles.historyHead}>
        <Text style={styles.sectionTitle}>Attendance history</Text>
        <Text style={styles.sectionMeta}>{records.length} entries</Text>
      </View>

      {loading ? (
        <View style={{ gap: Spacing.sm }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={88} radius={BorderRadius.lg} />
          ))}
        </View>
      ) : records.length === 0 ? (
        <Card>
          <EmptyState
            icon="time-outline"
            title="No attendance records"
            message="Your attendance for this month will appear here"
          />
        </Card>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {records.map((r) => {
            const statusColor =
              ATTENDANCE_STATUS_COLORS[r.status] || Colors.textTertiary;
            return (
              <Card key={r.id} padding="none">
                <View style={styles.row}>
                  <View
                    style={[
                      styles.dateBlock,
                      { backgroundColor: statusColor + '10' },
                    ]}
                  >
                    <Text style={[styles.dateDay, { color: statusColor }]}>
                      {new Date(r.date).getDate()}
                    </Text>
                    <Text style={styles.dateMonth}>
                      {new Date(r.date).toLocaleDateString('en-IN', {
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowTimes}>
                      <Text style={styles.timeText}>
                        <Text style={styles.timeLabel}>In </Text>
                        {r.clockIn ? formatTime(r.clockIn) : '--'}
                      </Text>
                      <Text style={styles.timeText}>
                        <Text style={styles.timeLabel}>Out </Text>
                        {r.clockOut ? formatTime(r.clockOut) : '--'}
                      </Text>
                    </View>
                    <Text style={styles.hoursText}>
                      {r.totalHours
                        ? formatHours(r.totalHours)
                        : 'In progress'}
                      {r.isLate && r.lateMinutes
                        ? ` · Late ${r.lateMinutes}m`
                        : ''}
                    </Text>
                  </View>
                  <Badge
                    label={r.isLate ? 'LATE' : r.status}
                    color={statusColor}
                    size="sm"
                  />
                </View>
              </Card>
            );
          })}
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
    alignItems: 'center',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroTime: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '800',
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  heroDate: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
  heroAction: { marginTop: Spacing.sm },
  heroBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBtnText: { fontSize: FontSize.lg, fontWeight: '700' },
  completedPill: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  completedText: { color: '#fff', fontWeight: '600', fontSize: FontSize.sm },
  heroFooter: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  heroFooterItem: { flex: 1, alignItems: 'center' },
  heroFooterLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.xs,
  },
  heroFooterValue: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '700',
    marginTop: 2,
  },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.borderLight,
    borderRightColor: Colors.borderLight,
    borderBottomColor: Colors.borderLight,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', marginTop: 4 },
  statSub: { fontSize: FontSize.xs, color: Colors.textTertiary },

  historyHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionMeta: { fontSize: FontSize.xs, color: Colors.textTertiary },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  dateBlock: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: { fontSize: FontSize.lg, fontWeight: '800' },
  dateMonth: {
    fontSize: 9,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  rowTimes: { flexDirection: 'row', gap: Spacing.lg },
  timeLabel: { color: Colors.textTertiary, fontSize: FontSize.xs },
  timeText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  hoursText: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
