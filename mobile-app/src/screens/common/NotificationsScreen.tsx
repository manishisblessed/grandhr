import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { getRelativeTime } from '../../utils/formatters';
import { Notification } from '../../types';

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

  useEffect(() => {
    fetch();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  if (isLoading && notifications.length === 0) {
    return <LoadingSpinner message="Loading notifications..." />;
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => !item.isRead && markAsRead(item.id)}
    >
      <Card style={[styles.item, !item.isRead && styles.unread]}>
        <View style={styles.itemRow}>
          <View style={styles.dotWrap}>
            {!item.isRead && <View style={styles.dot} />}
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.itemTime}>
              {getRelativeTime(item.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => remove(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {unread > 0 && (
        <View style={styles.header}>
          <Text style={styles.unreadText}>{unread} unread</Text>
          <Button
            title="Mark all read"
            onPress={markAllAsRead}
            variant="ghost"
            size="sm"
          />
        </View>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            message="You're all caught up!"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unreadText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  list: { padding: Spacing.lg },
  item: { marginBottom: Spacing.sm },
  unread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  dotWrap: { width: 8, paddingTop: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  itemMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
});
