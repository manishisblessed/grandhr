import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { CompanyService } from '../../services/company.service';
import { useAuthStore } from '../../store/useAuthStore';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, USER_KEY } from '../../constants/config';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

export default function CompanyOnboardingScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
    else if (admin.password.length < 8) e.adminPassword = 'Min 8 characters';
    if (admin.password !== admin.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
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
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      useAuthStore.getState().setUser(user);
      useAuthStore.setState({ isAuthenticated: true });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Registration failed',
      );
    } finally {
      setLoading(false);
    }
  };

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
              placeholder="+91 9876543210"
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
              placeholder="123 Business Park"
              value={company.address}
              onChangeText={(v) => updateCompany('address', v)}
            />
            <View style={styles.row}>
              <Input
                label="City"
                placeholder="Mumbai"
                value={company.city}
                onChangeText={(v) => updateCompany('city', v)}
                containerStyle={styles.half}
              />
              <Input
                label="State"
                placeholder="Maharashtra"
                value={company.state}
                onChangeText={(v) => updateCompany('state', v)}
                containerStyle={styles.half}
              />
            </View>
            <View style={styles.row}>
              <Input
                label="Country"
                placeholder="India"
                value={company.country}
                onChangeText={(v) => updateCompany('country', v)}
                containerStyle={styles.half}
              />
              <Input
                label="ZIP Code"
                placeholder="400001"
                value={company.zipCode}
                onChangeText={(v) => updateCompany('zipCode', v)}
                containerStyle={styles.half}
              />
            </View>
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
              placeholder="Min 8 characters"
              isPassword
              value={admin.password}
              onChangeText={(v) => updateAdmin('password', v)}
              error={errors.adminPassword}
            />
            <Input
              label="Confirm Password *"
              placeholder="Re-enter password"
              isPassword
              value={admin.confirmPassword}
              onChangeText={(v) => updateAdmin('confirmPassword', v)}
              error={errors.confirmPassword}
            />
            <Button
              title="Register Company"
              onPress={handleSubmit}
              loading={loading}
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

const styles = StyleSheet.create({
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
});
