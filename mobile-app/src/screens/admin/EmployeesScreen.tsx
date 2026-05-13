import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { EmployeeService } from '../../services/employee.service';
import { FontSize, Spacing, BorderRadius, ThemeColors } from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { EMPLOYEE_ROLES } from '../../constants/config';
import { getInitials } from '../../utils/formatters';
import { Employee } from '../../types';

const EMPTY_FORM = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  department: '',
  designation: '',
  salary: '',
  role: 'EMPLOYEE',
};

export default function EmployeesScreen() {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await EmployeeService.getAll({ search: debouncedSearch || undefined });
      const data = res.data;
      setEmployees(Array.isArray(data) ? data : (data as any)?.employees || (data as any)?.data || []);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [debouncedSearch]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      email: emp.email || '',
      password: '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      phone: emp.phone || '',
      dateOfBirth: emp.dateOfBirth || '',
      department: emp.department?.name || '',
      designation: emp.designation?.name || '',
      salary: emp.salary?.toString() || '',
      role: 'EMPLOYEE',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('Validation', 'First name and last name are required');
      return;
    }
    if (!editingId && (!form.email.trim() || !form.password)) {
      Alert.alert('Validation', 'Email and password are required for new employees');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        dateOfBirth: form.dateOfBirth.trim() || undefined,
        department: form.department.trim() || undefined,
        designation: form.designation.trim() || undefined,
        salary: form.salary ? parseFloat(form.salary) : undefined,
      };
      if (!editingId) {
        payload.email = form.email.trim();
        payload.password = form.password;
        payload.role = form.role;
        await EmployeeService.create(payload);
        Alert.alert('Success', 'Employee created');
      } else {
        await EmployeeService.update(editingId, payload);
        Alert.alert('Success', 'Employee updated');
      }
      setShowForm(false);
      fetchEmployees();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = (emp: Employee) => {
    Alert.alert('Delete Employee', `Delete ${emp.firstName} ${emp.lastName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await EmployeeService.delete(emp.id);
            fetchEmployees();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Employee }) => (
    <Card style={styles.item}>
      <View style={styles.itemRow}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(`${item.firstName} ${item.lastName}`)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.email}>{item.email}</Text>
          {item.department && <Text style={styles.dept}>{item.department.name}</Text>}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEdit(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
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
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEmployees(); }} />}
          ListEmptyComponent={<EmptyState icon="people-outline" title="No Employees Found" message={search ? 'Try a different search term' : 'No employees yet'} />}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Employee' : 'Add Employee'}</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {!editingId && (
            <>
              <Text style={styles.formSection}>Account</Text>
              <Input label="Email *" placeholder="employee@company.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => update('email', v)} />
              <Input label="Password *" placeholder="Min 6 characters" isPassword value={form.password} onChangeText={(v) => update('password', v)} />
              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.chipRow}>
                {EMPLOYEE_ROLES.map((r) => (
                  <TouchableOpacity key={r.value} style={[styles.chip, form.role === r.value && styles.chipActive]} onPress={() => update('role', r.value)}>
                    <Text style={[styles.chipText, form.role === r.value && styles.chipTextActive]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.formSection}>Personal Information</Text>
          <View style={styles.row}>
            <Input label="First Name *" placeholder="John" value={form.firstName} onChangeText={(v) => update('firstName', v)} containerStyle={styles.half} />
            <Input label="Last Name *" placeholder="Doe" value={form.lastName} onChangeText={(v) => update('lastName', v)} containerStyle={styles.half} />
          </View>
          <Input label="Phone" placeholder="+91 9876543210" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => update('phone', v)} />
          <Input label="Date of Birth (YYYY-MM-DD)" placeholder="1990-01-01" value={form.dateOfBirth} onChangeText={(v) => update('dateOfBirth', v)} />

          <Text style={styles.formSection}>Employment</Text>
          <Input label="Department" placeholder="Engineering" value={form.department} onChangeText={(v) => update('department', v)} />
          <Input label="Designation" placeholder="Software Engineer" value={form.designation} onChangeText={(v) => update('designation', v)} />
          <Input label="Salary" placeholder="50000" keyboardType="numeric" value={form.salary} onChangeText={(v) => update('salary', v)} />

          <Button title={editingId ? 'Update Employee' : 'Create Employee'} onPress={handleSave} loading={saving} size="lg" style={{ marginTop: Spacing.lg }} />
        </ScrollView>
      </Modal>
    </View>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, margin: Spacing.lg, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  item: { marginBottom: Spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dept: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: Spacing.lg },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalContent: { padding: Spacing.xxl, paddingBottom: Spacing.xxxl * 2 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  formSection: { fontSize: FontSize.md, fontWeight: '600', color: Colors.primary, marginTop: Spacing.xl, marginBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceVariant },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
});
