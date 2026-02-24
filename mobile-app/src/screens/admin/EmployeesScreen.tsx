import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { EmployeeService } from '../../services/employee.service';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { getInitials } from '../../utils/formatters';
import { Employee } from '../../types';

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await EmployeeService.getAll({ search: search || undefined });
      const data = res.data;
      setEmployees(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const renderItem = ({ item }: { item: Employee }) => (
    <Card style={styles.item}>
      <View style={styles.itemRow}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>
            {getInitials(`${item.firstName} ${item.lastName}`)}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.email}>{item.email}</Text>
          {item.department && (
            <Text style={styles.dept}>{item.department.name}</Text>
          )}
        </View>
        <Badge
          label={item.isActive ? 'Active' : 'Inactive'}
          color={item.isActive ? Colors.success : Colors.error}
          size="sm"
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchEmployees}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <LoadingSpinner message="Loading employees..." />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchEmployees();
              }}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Employees Found"
              message={search ? 'Try a different search term' : 'No employees yet'}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  item: { marginBottom: Spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dept: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
});
