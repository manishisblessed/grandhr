import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { Flags } from '../../constants/flags';
import { FontSize, Spacing, BorderRadius, ThemeColors } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

/**
 * Offline-friendly privacy summary. The canonical policy lives at the URL
 * in `Flags.privacyUrl`, which is what Google Play / Apple reviewers will
 * see in the store listing.
 */
export default function PrivacyPolicyScreen() {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Summary — effective April 2026</Text>

      <Section title="What we process">
        <Text style={styles.p}>
          GrandHR is an HR management app provided to you by your employer
          ("the Company"). When you use the app we process:
        </Text>
        <Bullet>Identity: name, email, employee ID.</Bullet>
        <Bullet>Workplace data: attendance, leave, pay slips, documents, tickets.</Bullet>
        <Bullet>Technical: a secure session token, crash/error reports.</Bullet>
        <Text style={styles.p}>
          We do not access location, contacts, microphone, camera, or the
          device's photo library. We do not run advertising SDKs.
        </Text>
      </Section>

      <Section title="Why we process it">
        <Bullet>Provide the HR functions your employer has configured.</Bullet>
        <Bullet>Keep you signed in securely.</Bullet>
        <Bullet>Diagnose bugs and improve reliability.</Bullet>
      </Section>

      <Section title="Who sees it">
        <Text style={styles.p}>
          Your Company's authorised HR administrators. GrandHR staff only on a
          need-to-know basis, under confidentiality obligations. Sub-processors
          (hosting, error monitoring) are listed at{' '}
          <Text style={styles.link} onPress={() => Linking.openURL(Flags.privacyUrl)}>
            {Flags.privacyUrl}
          </Text>
          .
        </Text>
      </Section>

      <Section title="Retention">
        <Text style={styles.p}>
          Account data is retained while your employer keeps you active, plus
          any period they are required to retain by law. You can request
          deletion from Settings → Danger zone → Delete my account.
        </Text>
      </Section>

      <Section title="Your rights">
        <Bullet>Access and correct your personal data.</Bullet>
        <Bullet>Export your data (request via support).</Bullet>
        <Bullet>Delete your account and data.</Bullet>
        <Bullet>Withdraw consent for processing we do on that basis.</Bullet>
      </Section>

      <Section title="Contact">
        <Text style={styles.p}>
          Privacy questions:{' '}
          <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${Flags.supportEmail}`)}>
            {Flags.supportEmail}
          </Text>
        </Text>
      </Section>

      <TouchableOpacity
        style={styles.fullPolicy}
        onPress={() => Linking.openURL(Flags.privacyUrl)}
      >
        <Text style={styles.fullPolicyText}>Open full privacy policy</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
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
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  updated: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xs,
  },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  p: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  bulletRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 9 },
  bulletText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 22 },
  link: { color: Colors.primary, fontWeight: '600' },
  fullPolicy: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  fullPolicyText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
});
