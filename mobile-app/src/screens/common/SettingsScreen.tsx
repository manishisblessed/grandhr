import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../services/auth.service';
import { WHATSAPP_URL, WHATSAPP_MESSAGE } from '../../constants/config';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }
    if (newPw.length < 6) {
      Alert.alert('Validation', 'New password must be at least 6 characters');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Validation', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await AuthService.changePassword(currentPw, newPw);
      Alert.alert('Success', 'Password changed successfully');
      setShowChangePw(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Card>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingRow
          icon="mail-outline"
          label="Email"
          value={user?.email || '—'}
        />
        <SettingRow
          icon="shield-outline"
          label="Role"
          value={user?.role?.replace('_', ' ') || '—'}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowChangePw(!showChangePw)}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="key-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.menuLabel}>Change Password</Text>
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
              label="Current Password"
              placeholder="Enter current password"
              isPassword
              value={currentPw}
              onChangeText={setCurrentPw}
            />
            <Input
              label="New Password"
              placeholder="Min 6 characters"
              isPassword
              value={newPw}
              onChangeText={setNewPw}
            />
            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              isPassword
              value={confirmPw}
              onChangeText={setConfirmPw}
            />
            <Button
              title="Update Password"
              onPress={handleChangePassword}
              loading={loading}
            />
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <SettingRow icon="information-circle-outline" label="Version" value={Constants.expoConfig?.version || '1.0.0'} />
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Linking.openURL(`${WHATSAPP_URL}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`).catch(() => {})}
        >
          <View style={rowStyles.left}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={rowStyles.label}>Chat on WhatsApp</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      </Card>

      <Button
        title="Sign Out"
        onPress={() => {
          Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
          ]);
        }}
        variant="danger"
        size="lg"
        style={styles.logoutBtn}
      />
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

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuLabel: { fontSize: FontSize.md, color: Colors.text },
  changePwForm: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  logoutBtn: { marginTop: Spacing.xxl },
});
