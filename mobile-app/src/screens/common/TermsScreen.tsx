import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { Flags } from '../../constants/flags';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.updated}>Summary — effective April 2026</Text>

      <Section title="1. Who we are">
        <Text style={styles.p}>
          GrandHR is a business-to-business HR platform. Your employer has
          licensed GrandHR and provisioned your account. Your use of the app
          is also subject to your employer's IT/acceptable use policies.
        </Text>
      </Section>

      <Section title="2. Your account">
        <Text style={styles.p}>
          Keep your login credentials confidential. You are responsible for
          activity performed with your account. Report lost/stolen devices to
          your HR administrator immediately.
        </Text>
      </Section>

      <Section title="3. Acceptable use">
        <Text style={styles.p}>
          Do not use GrandHR to upload unlawful, infringing or harmful
          content; to attempt to access data you are not authorised to; or to
          interfere with the operation of the service.
        </Text>
      </Section>

      <Section title="4. Service changes">
        <Text style={styles.p}>
          We continuously improve GrandHR. Features may be added, changed or
          removed. Material changes will be communicated via your employer or
          in-app.
        </Text>
      </Section>

      <Section title="5. Data & privacy">
        <Text style={styles.p}>
          Processing of personal data is governed by our{' '}
          <Text style={styles.link} onPress={() => Linking.openURL(Flags.privacyUrl)}>
            Privacy Policy
          </Text>{' '}
          and the agreement between GrandHR and your employer. You may request
          account deletion at any time.
        </Text>
      </Section>

      <Section title="6. Disclaimers & liability">
        <Text style={styles.p}>
          GrandHR is provided "as is", without warranty. To the extent
          permitted by law, GrandHR is not liable for indirect or
          consequential losses arising from your use of the app.
        </Text>
      </Section>

      <Section title="7. Governing law">
        <Text style={styles.p}>
          These terms are governed by the laws specified in the agreement
          between GrandHR and your employer.
        </Text>
      </Section>

      <Section title="Contact">
        <Text style={styles.p}>
          Questions:{' '}
          <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${Flags.supportEmail}`)}>
            {Flags.supportEmail}
          </Text>
        </Text>
      </Section>

      <TouchableOpacity
        style={styles.fullPolicy}
        onPress={() => Linking.openURL(Flags.termsUrl)}
      >
        <Text style={styles.fullPolicyText}>Open full Terms of Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
  p: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
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
