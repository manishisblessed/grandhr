import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useNotificationStore } from '../../store/useNotificationStore';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
} from '../../constants/theme';
import { getRelativeTime } from '../../utils/formatters';
import { Haptic } from '../../utils/haptics';
import { Notification } from '../../types';

type FilterKey = 'all' | 'unread';

interface TypeStyle {
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  gradient: [string, string];
}

const typeStyleFor = (type: string): TypeStyle => {
  const t = type.toUpperCase();
  if (t.includes('LEAVE'))
    return { icon: 'calendar-outline', gradient: Gradients.amberOrange };
  if (t.includes('ATTEND') || t.includes('CLOCK'))
    return { icon: 'time-outline', gradient: Gradients.emeraldTeal };
  if (t.includes('PAYROLL') || t.includes('SALARY'))
    return { icon: 'wallet-outline', gradient: Gradients.cyanSky };
  if (t.includes('DOC') || t.includes('LETTER'))
    return { icon: 'document-text-outline', gradient: Gradients.violetIndigo };
  if (t.includes('ALERT') || t.includes('ERROR'))
    return { icon: 'alert-circle-outline', gradient: Gradients.redOrange };
  return { icon: 'notifications-outline', gradient: Gradients.brand };
};

export default function NotificationsScreen() {
  const {
    notifications,
    isLoading,
    fetch,
    markAsRead,
    markAllAsRead,
    remove,
  } = useNotificationStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState<FilterKey>('all');

  useEffect(() => {
    fetch();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const unread = notifications.filter((n) => !n.isRead).length;
  const visible = useMemo(
    () => (filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications),
    [filter, notifications],
  );

  const handleMarkAll = () => {
    if (unread === 0) return;
    Haptic.success();
    markAllAsRead();
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const ts = typeStyleFor(item.type);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (!item.isRead) {
            Haptic.selection();
            markAsRead(item.id);
          }
        }}
      >
        <Card style={[styles.item, !item.isRead && styles.unread]}>
          <View style={styles.itemRow}>
            <LinearGradient
              colors={ts.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconTile}
            >
              <Ionicons name={ts.icon} size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.itemContent}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {!item.isRead && <View style={styles.dot} />}
              </View>
              <Text style={styles.itemMessage} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.itemTime}>
                {getRelativeTime(item.createdAt)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptic.light();
                remove(item.id);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.removeBtn}
            >
              <Ionicons
                name="close"
                size={16}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const initialLoading = isLoading && notifications.length === 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroBellWrap}>
            <Ionicons name="notifications" size={26} color="#fff" />
            {unread > 0 && (
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {unread > 99 ? '99+' : unread}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Notifications</Text>
            <Text style={styles.heroSubtitle}>
              {unread > 0
                ? `You have ${unread} unread update${unread === 1 ? '' : 's'}`
                : "You're all caught up"}
            </Text>
          </View>
          {unread > 0 && (
            <TouchableOpacity
              onPress={handleMarkAll}
              activeOpacity={0.85}
              style={styles.heroAction}
            >
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.heroActionText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(
          [
            { id: 'all' as FilterKey, label: 'All', count: notifications.length },
            { id: 'unread' as FilterKey, label: 'Unread', count: unread },
          ]
        ).map((f) => {
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => {
                Haptic.selection();
                setFilter(f.id);
              }}
              activeOpacity={0.85}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  active && styles.filterCountActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    active && styles.filterCountTextActive,
                  ]}
                >
                  {f.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {initialLoading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} style={styles.item}>
              <View style={styles.itemRow}>
                <Skeleton width={40} height={40} radius={BorderRadius.md} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="90%" height={12} />
                  <Skeleton width="35%" height={10} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title={filter === 'unread' ? 'No unread notifications' : 'No Notifications'}
              message={
                filter === 'unread'
                  ? "You've read everything — nice work."
                  : "You're all caught up!"
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  hero: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroBellWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  heroText: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: FontSize.xl, fontWeight: '700' },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroActionText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },

  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: { color: '#fff' },
  filterCount: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterCountTextActive: { color: '#fff' },

  list: { padding: Spacing.lg, paddingTop: 0 },
  item: { marginBottom: Spacing.sm },
  unread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1 },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  itemMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  itemTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundAlt,
  },
});
