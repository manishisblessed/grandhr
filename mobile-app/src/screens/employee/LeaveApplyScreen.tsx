import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { LeaveService } from '../../services/leave.service';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
} from '../../constants/theme';
import { LEAVE_TYPES } from '../../constants/config';
import { LeaveBalance } from '../../types';
import { formatDate } from '../../utils/formatters';

type Props = NativeStackScreenProps<any, 'LeaveApply'>;

const LEAVE_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  CASUAL_LEAVE: 'cafe-outline',
  SICK_LEAVE: 'medkit-outline',
  EARNED_LEAVE: 'trophy-outline',
  MATERNITY_LEAVE: 'heart-outline',
  PATERNITY_LEAVE: 'people-outline',
  COMP_OFF: 'time-outline',
  LOP: 'remove-circle-outline',
};

function toIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function diffDays(a: string, b: string) {
  if (!a || !b) return 0;
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (isNaN(t1) || isNaN(t2)) return 0;
  return Math.max(1, Math.round((t2 - t1) / 86400000) + 1);
}

export default function LeaveApplyScreen({ navigation }: Props) {
  const toast = useToast();
  const [leaveType, setLeaveType] = useState('CASUAL_LEAVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    LeaveService.getBalance()
      .then((res) => setBalances(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const selectedBalance = balances.find((b) => b.leaveType === leaveType);
  const days = diffDays(startDate, endDate);
  const overBudget =
    selectedBalance && days > 0 && days > selectedBalance.balance;

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      toast.warning('Please fill all required fields');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.warning('End date cannot be before start date');
      return;
    }
    setLoading(true);
    try {
      await LeaveService.apply({
        type: leaveType,
        durationType: 'FULL_DAY',
        startDate,
        endDate,
        reason: reason.trim(),
      });
      toast.success('Leave applied. Awaiting approval.');
      navigation.goBack();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero */}
      <LinearGradient
        colors={Gradients.violetIndigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>NEW REQUEST</Text>
        <Text style={styles.heroTitle}>Apply for leave</Text>
        <Text style={styles.heroSub}>
          Choose a type, pick dates, share why — your manager will be notified.
        </Text>
      </LinearGradient>

      {/* Leave type chips */}
      <Card>
        <Text style={styles.sectionTitle}>Leave type</Text>
        <View style={styles.typeGrid}>
          {LEAVE_TYPES.map((t) => {
            const active = leaveType === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, active && styles.typeChipActive]}
                onPress={() => setLeaveType(t.value)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={LEAVE_TYPE_ICONS[t.value] || 'document-outline'}
                  size={16}
                  color={active ? '#fff' : Colors.primary}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    active && styles.typeChipTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {selectedBalance && (
          <View style={styles.availableBox}>
            <Ionicons
              name="information-circle"
              size={16}
              color={Colors.info}
            />
            <Text style={styles.availableText}>
              Available:{' '}
              <Text style={{ fontWeight: '700' }}>
                {selectedBalance.balance}
              </Text>{' '}
              days
            </Text>
          </View>
        )}
      </Card>

      {/* Dates */}
      <Card>
        <Text style={styles.sectionTitle}>Dates</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setPickerOpen('start')}
            activeOpacity={0.85}
          >
            <Text style={styles.dateLabel}>From</Text>
            <View style={styles.dateValueRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.primary}
              />
              <Text
                style={[
                  styles.dateValue,
                  !startDate && { color: Colors.textTertiary },
                ]}
              >
                {startDate ? formatDate(startDate) : 'Select date'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setPickerOpen('end')}
            activeOpacity={0.85}
          >
            <Text style={styles.dateLabel}>To</Text>
            <View style={styles.dateValueRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.primary}
              />
              <Text
                style={[
                  styles.dateValue,
                  !endDate && { color: Colors.textTertiary },
                ]}
              >
                {endDate ? formatDate(endDate) : 'Select date'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {days > 0 && (
          <View
            style={[
              styles.summaryBox,
              overBudget && { backgroundColor: Colors.errorLight },
            ]}
          >
            <Ionicons
              name={overBudget ? 'warning' : 'checkmark-circle'}
              size={16}
              color={overBudget ? Colors.error : Colors.success}
            />
            <Text
              style={[
                styles.summaryText,
                overBudget && { color: Colors.error },
              ]}
            >
              {overBudget
                ? `Exceeds your balance of ${selectedBalance?.balance} days`
                : `Total: ${days} day${days > 1 ? 's' : ''}`}
            </Text>
          </View>
        )}
      </Card>

      {/* Reason */}
      <Card>
        <Text style={styles.sectionTitle}>Reason</Text>
        <View style={styles.reasonField}>
          <TextInput
            style={styles.reasonInput}
            placeholder="Briefly describe why you need this leave..."
            placeholderTextColor={Colors.textTertiary}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.reasonHint}>{reason.length} characters</Text>
      </Card>

      <View style={styles.footer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
        <Button
          title="Submit request"
          variant="gradient"
          gradient="brand"
          onPress={handleSubmit}
          loading={loading}
          disabled={!!overBudget}
          icon={<Ionicons name="paper-plane" size={16} color="#fff" />}
          style={{ flex: 1 }}
        />
      </View>

      <DatePickerModal
        visible={pickerOpen !== null}
        initialDate={
          pickerOpen === 'start'
            ? startDate || toIso(new Date())
            : endDate || startDate || toIso(new Date())
        }
        minDate={pickerOpen === 'end' ? startDate : undefined}
        onClose={() => setPickerOpen(null)}
        onSelect={(d) => {
          if (pickerOpen === 'start') {
            setStartDate(d);
            if (endDate && new Date(endDate) < new Date(d)) setEndDate(d);
          } else if (pickerOpen === 'end') setEndDate(d);
          setPickerOpen(null);
        }}
      />

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

/**
 * Lightweight calendar-grid date picker. Avoids extra deps.
 */
function DatePickerModal({
  visible,
  initialDate,
  minDate,
  onClose,
  onSelect,
}: {
  visible: boolean;
  initialDate: string;
  minDate?: string;
  onClose: () => void;
  onSelect: (iso: string) => void;
}) {
  const [view, setView] = useState<Date>(() =>
    initialDate ? new Date(initialDate) : new Date(),
  );

  useEffect(() => {
    if (visible && initialDate) setView(new Date(initialDate));
  }, [visible, initialDate]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const minTs = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : 0;

  const grid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let i = 1; i <= daysInMonth; i++) grid.push(i);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={pickerStyles.overlay}>
        <View style={pickerStyles.sheet}>
          <View style={pickerStyles.header}>
            <TouchableOpacity
              onPress={() => setView(new Date(year, month - 1, 1))}
              style={pickerStyles.navBtn}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={pickerStyles.title}>
              {view.toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <TouchableOpacity
              onPress={() => setView(new Date(year, month + 1, 1))}
              style={pickerStyles.navBtn}
            >
              <Ionicons name="chevron-forward" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={pickerStyles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={i} style={pickerStyles.weekDay}>
                {d}
              </Text>
            ))}
          </View>

          <View style={pickerStyles.grid}>
            {grid.map((day, i) => {
              if (day === null) {
                return <View key={i} style={pickerStyles.dayCell} />;
              }
              const ts = new Date(year, month, day).setHours(0, 0, 0, 0);
              const disabled = !!(minTs && ts < minTs);
              return (
                <TouchableOpacity
                  key={i}
                  style={[pickerStyles.dayCell, disabled && { opacity: 0.3 }]}
                  disabled={disabled}
                  onPress={() =>
                    onSelect(toIso(new Date(year, month, day as number)))
                  }
                >
                  <Text style={pickerStyles.dayText}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={onClose} style={pickerStyles.cancelBtn}>
            <Text style={pickerStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  hero: { borderRadius: BorderRadius.xl, padding: Spacing.xl },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginTop: 4,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.sm,
    marginTop: 4,
    lineHeight: 19,
  },

  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  typeChipTextActive: { color: '#fff' },

  availableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  availableText: { fontSize: FontSize.sm, color: Colors.info },

  dateRow: { flexDirection: 'row', gap: Spacing.md },
  dateField: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dateValueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dateValue: { fontSize: FontSize.md, color: Colors.text, fontWeight: '600' },

  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  summaryText: {
    fontSize: FontSize.sm,
    color: Colors.success,
    fontWeight: '600',
  },

  reasonField: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reasonInput: {
    minHeight: 100,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  reasonHint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 4,
    textAlign: 'right',
  },

  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
});

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: { padding: Spacing.sm },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: '700',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  cancelBtn: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
