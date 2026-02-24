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
import { PayrollService } from '../../services/payroll.service';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { Payroll } from '../../types';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: Colors.warning,
  PROCESSED: Colors.info,
  PAID: Colors.success,
};

export default function SalarySlipScreen() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayrolls = useCallback(async () => {
    try {
      const res = await PayrollService.getMyPayrolls();
      setPayrolls(Array.isArray(res.data) ? res.data : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  if (loading) return <LoadingSpinner message="Loading salary slips..." />;

  const renderItem = ({ item }: { item: Payroll }) => (
    <Card style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.period}>
          {MONTHS[item.month - 1]} {item.year}
        </Text>
        <Badge
          label={item.status}
          color={STATUS_COLORS[item.status] || Colors.textTertiary}
          size="sm"
        />
      </View>

      <View style={styles.breakdown}>
        <Row label="Basic Salary" value={formatCurrency(item.baseSalary)} />
        <Row
          label="Allowances"
          value={`+ ${formatCurrency(item.allowances)}`}
          color={Colors.success}
        />
        <Row
          label="Deductions"
          value={`- ${formatCurrency(item.deductions)}`}
          color={Colors.error}
        />
        {item.pf > 0 && (
          <Row label="PF" value={`- ${formatCurrency(item.pf)}`} color={Colors.error} />
        )}
        {item.tds > 0 && (
          <Row label="TDS" value={`- ${formatCurrency(item.tds)}`} color={Colors.error} />
        )}
      </View>

      <View style={styles.netRow}>
        <Text style={styles.netLabel}>Net Salary</Text>
        <Text style={styles.netValue}>{formatCurrency(item.netSalary)}</Text>
      </View>
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      data={payrolls}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchPayrolls();
          }}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="wallet-outline"
          title="No Salary Slips"
          message="Your salary slips will appear here once processed"
        />
      }
    />
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg },
  item: { marginBottom: Spacing.md },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  period: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  breakdown: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  netLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  netValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
});
