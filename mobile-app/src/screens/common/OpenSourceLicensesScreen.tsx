import React from 'react';
import { ScrollView, StyleSheet, Text, View, Linking, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

/**
 * Hand-maintained list of the major open-source libraries we bundle.
 * Keep in sync with package.json when dependencies change.
 */
const LIBRARIES: ReadonlyArray<{ name: string; license: string; url: string }> = [
  { name: 'React', license: 'MIT', url: 'https://github.com/facebook/react' },
  { name: 'React Native', license: 'MIT', url: 'https://github.com/facebook/react-native' },
  { name: 'Expo', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: '@react-navigation', license: 'MIT', url: 'https://github.com/react-navigation/react-navigation' },
  { name: '@expo/vector-icons', license: 'MIT', url: 'https://github.com/expo/vector-icons' },
  { name: 'axios', license: 'MIT', url: 'https://github.com/axios/axios' },
  { name: 'zustand', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { name: 'expo-secure-store', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-local-authentication', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-constants', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-status-bar', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'react-native-safe-area-context', license: 'MIT', url: 'https://github.com/th3rdwave/react-native-safe-area-context' },
  { name: 'react-native-gesture-handler', license: 'MIT', url: 'https://github.com/software-mansion/react-native-gesture-handler' },
  { name: 'react-native-reanimated', license: 'MIT', url: 'https://github.com/software-mansion/react-native-reanimated' },
  { name: 'react-native-screens', license: 'MIT', url: 'https://github.com/software-mansion/react-native-screens' },
];

export default function OpenSourceLicensesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Open-source software</Text>
      <Text style={styles.body}>
        GrandHR is built on top of many great open-source libraries. We are
        grateful to their maintainers. Tap a name for the source repository.
      </Text>

      {LIBRARIES.map((lib) => (
        <TouchableOpacity
          key={lib.name}
          style={styles.row}
          onPress={() => Linking.openURL(lib.url)}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.libName}>{lib.name}</Text>
            <Text style={styles.libLicense}>{lib.license} license</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.footer}>
        Full license texts are available in each library's repository. Contact
        support if you need a specific license bundle.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xxl },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  body: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  libName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  libLicense: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  footer: {
    marginTop: Spacing.xl,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
