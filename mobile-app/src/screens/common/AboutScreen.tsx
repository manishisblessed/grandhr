import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import { Flags } from '../../constants/flags';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? 'dev';
  const name = Constants.expoConfig?.name ?? 'GrandHR';
  const runtime = (Constants.expoConfig?.runtimeVersion as string | undefined) ?? version;
  const channel = Flags.buildChannel;

  const row = (icon: React.ComponentProps<typeof Ionicons>['name'], label: string, value: string) => (
    <View style={styles.row} key={label}>
      <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} selectable>
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="briefcase" size={28} color="#fff" />
        </View>
        <Text style={styles.appName}>{name}</Text>
        <Text style={styles.tagline}>HR Management, made simple.</Text>
      </View>

      <Card style={styles.card}>
        {row('pricetag-outline', 'Version', version)}
        {row('cube-outline', 'Runtime', runtime)}
        {row('git-branch-outline', 'Build channel', channel)}
        {row('phone-portrait-outline', 'Platform', `${Platform.OS} ${Platform.Version}`)}
      </Card>

      <Card style={styles.card}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL(`mailto:${Flags.supportEmail}`)}
        >
          <Ionicons name="mail-outline" size={20} color={Colors.primary} />
          <Text style={styles.linkText}>{Flags.supportEmail}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL(Flags.privacyUrl)}
        >
          <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL(Flags.termsUrl)}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.footer}>
        © {new Date().getFullYear()} GrandHR. All rights reserved.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xxl },
  hero: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  tagline: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  card: { marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  value: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  linkText: { fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
  footer: {
    marginTop: Spacing.xl,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
