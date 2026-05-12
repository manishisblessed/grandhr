import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../components/common/Toast';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from '../../constants/theme';
import { getInitials } from '../../utils/formatters';
import { Haptic } from '../../utils/haptics';

export default function EmployeeIdCardScreen() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [flipped, setFlipped] = useState(false);
  const qrRef = useRef<any>(null);

  const flipCard = () => {
    Haptic.selection();
    setFlipped((v) => !v);
  };

  const employee = user?.employee;
  const fullName = employee
    ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() ||
      user?.email ||
      'Employee'
    : user?.email || 'Employee';
  const empId = employee?.employeeId || '—';
  const department = employee?.department?.name || '—';
  const designation = employee?.designation?.name || '—';
  const company = 'GrandHR';
  const email = user?.email || '—';
  const phone = (employee as any)?.phone || '—';
  const initials = getInitials(fullName) || 'EE';

  const qrPayload = JSON.stringify({
    id: empId,
    name: fullName,
    company,
    issued: new Date().toISOString(),
  });

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${fullName} · ${company}`,
        message: `${fullName}\nEmployee ID: ${empId}\n${designation} · ${department}\n${company}`,
      });
    } catch {
      // user cancelled
    }
  };

  const handleSave = () => {
    Alert.alert(
      'Save ID card',
      'PDF export from the mobile app is coming soon. For now, view this card on the web app to download a PDF.',
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My ID Card</Text>
          <Text style={styles.subtitle}>
            Tap the card to flip · Share or save anytime
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.95}
        onPress={flipCard}
        style={styles.cardWrap}
      >
        {!flipped ? (
          /* Front */
          <LinearGradient
            colors={['#1a1830', '#0f0e1f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* radial mesh accents */}
            <View style={[styles.mesh, styles.meshA]} />
            <View style={[styles.mesh, styles.meshB]} />

            <View style={styles.cardHeader}>
              <View style={styles.brand}>
                <View style={styles.brandIcon}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                </View>
                <Text style={styles.brandText}>{company}</Text>
              </View>
              <Text style={styles.cardKind}>EMPLOYEE</Text>
            </View>

            <View style={styles.avatarSection}>
              <View style={styles.avatarRing}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.avatar}
                >
                  <Text style={styles.initials}>{initials}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.designation}>{designation}</Text>
              <Text style={styles.department}>{department}</Text>
            </View>

            <View style={styles.infoBox}>
              <InfoRow label="ID" value={empId} />
              <InfoRow label="Email" value={email} />
            </View>

            <View style={styles.qrSection}>
              <View style={styles.qrBox}>
                <QRCode
                  value={qrPayload}
                  size={72}
                  backgroundColor="#ffffff"
                  color="#1a1830"
                  getRef={(c) => (qrRef.current = c)}
                />
              </View>
              <Text style={styles.qrLabel}>SCAN TO VERIFY</Text>
            </View>
          </LinearGradient>
        ) : (
          /* Back */
          <LinearGradient
            colors={['#0f0e1f', '#1a1830']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={[styles.mesh, styles.meshC]} />
            <View style={styles.magstripe} />

            <View style={styles.backHeader}>
              <Text style={styles.backTitle}>Contact</Text>
              <Text style={styles.cardKind}>OFFICIAL</Text>
            </View>

            <View style={styles.backList}>
              <BackRow icon="mail-outline" label="Email" value={email} />
              <BackRow icon="call-outline" label="Phone" value={phone} />
              <BackRow
                icon="business-outline"
                label="Department"
                value={department}
              />
              <BackRow
                icon="ribbon-outline"
                label="Designation"
                value={designation}
              />
              <BackRow
                icon="id-card-outline"
                label="Employee ID"
                value={empId}
              />
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This card is the property of {company}. If found, please return
                to HR or contact us immediately.
              </Text>
            </View>
          </LinearGradient>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        <Ionicons name="information-circle-outline" size={12} />{' '}
        Tap the card to see contact details
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <View
            style={[styles.actionIcon, { backgroundColor: Colors.info + '15' }]}
          >
            <Ionicons name="share-outline" size={20} color={Colors.info} />
          </View>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: Colors.primary + '15' },
            ]}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={flipCard}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: Colors.secondary + '15' },
            ]}
          >
            <Ionicons
              name="sync-outline"
              size={20}
              color={Colors.secondary}
            />
          </View>
          <Text style={styles.actionText}>Flip</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function BackRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={backRowStyles.row}>
      <View style={backRowStyles.iconWrap}>
        <Ionicons name={icon} size={16} color="rgba(255,255,255,0.85)" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={backRowStyles.label}>{label}</Text>
        <Text style={backRowStyles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  value: {
    fontSize: FontSize.xs,
    color: '#fff',
    fontWeight: '500',
    maxWidth: 180,
  },
});

const backRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  value: {
    fontSize: FontSize.sm,
    color: '#fff',
    fontWeight: '600',
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  header: {},
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  cardWrap: { alignItems: 'center', paddingVertical: Spacing.lg },
  card: {
    width: 320,
    height: 500,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#1a1830',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'hidden',
  },

  mesh: { position: 'absolute', borderRadius: 9999, opacity: 0.5 },
  meshA: {
    width: 280,
    height: 280,
    backgroundColor: '#8B5CF6',
    top: -100,
    left: -60,
    opacity: 0.35,
  },
  meshB: {
    width: 240,
    height: 240,
    backgroundColor: '#6366F1',
    bottom: -80,
    right: -60,
    opacity: 0.3,
  },
  meshC: {
    width: 320,
    height: 320,
    backgroundColor: '#7C3AED',
    top: -100,
    right: -100,
    opacity: 0.2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
  cardKind: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },

  avatarSection: { alignItems: 'center', marginTop: Spacing.md },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    marginBottom: Spacing.md,
  },
  avatar: {
    flex: 1,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
  },
  name: {
    color: '#fff',
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  designation: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  department: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  infoBox: {
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 4,
  },

  qrSection: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
  },
  qrBox: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: BorderRadius.sm,
  },
  qrLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  /* Back */
  magstripe: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#000',
    opacity: 0.7,
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  backList: { marginTop: 70, gap: 2 },
  disclaimer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  disclaimerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },

  hint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
});
