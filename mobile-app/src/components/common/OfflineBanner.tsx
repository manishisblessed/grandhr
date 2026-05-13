import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, Spacing, Shadow } from '../../constants/theme';

/**
 * Top-of-screen banner that appears whenever the device drops connectivity
 * and slides away when reconnected. Sits above all routed content but
 * below modals/toasts.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const translate = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOffline =
        state.isConnected === false ||
        (state.isConnected && state.isInternetReachable === false);
      setOffline(!!isOffline);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(translate, {
      toValue: offline ? 0 : -60,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [offline, translate]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { transform: [{ translateY: translate }] },
      ]}
    >
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.banner}>
          <Ionicons name="cloud-offline" size={14} color="#fff" />
          <Text style={styles.text}>
            You're offline — showing cached data
          </Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 9000,
  },
  safe: { backgroundColor: '#0F172A' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#0F172A',
    ...Shadow.md,
  },
  text: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
});
