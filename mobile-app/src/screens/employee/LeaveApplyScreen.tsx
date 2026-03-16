import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LeaveService } from '../../services/leave.service';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { LEAVE_TYPES } from '../../constants/config';
import { LeaveBalance } from '../../types';

type Props = NativeStackScreenProps<any, 'LeaveApply'>;

export default function LeaveApplyScreen({ navigation }: Props) {
  const [leaveType, setLeaveType] = useState('CASUAL_LEAVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    LeaveService.getBalance()
      .then((res) => setBalances(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setBalanceLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      Alert.alert('Validation', 'Please fill all required fields');
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
      Alert.alert('Success', 'Leave applied successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to apply leave',
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedBalance = balances.find((b) => b.leaveType === leaveType);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {balanceLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : (
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Leave Balance</Text>
          <View style={styles.balanceRow}>
            {balances.slice(0, 4).map((b) => (
              <View key={b.leaveType} style={styles.balanceItem}>
                <Text style={styles.balanceValue}>{b.balance}</Text>
                <Text style={styles.balanceLabel}>
                  {b.leaveType.replace(/_/g, ' ').charAt(0) + b.leaveType.replace(/_/g, ' ').slice(1).toLowerCase()}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <Card>
        <Text style={styles.formTitle}>Apply for Leave</Text>

        <Text style={styles.fieldLabel}>Leave Type</Text>
        <View style={styles.typeGrid}>
          {LEAVE_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeChip,
                leaveType === t.value && styles.typeChipActive,
              ]}
              onPress={() => setLeaveType(t.value)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  leaveType === t.value && styles.typeChipTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedBalance && (
          <Text style={styles.availableText}>
            Available: {selectedBalance.balance} days
          </Text>
        )}

        <Input
          label="Start Date (YYYY-MM-DD)"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          leftIcon="calendar-outline"
        />

        <Input
          label="End Date (YYYY-MM-DD)"
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={setEndDate}
          leftIcon="calendar-outline"
        />

        <Input
          label="Reason"
          placeholder="Enter reason for leave"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <Button
          title="Submit Application"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  balanceCard: { marginBottom: Spacing.lg },
  balanceTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  balanceRow: { flexDirection: 'row' },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  balanceLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  formTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceVariant,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  typeChipTextActive: { color: '#fff', fontWeight: '600' },
  availableText: {
    fontSize: FontSize.sm,
    color: Colors.success,
    fontWeight: '500',
    marginBottom: Spacing.lg,
  },
});
