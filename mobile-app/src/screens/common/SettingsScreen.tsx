import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../services/auth.service';
import { WHATSAPP_URL, WHATSAPP_MESSAGE, SUPPORT_EMAIL } from '../../constants/config';
import { Flags } from '../../constants/flags';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import {
  firstPasswordError,
  isPasswordStrong,
  PASSWORD_MIN_LENGTH,
} from '../../utils/password';
import { useAppLock } from '../../services/appLock';
import { useToast } from '../../components/common/Toast';
import { useTheme, AppearanceMode } from '../../theme/ThemeProvider';
import { Haptic } from '../../utils/haptics';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const { user, signOut } = useAuthStore();
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const appLock = useAppLock();
  const theme = useTheme();

  const setAppearance = async (next: AppearanceMode) => {
    if (next === theme.mode) return;
    Haptic.selection();
    await theme.setMode(next);
    toast.success(`Appearance set to ${next}`);
  };

  const validatePw = () => {
    const e: Record<string, string> = {};
    if (!currentPw) e.current = 'Required';
    if (!newPw) e.next = 'Required';
    else {
      const pwErr = firstPasswordError(newPw);
      if (pwErr) e.next = pwErr;
    }
    if (newPw && newPw === currentPw) e.next = 'New password must differ from current';
    if (newPw !== confirmPw) e.confirm = 'Passwords do not match';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePw()) return;
    setLoading(true);
    try {
      await AuthService.changePassword(currentPw, newPw);
      toast.success('Password updated');
      setShowChangePw(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwErrors({});
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not change password');
    } finally {
      setLoading(false);
    }
  };

  const toggleAppLock = async (next: boolean) => {
    if (Flags.requireAppLock && !next) {
      Alert.alert('Locked by policy', 'Your administrator requires app lock to stay enabled.');
      return;
    }
    const ok = await appLock.setEnabled(next);
    if (next && !ok) {
      toast.error('Authentication failed');
    } else {
      toast.success(next ? 'App lock enabled' : 'App lock disabled');
    }
  };

  const openMail = () =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=GrandHR%20support`).catch(() => {});
  const openWhatsApp = () => {
    if (!WHATSAPP_URL) return;
    Linking.openURL(`${WHATSAPP_URL}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`).catch(() => {});
  };

  const appLockSubtitle = (() => {
    if (!appLock.capabilities.hardwareSupported) return 'Not supported on this device';
    if (!appLock.capabilities.enrolled) return 'Enrol Face ID / fingerprint on your device first';
    return 'Require biometric authentication on launch';
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingRow icon="mail-outline" label="Email" value={user?.email || '—'} />
        <SettingRow icon="shield-outline" label="Role" value={user?.role?.replace('_', ' ') || '—'} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <View style={styles.switchRow}>
          <View style={styles.menuLeft}>
            <Ionicons name="finger-print" size={20} color={Colors.textSecondary} />
            <View style={styles.switchText}>
              <Text style={styles.menuLabel}>Biometric app lock</Text>
              <Text style={styles.menuSub}>{appLockSubtitle}</Text>
            </View>
          </View>
          <Switch
            value={appLock.enabled}
            onValueChange={toggleAppLock}
            disabled={!appLock.capabilities.hardwareSupported || !appLock.capabilities.enrolled}
          />
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowChangePw(!showChangePw)}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="key-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.menuLabel}>Change password</Text>
          </View>
          <Ionicons
            name={showChangePw ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.textTertiary}
          />
        </TouchableOpacity>

        {showChangePw && (
          <View style={styles.changePwForm}>
            <Input
              label="Current password"
              placeholder="Enter current password"
              isPassword
              value={currentPw}
              onChangeText={setCurrentPw}
              error={pwErrors.current}
            />
            <Input
              label="New password"
              placeholder={`Min ${PASSWORD_MIN_LENGTH} chars, mixed case, digit & symbol`}
              isPassword
              value={newPw}
              onChangeText={setNewPw}
              error={pwErrors.next}
            />
            <PasswordStrengthMeter value={newPw} />
            <Input
              label="Confirm new password"
              placeholder="Re-enter new password"
              isPassword
              value={confirmPw}
              onChangeText={setConfirmPw}
              error={pwErrors.confirm}
            />
            <Button
              title="Update password"
              onPress={handleChangePassword}
              loading={loading}
              disabled={!isPasswordStrong(newPw) || newPw !== confirmPw}
            />
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Text style={styles.sectionHint}>
          Choose how GrandHR looks. System follows your device theme.
        </Text>
        <View style={styles.segment}>
          {(
            [
              { id: 'system' as AppearanceMode, label: 'System', icon: 'phone-portrait-outline' as const },
              { id: 'light' as AppearanceMode, label: 'Light', icon: 'sunny-outline' as const },
              { id: 'dark' as AppearanceMode, label: 'Dark', icon: 'moon-outline' as const },
            ]
          ).map((opt) => {
            const active = theme.mode === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                onPress={() => setAppearance(opt.id)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color={active ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.menuItem} onPress={openMail}>
          <View style={styles.menuLeft}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.menuLabel}>Email support</Text>
          </View>
          <Text style={styles.menuValue}>{SUPPORT_EMAIL}</Text>
        </TouchableOpacity>
        {WHATSAPP_URL ? (
          <TouchableOpacity style={styles.menuItem} onPress={openWhatsApp}>
            <View style={styles.menuLeft}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={styles.menuLabel}>Chat on WhatsApp</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <NavRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        <NavRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => navigation.navigate('Terms')}
        />
        <NavRow
          icon="code-slash-outline"
          label="Open-source licenses"
          onPress={() => navigation.navigate('OpenSourceLicenses')}
        />
        <NavRow
          icon="information-circle-outline"
          label="About"
          onPress={() => navigation.navigate('About')}
        />
      </Card>

      <Card style={[styles.section, styles.dangerSection]}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger zone</Text>
        <NavRow
          icon="trash-outline"
          label="Delete my account"
          danger
          onPress={() => navigation.navigate('DeleteAccount')}
        />
      </Card>

      <Button
        title="Sign out"
        onPress={() => {
          Alert.alert('Sign out?', 'You will need to log in again.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
          ]);
        }}
        variant="danger"
        size="lg"
        style={styles.logoutBtn}
      />

      <Text style={styles.footer}>
        v{Constants.expoConfig?.version || '1.0.0'} · {Flags.buildChannel}
      </Text>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <Ionicons name={icon} size={20} color={Colors.textSecondary} />
        <Text style={rowStyles.label}>{label}</Text>
      </View>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

function NavRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const color = danger ? Colors.error : Colors.textSecondary;
  const labelColor = danger ? Colors.error : Colors.text;
  return (
    <TouchableOpacity style={rowStyles.row} onPress={onPress}>
      <View style={rowStyles.left}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[rowStyles.label, { color: labelColor }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexShrink: 1 },
  label: { fontSize: FontSize.md, color: Colors.text },
  value: { fontSize: FontSize.sm, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  section: { marginTop: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dangerSection: { borderWidth: 1, borderColor: Colors.errorLight },
  dangerTitle: { color: Colors.error, borderBottomColor: Colors.errorLight },
  sectionHint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.md,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: { color: Colors.primary },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  switchText: { flexShrink: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexShrink: 1 },
  menuLabel: { fontSize: FontSize.md, color: Colors.text },
  menuSub: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  menuValue: { fontSize: FontSize.xs, color: Colors.textTertiary, maxWidth: '55%', textAlign: 'right' },
  changePwForm: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  logoutBtn: { marginTop: Spacing.xxl },
  footer: {
    marginTop: Spacing.lg,
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
