import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import { AuthService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { firstPasswordError, isPasswordStrong, PASSWORD_MIN_LENGTH } from '../../utils/password';
import { Flags } from '../../constants/flags';

type Props = NativeStackScreenProps<any, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const signInWithSession = useAuthStore((s) => s.signInWithSession);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const update = (key: string, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';

    if (!form.password) e.password = 'Required';
    else {
      const pwErr = firstPasswordError(form.password);
      if (pwErr) e.password = pwErr;
    }
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    if (!acceptedTerms) e.terms = 'Please accept the Terms and Privacy Policy';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await AuthService.register({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        employeeId: form.employeeId.trim() || undefined,
        role: 'EMPLOYEE',
      });
      const { user, token } = res.data;
      await signInWithSession(user, token);
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = acceptedTerms && isPasswordStrong(form.password);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register as an employee</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <Input
              label="First Name"
              placeholder="John"
              value={form.firstName}
              onChangeText={(v) => update('firstName', v)}
              error={errors.firstName}
              containerStyle={styles.halfInput}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={form.lastName}
              onChangeText={(v) => update('lastName', v)}
              error={errors.lastName}
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label="Email"
            placeholder="you@company.com"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => update('email', v)}
            error={errors.email}
          />

          <Input
            label="Employee ID (optional)"
            placeholder="EMP001"
            leftIcon="id-card-outline"
            value={form.employeeId}
            onChangeText={(v) => update('employeeId', v)}
          />

          <Input
            label="Password"
            placeholder={`Min ${PASSWORD_MIN_LENGTH} chars, with upper, lower, digit & symbol`}
            leftIcon="lock-closed-outline"
            isPassword
            value={form.password}
            onChangeText={(v) => update('password', v)}
            error={errors.password}
          />
          <PasswordStrengthMeter value={form.password} />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            leftIcon="lock-closed-outline"
            isPassword
            value={form.confirmPassword}
            onChangeText={(v) => update('confirmPassword', v)}
            error={errors.confirmPassword}
          />

          <TouchableOpacity
            style={styles.consentRow}
            activeOpacity={0.7}
            onPress={() => setAcceptedTerms((v) => !v)}
          >
            <Ionicons
              name={acceptedTerms ? 'checkbox' : 'square-outline'}
              size={22}
              color={acceptedTerms ? Colors.primary : Colors.textTertiary}
            />
            <Text style={styles.consentText}>
              I agree to the{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(Flags.termsUrl)}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(Flags.privacyUrl)}>
                Privacy Policy
              </Text>
              , and consent to processing of my personal data for HR
              administration by my employer.
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          <Button
            title="Register"
            onPress={handleRegister}
            loading={loading}
            disabled={!canSubmit}
            size="lg"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkBtn}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.xxl, justifyContent: 'center' },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1 },
  linkBtn: { marginTop: Spacing.lg, alignItems: 'center' },
  linkText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  linkBold: { color: Colors.primary, fontWeight: '600' },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  consentText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  link: { color: Colors.primary, fontWeight: '600' },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.sm,
  },
});
