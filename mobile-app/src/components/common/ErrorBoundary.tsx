import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { Telemetry } from '../../services/telemetry';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Top-level error boundary. Prevents a single component crash from taking
 * the whole app down (Google Play "Functionality" policy).
 *
 * Also required on iOS to pass review: reviewers sometimes deliberately
 * corrupt input to verify graceful failure.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    Telemetry.captureError(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  handleRestart = () => {
    this.setState({ error: null, errorInfo: null });
  };

  handleShareDiagnostics = async () => {
    const { error, errorInfo } = this.state;
    const diagnostics = Telemetry.diagnostics();
    const body = [
      'GrandHR error report',
      '-----',
      `App: ${Constants.expoConfig?.name} ${Constants.expoConfig?.version}`,
      `Platform: ${Platform.OS} ${Platform.Version}`,
      `Build: ${diagnostics.channel}`,
      '',
      `Error: ${error?.name}: ${error?.message}`,
      '',
      error?.stack || '',
      '',
      errorInfo?.componentStack || '',
    ].join('\n');
    try {
      await Share.share({ message: body });
    } catch {
      // ignore - the user may have just cancelled the share sheet
    }
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="warning" size={48} color={Colors.error} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app hit an unexpected error. Your data is safe. You can try
            again, or share the diagnostics with support to help us fix it.
          </Text>
          {__DEV__ && (
            <Text style={styles.devError} selectable>
              {error.name}: {error.message}
            </Text>
          )}

          <TouchableOpacity style={styles.primary} onPress={this.handleRestart}>
            <Text style={styles.primaryText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={this.handleShareDiagnostics}>
            <Text style={styles.secondaryText}>Share diagnostics</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  iconWrap: { marginBottom: Spacing.lg },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  devError: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.errorLight,
    marginBottom: Spacing.xl,
    alignSelf: 'stretch',
  },
  primary: {
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: FontSize.md },
  secondary: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryText: { color: Colors.text, fontWeight: '600', fontSize: FontSize.md },
});
