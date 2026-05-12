import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import {
  DocumentService,
  GeneratedDocument,
} from '../../services/document.service';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
  GradientKey,
} from '../../constants/theme';
import { formatDate } from '../../utils/formatters';

const DOC_META: Record<
  string,
  {
    icon: keyof typeof Ionicons.glyphMap;
    gradient: GradientKey;
    label: string;
  }
> = {
  OFFER_LETTER: {
    icon: 'document-text',
    gradient: 'violetIndigo',
    label: 'Offer Letter',
  },
  APPOINTMENT_LETTER: {
    icon: 'briefcase',
    gradient: 'cyanSky',
    label: 'Appointment Letter',
  },
  SALARY_SLIP: {
    icon: 'wallet',
    gradient: 'amberOrange',
    label: 'Salary Slip',
  },
  EXPERIENCE_LETTER: {
    icon: 'ribbon',
    gradient: 'emeraldTeal',
    label: 'Experience Letter',
  },
  RELIEVING_LETTER: {
    icon: 'exit',
    gradient: 'pinkRose',
    label: 'Relieving Letter',
  },
  TERMINATION_LETTER: {
    icon: 'alert-circle',
    gradient: 'redOrange',
    label: 'Termination Letter',
  },
  WARNING_LETTER: {
    icon: 'warning',
    gradient: 'amberOrange',
    label: 'Warning Letter',
  },
  INCREMENT_LETTER: {
    icon: 'trending-up',
    gradient: 'emeraldTeal',
    label: 'Increment Letter',
  },
};

const DEFAULT_META = {
  icon: 'document' as keyof typeof Ionicons.glyphMap,
  gradient: 'violetIndigoSoft' as GradientKey,
  label: 'Document',
};

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Letters', value: 'LETTER' },
  { label: 'Payroll', value: 'PAYROLL' },
];

const PAYROLL_TYPES = ['SALARY_SLIP'];

export default function DocumentsScreen() {
  const toast = useToast();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'LETTER' | 'PAYROLL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await DocumentService.getMyDocuments();
      const data = res.data;
      setDocuments(
        Array.isArray(data) ? data : (data as any)?.documents || [],
      );
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const filtered = documents.filter((d) => {
    if (filter === 'ALL') return true;
    if (filter === 'PAYROLL') return PAYROLL_TYPES.includes(d.documentType);
    return !PAYROLL_TYPES.includes(d.documentType);
  });

  const handleDelete = (doc: GeneratedDocument) => {
    Alert.alert(
      'Delete document',
      `Permanently delete "${doc.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DocumentService.delete(doc.id);
              toast.success('Document deleted');
              fetchDocs();
            } catch (e: any) {
              toast.error(
                e?.response?.data?.message || 'Failed to delete document',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchDocs();
          }}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Hero */}
      <LinearGradient
        colors={Gradients.cyanSky}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroIconWrap}>
          <Ionicons name="folder" size={26} color="#fff" />
        </View>
        <Text style={styles.heroEyebrow}>YOUR DOCUMENTS</Text>
        <Text style={styles.heroTitle}>
          {documents.length} {documents.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.heroSub}>
          Letters, slips and certificates from HR
        </Text>
      </LinearGradient>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, active && styles.filterActive]}
              onPress={() => setFilter(f.value as any)}
            >
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={{ gap: Spacing.sm }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={84} radius={BorderRadius.lg} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="document-outline"
            title="No documents"
            message="Documents from HR will appear here once they're shared"
          />
        </Card>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {filtered.map((d) => {
            const meta = DOC_META[d.documentType] || DEFAULT_META;
            return (
              <Card key={d.id} padding="none">
                <View style={styles.row}>
                  <LinearGradient
                    colors={Gradients[meta.gradient]}
                    style={styles.docIcon}
                  >
                    <Ionicons name={meta.icon} size={22} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.title} numberOfLines={1}>
                      {d.title}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {meta.label} · {formatDate(d.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        toast.info('Viewing in-app coming soon — open on web')
                      }
                    >
                      <Ionicons
                        name="eye-outline"
                        size={18}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => handleDelete(d)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={Colors.error}
                      />
                    </TouchableOpacity>
                  </View>
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
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
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
    marginTop: 2,
  },

  filterRow: { flexDirection: 'row', gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  filterTextActive: { color: '#fff' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
});
