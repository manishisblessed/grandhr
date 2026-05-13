import React, { useEffect, useState } from 'react';
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
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../services/auth.service';
import {
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
  ThemeColors,
} from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { getInitials, formatDate, getRoleLabel } from '../../utils/formatters';
import { User } from '../../types';

export default function ProfileScreen() {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
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
      // fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!profile) setLoading(true);
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  if (loading && !profile) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Skeleton height={220} radius={BorderRadius.xl} />
        <Skeleton height={160} radius={BorderRadius.lg} />
        <Skeleton height={160} radius={BorderRadius.lg} />
      </ScrollView>
    );
  }

  const emp = profile?.employee;
  const displayName = emp
    ? `${emp.firstName} ${emp.lastName}`.trim()
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
          tintColor={Colors.primary}
        />
      }
    >
      {/* Hero card */}
      <LinearGradient
        colors={Gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{getInitials(displayName)}</Text>
          </View>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <View style={styles.heroBadges}>
          <Badge
            label={getRoleLabel(profile?.role || 'EMPLOYEE')}
            variant="solid"
            color="rgba(255,255,255,0.25)"
            size="sm"
            icon={
              <Ionicons name="shield-checkmark" size={11} color="#fff" />
            }
          />
          {emp?.designation?.name && (
            <Badge
              label={emp.designation.name}
              variant="solid"
              color="rgba(255,255,255,0.25)"
              size="sm"
              icon={<Ionicons name="briefcase" size={11} color="#fff" />}
            />
          )}
        </View>
      </LinearGradient>

      {/* Quick info strip */}
      <View style={styles.quickRow}>
        <QuickInfo
          icon="id-card"
          label="Employee ID"
          value={emp?.employeeId || '—'}
        />
        <QuickInfo
          icon="business"
          label="Department"
          value={emp?.department?.name || '—'}
        />
        <QuickInfo
          icon="calendar"
          label="Joined"
          value={emp?.joiningDate ? formatDate(emp.joiningDate) : '—'}
        />
      </View>

      {/* Personal */}
      <Section title="Personal information" icon="person-outline">
        <InfoRow icon="mail-outline" label="Email" value={profile?.email} />
        <InfoRow icon="call-outline" label="Phone" value={emp?.phone} />
        <InfoRow
          icon="calendar-outline"
          label="Date of birth"
          value={emp?.dateOfBirth ? formatDate(emp.dateOfBirth) : undefined}
        />
        <InfoRow icon="male-female-outline" label="Gender" value={emp?.gender} />
        <InfoRow
          icon="heart-outline"
          label="Marital status"
          value={emp?.maritalStatus}
        />
      </Section>

      {/* Employment */}
      <Section title="Employment details" icon="briefcase-outline">
        <InfoRow
          icon="id-card-outline"
          label="Employee ID"
          value={emp?.employeeId}
        />
        <InfoRow
          icon="business-outline"
          label="Department"
          value={emp?.department?.name}
        />
        <InfoRow
          icon="ribbon-outline"
          label="Designation"
          value={emp?.designation?.name}
        />
        <InfoRow
          icon="calendar-outline"
          label="Joining date"
          value={emp?.joiningDate ? formatDate(emp.joiningDate) : undefined}
        />
        <InfoRow
          icon="checkmark-circle-outline"
          label="Status"
          value={emp?.employmentStatus}
        />
      </Section>

      {/* Address */}
      <Section title="Address" icon="location-outline">
        <InfoRow
          icon="home-outline"
          label="Street"
          value={emp?.address}
        />
        <InfoRow icon="map-outline" label="City" value={emp?.city} />
        <InfoRow icon="navigate-outline" label="State" value={emp?.state} />
        <InfoRow icon="globe-outline" label="Country" value={emp?.country} />
      </Section>

      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={confirmSignOut}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color={Colors.error} />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

function QuickInfo({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const Colors = useColors();
  const qiStyles = useThemedStyles(makeQiStyles);
  return (
    <View style={qiStyles.box}>
      <View style={qiStyles.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <Text style={qiStyles.label}>{label}</Text>
      <Text style={qiStyles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  const Colors = useColors();
  const sectionStyles = useThemedStyles(makeSectionStyles);
  return (
    <Card padding="none" style={{ overflow: 'hidden' }}>
      <View style={sectionStyles.head}>
        <View style={sectionStyles.iconWrap}>
          <Ionicons name={icon} size={16} color={Colors.primary} />
        </View>
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      <View style={sectionStyles.body}>{children}</View>
    </Card>
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
  const Colors = useColors();
  const infoStyles = useThemedStyles(makeInfoStyles);
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={16} color={Colors.textTertiary} />
      <View style={infoStyles.textWrap}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value || '—'}</Text>
      </View>
    </View>
  );
}

const makeQiStyles = (Colors: ThemeColors) => StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'flex-start',
    gap: 4,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  value: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
});

const makeSectionStyles = (Colors: ThemeColors) => StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surfaceMuted,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  body: { padding: Spacing.lg, gap: Spacing.sm },
});

const makeInfoStyles = (Colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  textWrap: { flex: 1 },
  label: {
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginTop: 1,
    fontWeight: '500',
  },
});

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    marginBottom: Spacing.md,
  },
  avatar: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#fff',
  },
  email: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  quickRow: { flexDirection: 'row', gap: Spacing.sm },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.error,
  },
});
