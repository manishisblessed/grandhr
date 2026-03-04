import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { DocumentService, GeneratedDocument } from '../../services/document.service';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { formatDate } from '../../utils/formatters';

const DOC_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  OFFER_LETTER: 'document-text-outline',
  APPOINTMENT_LETTER: 'document-outline',
  SALARY_SLIP: 'wallet-outline',
  EXPERIENCE_LETTER: 'ribbon-outline',
  RELIEVING_LETTER: 'exit-outline',
  TERMINATION_LETTER: 'alert-circle-outline',
  WARNING_LETTER: 'warning-outline',
  INCREMENT_LETTER: 'trending-up-outline',
};

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await DocumentService.getMyDocuments();
      const data = res.data;
      setDocuments(Array.isArray(data) ? data : (data as any)?.documents || []);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleDelete = (doc: GeneratedDocument) => {
    Alert.alert('Delete Document', `Delete "${doc.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await DocumentService.delete(doc.id);
            fetchDocs();
          } catch {}
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading documents..." />;

  const renderItem = ({ item }: { item: GeneratedDocument }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name={DOC_ICONS[item.documentType] || 'document-outline'}
          size={28}
          color={Colors.primary}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.type}>
            {item.documentType.replace(/_/g, ' ')}
          </Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <Ionicons
          name="trash-outline"
          size={20}
          color={Colors.error}
          onPress={() => handleDelete(item)}
        />
      </View>
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      data={documents}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchDocs(); }}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="document-outline"
          title="No Documents"
          message="Your generated documents will appear here"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg },
  card: { marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  info: { flex: 1 },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  type: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2, textTransform: 'capitalize' },
  date: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
});
