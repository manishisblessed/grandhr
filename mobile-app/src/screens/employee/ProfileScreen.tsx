import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../services/auth.service';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { getInitials, formatDate } from '../../utils/formatters';
import { User } from '../../types';

export default function ProfileScreen() {
  const { user, signOut, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await AuthService.getProfile();
      setProfile(res.data);
      setUser(res.data);
    } catch {
      // fallback to stored user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, []);

  if (loading && !profile) return <LoadingSpinner />;

  const emp = profile?.employee;
  const displayName = emp
    ? `${emp.firstName} ${emp.lastName}`
    : profile?.name || 'User';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchProfile();
          }}
        />
      }
    >
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(displayName)}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.role}>{profile?.role?.replace('_', ' ')}</Text>
        {emp?.designation && (
          <Text style={styles.designation}>{emp.designation.name}</Text>
        )}
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoRow icon="mail-outline" label="Email" value={profile?.email} />
        <InfoRow icon="call-outline" label="Phone" value={emp?.phone} />
        <InfoRow icon="calendar-outline" label="Date of Birth" value={emp?.dateOfBirth ? formatDate(emp.dateOfBirth) : undefined} />
        <InfoRow icon="person-outline" label="Gender" value={emp?.gender} />
        <InfoRow icon="heart-outline" label="Marital Status" value={emp?.maritalStatus} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Employment Details</Text>
        <InfoRow icon="id-card-outline" label="Employee ID" value={emp?.employeeId} />
        <InfoRow icon="business-outline" label="Department" value={emp?.department?.name} />
        <InfoRow icon="ribbon-outline" label="Designation" value={emp?.designation?.name} />
        <InfoRow icon="calendar-outline" label="Joining Date" value={emp?.joiningDate ? formatDate(emp.joiningDate) : undefined} />
        <InfoRow icon="briefcase-outline" label="Status" value={emp?.employmentStatus} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <InfoRow icon="location-outline" label="Address" value={emp?.address} />
        <InfoRow icon="map-outline" label="City" value={emp?.city} />
        <InfoRow icon="navigate-outline" label="State" value={emp?.state} />
        <InfoRow icon="globe-outline" label="Country" value={emp?.country} />
      </Card>

      <Button
        title="Sign Out"
        onPress={signOut}
        variant="danger"
        size="lg"
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
}) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={Colors.textTertiary} />
      <View style={infoStyles.textWrap}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value || '—'}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  textWrap: { flex: 1 },
  label: { fontSize: FontSize.xs, color: Colors.textTertiary },
  value: { fontSize: FontSize.md, color: Colors.text, marginTop: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  initials: { fontSize: FontSize.xxxl, fontWeight: '700', color: '#fff' },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  role: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  designation: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginTop: 2,
  },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  logoutBtn: { marginTop: Spacing.lg, marginBottom: Spacing.xxxl },
});
