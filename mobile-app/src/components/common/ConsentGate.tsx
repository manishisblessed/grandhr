import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { CONSENT_KEY } from '../../constants/config';
import { Flags } from '../../constants/flags';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
}

/**
 * First-launch disclosure + consent screen. Blocks all network access
 * (by virtue of blocking render) until the user explicitly agrees.
 *
 * Required for Google Play "User Data" and "Data safety" policies: users
 * must be told what personal data is collected BEFORE it is sent.
 */
export default function ConsentGate({ children }: Props) {
  const [status, setStatus] = useState<'checking' | 'blocked' | 'accepted'>('checking');

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(CONSENT_KEY);
        setStatus(saved === '1' ? 'accepted' : 'blocked');
      } catch {
        setStatus('blocked');
      }
    })();
  }, []);

  const accept = async () => {
    try {
      await SecureStore.setItemAsync(CONSENT_KEY, '1');
    } catch {
      // still allow the user through; Settings can reset later
    }
    setStatus('accepted');
  };

  if (status === 'checking') {
    return <LoadingSpinner message="Starting..." />;
  }
  if (status === 'accepted') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoWrap}>
          <Ionicons name="shield-checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>{Constants.expoConfig?.name || 'GrandHR'}</Text>
        <Text style={styles.tagline}>
          Workplace HR, in your pocket.
        </Text>

        <Text style={styles.heading}>Before you continue</Text>
        <Text style={styles.body}>
          To provide HR services for your employer, GrandHR processes the
          following personal data:
        </Text>

        <Bullet text="Identity: your name, email address, and employee ID." />
        <Bullet text="Workplace: attendance clock-ins, leave requests, pay slips, documents." />
        <Bullet text="Support: any message you send to your HR team or to GrandHR support." />
        <Bullet text="Device: a secure session token stored on your device to keep you signed in." />

        <Text style={styles.body}>
          We do <Text style={styles.bold}>not</Text> access your location, contacts,
          microphone, camera or any other device sensor. We do not sell your
          data, and we do not use it for advertising.
        </Text>

        <Text style={styles.body}>
          You can request deletion of your account and data at any time from
          Settings, or at{' '}
          <Text style={styles.link} onPress={() => Linking.openURL(Flags.accountDeletionUrl)}>
            {Flags.accountDeletionUrl}
          </Text>
          .
        </Text>

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => Linking.openURL(Flags.privacyUrl)}>
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL(Flags.termsUrl)}>
            <Text style={styles.link}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primary} onPress={accept}>
          <Text style={styles.primaryText}>I agree and continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.dotMarker} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xxl, paddingTop: Spacing.xxxl * 1.5, paddingBottom: Spacing.xxxl },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  heading: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  bulletRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, paddingLeft: Spacing.xs },
  dotMarker: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 9 },
  bulletText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 22 },
  bold: { fontWeight: '700', color: Colors.text },
  link: { color: Colors.primary, fontWeight: '600' },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dot: { color: Colors.textTertiary },
  primary: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
