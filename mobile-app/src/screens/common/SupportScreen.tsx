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
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  SupportService,
  SupportTicket,
  TicketReply,
} from '../../services/support.service';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUS_COLORS,
  PRIORITY_COLORS,
} from '../../constants/config';
import { formatDate, getRelativeTime } from '../../utils/formatters';
import { useAuthStore } from '../../store/useAuthStore';
import { ADMIN_ROLES } from '../../constants/config';

export default function SupportScreen() {
  const { user } = useAuthStore();
  const isAdmin = user?.role ? ADMIN_ROLES.includes(user.role) : false;
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
  });

  const fetchTickets = useCallback(async () => {
    try {
      const res = await SupportService.getAll();
      const data = res.data;
      setTickets(Array.isArray(data) ? data : (data as any)?.tickets || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.description.trim()) {
      Alert.alert('Validation', 'Title and description are required');
      return;
    }
    setSending(true);
    try {
      await SupportService.create(createForm);
      setShowCreate(false);
      setCreateForm({ title: '', description: '', category: 'TECHNICAL', priority: 'MEDIUM' });
      fetchTickets();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create ticket');
    } finally { setSending(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await SupportService.reply(selectedTicket.id, replyText.trim());
      setReplyText('');
      const res = await SupportService.getById(selectedTicket.id);
      const ticket = (res.data as any)?.ticket || res.data;
      setSelectedTicket(ticket);
      fetchTickets();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to send reply');
    } finally { setSending(false); }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await SupportService.updateStatus(ticketId, status);
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        const res = await SupportService.getById(ticketId);
        setSelectedTicket((res.data as any)?.ticket || res.data);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner message="Loading tickets..." />;

  const renderTicket = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={async () => {
        try {
          const res = await SupportService.getById(item.id);
          setSelectedTicket((res.data as any)?.ticket || res.data);
        } catch { setSelectedTicket(item); }
      }}
    >
      <Card style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle} numberOfLines={1}>{item.title}</Text>
          <Badge label={item.status} color={TICKET_STATUS_COLORS[item.status] || Colors.textTertiary} size="sm" />
        </View>
        <Text style={styles.ticketDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.ticketMeta}>
          <Badge label={item.priority} color={PRIORITY_COLORS[item.priority] || Colors.textTertiary} size="sm" />
          <Text style={styles.ticketTime}>{getRelativeTime(item.createdAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(i) => i.id}
        renderItem={renderTicket}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTickets(); }} />}
        ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title="No Tickets" message="Create a support ticket to get help" />}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Ticket Modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Ticket</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
          </View>
          <Input label="Title *" placeholder="Brief summary" value={createForm.title} onChangeText={(v) => setCreateForm((p) => ({ ...p, title: v }))} />
          <Input label="Description *" placeholder="Describe your issue..." value={createForm.description} onChangeText={(v) => setCreateForm((p) => ({ ...p, description: v }))} multiline numberOfLines={5} style={{ minHeight: 120, textAlignVertical: 'top' }} />
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipRow}>
            {TICKET_CATEGORIES.map((c) => (
              <TouchableOpacity key={c.value} style={[styles.chip, createForm.category === c.value && styles.chipActive]} onPress={() => setCreateForm((p) => ({ ...p, category: c.value }))}>
                <Text style={[styles.chipText, createForm.category === c.value && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.chipRow}>
            {TICKET_PRIORITIES.map((p) => (
              <TouchableOpacity key={p.value} style={[styles.chip, createForm.priority === p.value && styles.chipActive]} onPress={() => setCreateForm((prev) => ({ ...prev, priority: p.value }))}>
                <Text style={[styles.chipText, createForm.priority === p.value && styles.chipTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Submit Ticket" onPress={handleCreate} loading={sending} size="lg" style={{ marginTop: Spacing.lg }} />
        </ScrollView>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal visible={!!selectedTicket} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>Ticket Details</Text>
            <TouchableOpacity onPress={() => setSelectedTicket(null)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
          </View>
          {selectedTicket && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.detailTitle}>{selectedTicket.title}</Text>
              <View style={styles.detailMetaRow}>
                <Badge label={selectedTicket.status} color={TICKET_STATUS_COLORS[selectedTicket.status] || Colors.textTertiary} />
                <Badge label={selectedTicket.priority} color={PRIORITY_COLORS[selectedTicket.priority] || Colors.textTertiary} />
                <Text style={styles.detailDate}>{formatDate(selectedTicket.createdAt)}</Text>
              </View>
              <Text style={styles.detailDesc}>{selectedTicket.description}</Text>

              {isAdmin && selectedTicket.status !== 'CLOSED' && (
                <View style={styles.adminActions}>
                  {selectedTicket.status === 'OPEN' && (
                    <Button title="Mark In Progress" onPress={() => handleStatusChange(selectedTicket.id, 'IN_PROGRESS')} variant="outline" size="sm" />
                  )}
                  {selectedTicket.status !== 'RESOLVED' && (
                    <Button title="Resolve" onPress={() => handleStatusChange(selectedTicket.id, 'RESOLVED')} variant="primary" size="sm" />
                  )}
                  <Button title="Close" onPress={() => handleStatusChange(selectedTicket.id, 'CLOSED')} variant="ghost" size="sm" />
                </View>
              )}

              <Text style={styles.repliesTitle}>
                Replies ({selectedTicket.replies?.length || 0})
              </Text>
              {selectedTicket.replies?.map((r: TicketReply) => (
                <Card key={r.id} style={styles.replyCard}>
                  <Text style={styles.replyUser}>{r.user?.name || r.user?.email || 'User'}</Text>
                  <Text style={styles.replyMsg}>{r.message}</Text>
                  <Text style={styles.replyTime}>{getRelativeTime(r.createdAt)}</Text>
                </Card>
              ))}

              <View style={styles.replyInputRow}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Type a reply..."
                  placeholderTextColor={Colors.textTertiary}
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={handleReply}
                  disabled={sending || !replyText.trim()}
                >
                  <Ionicons name="send" size={20} color={sending ? Colors.textTertiary : Colors.primary} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg },
  ticketCard: { marginBottom: Spacing.sm },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  ticketTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, flex: 1, marginRight: Spacing.sm },
  ticketDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  ticketMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketTime: { fontSize: FontSize.xs, color: Colors.textTertiary },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalContent: { padding: Spacing.xxl, paddingBottom: Spacing.xxxl * 2 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, flex: 1 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceVariant },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  detailTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  detailMetaRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginBottom: Spacing.lg },
  detailDate: { fontSize: FontSize.xs, color: Colors.textTertiary },
  detailDesc: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },
  adminActions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl, flexWrap: 'wrap' },
  repliesTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  replyCard: { marginBottom: Spacing.sm },
  replyUser: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  replyMsg: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  replyTime: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.xs },
  replyInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.lg },
  replyInput: { flex: 1, backgroundColor: Colors.surfaceVariant, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text, maxHeight: 100 },
  sendBtn: { padding: Spacing.md },
});
