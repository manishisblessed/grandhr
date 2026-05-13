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
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import { CompanyService } from '../../services/company.service';
import { useAuthStore } from '../../store/useAuthStore';
import { FontSize, Spacing, BorderRadius, ThemeColors } from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { firstPasswordError, isPasswordStrong, PASSWORD_MIN_LENGTH } from '../../utils/password';
import { Flags } from '../../constants/flags';

export default function CompanyOnboardingScreen({ navigation }: any) {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showIndiaTax, setShowIndiaTax] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [company, setCompany] = useState({
    name: '',
    legalName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    taxId: '',
    registrationNumber: '',
    panNumber: '',
    gstNumber: '',
  });
  const [admin, setAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateCompany = (k: string, v: string) =>
    setCompany((p) => ({ ...p, [k]: v }));
  const updateAdmin = (k: string, v: string) =>
    setAdmin((p) => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!company.name.trim()) e.companyName = 'Required';
    if (!company.email.trim()) e.companyEmail = 'Required';
    else if (!/\S+@\S+\.\S+/.test(company.email))
      e.companyEmail = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!admin.firstName.trim()) e.adminFirstName = 'Required';
    if (!admin.lastName.trim()) e.adminLastName = 'Required';
    if (!admin.email.trim()) e.adminEmail = 'Required';
    else if (!/\S+@\S+\.\S+/.test(admin.email))
      e.adminEmail = 'Invalid email';
    if (!admin.password) e.adminPassword = 'Required';
    else {
      const pwErr = firstPasswordError(admin.password);
      if (pwErr) e.adminPassword = pwErr;
    }
    if (admin.password !== admin.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    if (!acceptedTerms) e.terms = 'Please accept the Terms and Privacy Policy';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const res = await CompanyService.register({
        company: {
          name: company.name.trim(),
          legalName: company.legalName.trim() || undefined,
          email: company.email.trim(),
          phone: company.phone.trim() || undefined,
          website: company.website.trim() || undefined,
          address: company.address.trim() || undefined,
          city: company.city.trim() || undefined,
          state: company.state.trim() || undefined,
          country: company.country.trim() || undefined,
          zipCode: company.zipCode.trim() || undefined,
          taxId: company.taxId.trim() || undefined,
          registrationNumber: company.registrationNumber.trim() || undefined,
          panNumber: company.panNumber.trim() || undefined,
          gstNumber: company.gstNumber.trim() || undefined,
        },
        admin: {
          email: admin.email.trim(),
          password: admin.password,
          firstName: admin.firstName.trim(),
          lastName: admin.lastName.trim(),
          role: 'COMPANY_ADMIN',
        },
      });
      const { user, token } = res.data;
      await useAuthStore.getState().signInWithSession(user, token);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Registration failed',
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = acceptedTerms && isPasswordStrong(admin.password);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Register Your Company</Text>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step >= 2 && styles.stepActive]} />
        </View>
        <Text style={styles.stepLabel}>
          Step {step}: {step === 1 ? 'Company Information' : 'Admin Account'}
        </Text>

        {step === 1 ? (
          <Card style={styles.formCard}>
            <Input
              label="Company Name *"
              placeholder="Acme Corp"
              value={company.name}
              onChangeText={(v) => updateCompany('name', v)}
              error={errors.companyName}
            />
            <Input
              label="Legal Name"
              placeholder="Acme Corporation Pvt. Ltd."
              value={company.legalName}
              onChangeText={(v) => updateCompany('legalName', v)}
            />
            <Input
              label="Company Email *"
              placeholder="info@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={company.email}
              onChangeText={(v) => updateCompany('email', v)}
              error={errors.companyEmail}
            />
            <Input
              label="Phone"
              placeholder="Include country code"
              keyboardType="phone-pad"
              value={company.phone}
              onChangeText={(v) => updateCompany('phone', v)}
            />
            <Input
              label="Website"
              placeholder="https://company.com"
              autoCapitalize="none"
              value={company.website}
              onChangeText={(v) => updateCompany('website', v)}
            />
            <Input
              label="Address"
              placeholder="Street, building, suite"
              value={company.address}
              onChangeText={(v) => updateCompany('address', v)}
            />
            <View style={styles.row}>
              <Input
                label="City"
                value={company.city}
                onChangeText={(v) => updateCompany('city', v)}
                containerStyle={styles.half}
              />
              <Input
                label="State / Region"
                value={company.state}
                onChangeText={(v) => updateCompany('state', v)}
                containerStyle={styles.half}
              />
            </View>
            <View style={styles.row}>
              <Input
                label="Country"
                value={company.country}
                onChangeText={(v) => updateCompany('country', v)}
                containerStyle={styles.half}
              />
              <Input
                label="Postal Code"
                value={company.zipCode}
                onChangeText={(v) => updateCompany('zipCode', v)}
                containerStyle={styles.half}
              />
            </View>
            <Input
              label="Tax ID / VAT / EIN"
              placeholder="Your local tax identifier"
              autoCapitalize="characters"
              value={company.taxId}
              onChangeText={(v) => updateCompany('taxId', v)}
            />
            <Input
              label="Company Registration Number"
              placeholder="Optional"
              autoCapitalize="characters"
              value={company.registrationNumber}
              onChangeText={(v) => updateCompany('registrationNumber', v)}
            />

            <TouchableOpacity
              style={styles.disclosureRow}
              onPress={() => setShowIndiaTax((v) => !v)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showIndiaTax ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.disclosureText}>
                India-specific tax details (optional)
              </Text>
            </TouchableOpacity>
            {showIndiaTax && (
              <>
                <Input
                  label="PAN Number"
                  placeholder="ABCDE1234F"
                  autoCapitalize="characters"
                  value={company.panNumber}
                  onChangeText={(v) => updateCompany('panNumber', v)}
                />
                <Input
                  label="GST Number"
                  placeholder="22ABCDE1234F1Z5"
                  autoCapitalize="characters"
                  value={company.gstNumber}
                  onChangeText={(v) => updateCompany('gstNumber', v)}
                />
              </>
            )}
            <Button
              title="Next: Admin Account"
              onPress={() => {
                if (validateStep1()) setStep(2);
              }}
              size="lg"
            />
          </Card>
        ) : (
          <Card style={styles.formCard}>
            <View style={styles.row}>
              <Input
                label="First Name *"
                placeholder="John"
                value={admin.firstName}
                onChangeText={(v) => updateAdmin('firstName', v)}
                error={errors.adminFirstName}
                containerStyle={styles.half}
              />
              <Input
                label="Last Name *"
                placeholder="Doe"
                value={admin.lastName}
                onChangeText={(v) => updateAdmin('lastName', v)}
                error={errors.adminLastName}
                containerStyle={styles.half}
              />
            </View>
            <Input
              label="Admin Email *"
              placeholder="admin@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={admin.email}
              onChangeText={(v) => updateAdmin('email', v)}
              error={errors.adminEmail}
            />
            <Input
              label="Password *"
              placeholder={`Min ${PASSWORD_MIN_LENGTH} chars, with upper, lower, digit & symbol`}
              isPassword
              value={admin.password}
              onChangeText={(v) => updateAdmin('password', v)}
              error={errors.adminPassword}
            />
            <PasswordStrengthMeter value={admin.password} />
            <Input
              label="Confirm Password *"
              placeholder="Re-enter password"
              isPassword
              value={admin.confirmPassword}
              onChangeText={(v) => updateAdmin('confirmPassword', v)}
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
                I am authorized to register this company and I agree to the{' '}
                <Text style={styles.link} onPress={() => Linking.openURL(Flags.termsUrl)}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.link} onPress={() => Linking.openURL(Flags.privacyUrl)}>
                  Privacy Policy
                </Text>
                . I consent, on behalf of the company, to processing of
                employee personal data for HR administration.
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            <Button
              title="Register Company"
              onPress={handleSubmit}
              loading={loading}
              disabled={!canSubmit}
              size="lg"
            />
            <Button
              title="Back"
              onPress={() => setStep(1)}
              variant="ghost"
              style={{ marginTop: Spacing.sm }}
            />
          </Card>
        )}

        <Button
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          style={{ marginTop: Spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.xxl },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  stepActive: { backgroundColor: Colors.primary },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  stepLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  formCard: { marginBottom: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  disclosureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  disclosureText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
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
