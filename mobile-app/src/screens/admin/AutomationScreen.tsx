import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { AutomationService, AutomationJob } from '../../services/automation.service';
import { FontSize, Spacing, BorderRadius, ThemeColors } from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { AUTOMATION_TYPES } from '../../constants/config';
import { formatDateTime } from '../../utils/formatters';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#64748B',
  RUNNING: '#3B82F6',
  COMPLETED: '#10B981',
  FAILED: '#EF4444',
};

export default function AutomationScreen() {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'AUTO_PAYROLL', schedule: '0 0 1 * *' });

  const fetchJobs = useCallback(async () => {
    try {
      const res = await AutomationService.getAll();
      setJobs(Array.isArray(res.data) ? res.data : (res.data as any)?.jobs || []);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.schedule.trim()) {
      Alert.alert('Validation', 'Name and schedule are required');
      return;
    }
    setCreating(true);
    try {
      await AutomationService.create(form);
      setShowCreate(false);
      setForm({ name: '', type: 'AUTO_PAYROLL', schedule: '0 0 1 * *' });
      fetchJobs();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    } finally { setCreating(false); }
  };

  const handleToggle = async (job: AutomationJob) => {
    try {
      await AutomationService.toggle(job.id, !job.isActive);
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, isActive: !j.isActive } : j));
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    }
  };

  const handleRun = (job: AutomationJob) => {
    Alert.alert('Run Job', `Run "${job.name}" now?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Run',
        onPress: async () => {
          try {
            await AutomationService.run(job.id);
            Alert.alert('Success', 'Job started');
            fetchJobs();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed');
          }
        },
      },
    ]);
  };

  const handleDelete = (job: AutomationJob) => {
    Alert.alert('Delete Job', `Delete "${job.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AutomationService.delete(job.id);
            fetchJobs();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading automation..." />;

  const renderItem = ({ item }: { item: AutomationJob }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobName}>{item.name}</Text>
          <Text style={styles.jobType}>{item.type.replace(/_/g, ' ')}</Text>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => handleToggle(item)}
          trackColor={{ true: Colors.primaryLight }}
          thumbColor={item.isActive ? Colors.primary : Colors.textTertiary}
        />
      </View>
      <View style={styles.jobMeta}>
        <Badge label={item.status} color={STATUS_COLORS[item.status] || Colors.textTertiary} size="sm" />
        <Text style={styles.metaText}>Schedule: {item.schedule}</Text>
      </View>
      <View style={styles.jobMeta}>
        <Text style={styles.metaText}>Runs: {item.runCount}</Text>
        {item.lastRun && <Text style={styles.metaText}>Last: {formatDateTime(item.lastRun)}</Text>}
      </View>
      <View style={styles.jobActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleRun(item)}>
          <Ionicons name="play-outline" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Run</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} />}
        ListEmptyComponent={<EmptyState icon="cog-outline" title="No Automation Jobs" message="Create your first automation job" />}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Automation</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
          </View>
          <Input label="Name *" placeholder="Monthly Payroll" value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.chipRow}>
            {AUTOMATION_TYPES.map((t) => (
              <TouchableOpacity key={t.value} style={[styles.chip, form.type === t.value && styles.chipActive]} onPress={() => setForm((p) => ({ ...p, type: t.value }))}>
                <Text style={[styles.chipText, form.type === t.value && styles.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input label="Schedule (Cron) *" placeholder="0 0 1 * *" value={form.schedule} onChangeText={(v) => setForm((p) => ({ ...p, schedule: v }))} />
          <Button title="Create Job" onPress={handleCreate} loading={creating} size="lg" style={{ marginTop: Spacing.lg }} />
        </ScrollView>
      </Modal>
    </View>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  jobName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  jobType: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2, textTransform: 'capitalize' },
  jobMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  metaText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  jobActions: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  actionText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.primary },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalContent: { padding: Spacing.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceVariant },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
