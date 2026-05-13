import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../components/common/Toast';
import { Flags } from '../../constants/flags';
import { FontSize, Spacing, BorderRadius, ThemeColors } from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const CONFIRM_PHRASE = 'DELETE';

/**
 * In-app account deletion flow. Required by Google Play policy (Dec 2023)
 * for any app with user accounts. Apple App Store has the same requirement
 * via section 5.1.1(v) of the Review Guidelines.
 */
export default function DeleteAccountScreen({ navigation }: any) {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = password.length > 0 && confirm.trim().toUpperCase() === CONFIRM_PHRASE;

  const handleDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile and access. Workplace records your employer is legally required to keep (e.g. payroll) are retained per their data policy. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const res = await deleteAccount(password);
            setLoading(false);
            if (res.error) {
              toast.error(res.error);
            } else {
              toast.success('Account deleted. Signing out...');
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWrap}>
          <Ionicons name="trash-outline" size={32} color={Colors.error} />
        </View>
        <Text style={styles.title}>Delete your account</Text>
        <Text style={styles.subtitle}>
          We're sorry to see you go. Please read what happens before you
          continue.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>What gets deleted</Text>
          <Bullet>Your profile, contact details, and login credentials.</Bullet>
          <Bullet>Your support tickets and in-app chats.</Bullet>
          <Bullet>Your session on this and all other devices.</Bullet>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>What may be retained</Text>
          <Bullet>Employment records your employer is required to retain by law (e.g. payroll, tax documents, contracts).</Bullet>
          <Bullet>De-identified aggregate analytics that cannot be traced back to you.</Bullet>
          <Text style={styles.subtle}>
            Questions about what your employer retains? Contact your HR
            administrator directly.
          </Text>
        </Card>

        <Card style={[styles.card, styles.dangerCard]}>
          <Text style={styles.sectionTitle}>Confirm deletion</Text>
          <Input
            label="Current password"
            placeholder="Re-enter your password"
            isPassword
            value={password}
            onChangeText={setPassword}
          />
          <Input
            label={`Type ${CONFIRM_PHRASE} to confirm`}
            placeholder={CONFIRM_PHRASE}
            autoCapitalize="characters"
            value={confirm}
            onChangeText={setConfirm}
          />
          <Button
            title="Delete my account"
            variant="danger"
            onPress={handleDelete}
            loading={loading}
            disabled={!canSubmit}
            size="lg"
          />
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={{ marginTop: Spacing.sm }}
          />
        </Card>

        <Text style={styles.webLink}>
          You can also request deletion via the web at{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(Flags.accountDeletionUrl)}
          >
            {Flags.accountDeletionUrl}
          </Text>
          .
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.bulletRow}>
      <View style={styles.dot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xxl },
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  card: { marginBottom: Spacing.lg },
  dangerCard: { borderWidth: 1, borderColor: Colors.errorLight },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  bulletRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 9 },
  bulletText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 22 },
  subtle: { marginTop: Spacing.sm, fontSize: FontSize.xs, color: Colors.textTertiary, lineHeight: 18 },
  webLink: {
    marginTop: Spacing.lg,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  link: { color: Colors.primary, fontWeight: '600' },
});
