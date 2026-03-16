import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WHATSAPP_URL, WHATSAPP_MESSAGE } from '../../constants/config';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';

const CHAT_URL = `${WHATSAPP_URL}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  const openWhatsApp = () => {
    Linking.openURL(CHAT_URL).catch(() => {});
  };

  return (
    <View style={styles.wrapper}>
      {showTooltip && (
        <View style={styles.tooltip}>
          <View style={styles.tooltipHeader}>
            <View style={styles.tooltipIcon}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.tooltipTitle}>GrandHR Support</Text>
              <Text style={styles.tooltipSubtitle}>Online now</Text>
            </View>
          </View>
          <Text style={styles.tooltipText}>
            Need help? Chat with us on WhatsApp for instant support!
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={openWhatsApp}
        onLongPress={() => setShowTooltip(true)}
        onPressOut={() => setTimeout(() => setShowTooltip(false), 2000)}
        activeOpacity={0.9}
        accessibilityLabel="Chat on WhatsApp"
      >
        <Ionicons name="logo-whatsapp" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.lg,
    zIndex: 999,
    alignItems: 'flex-start',
  },
  tooltip: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    width: 260,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadow.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tooltipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  tooltipSubtitle: {
    fontSize: FontSize.xs,
    color: '#25D366',
    fontWeight: '600',
  },
  tooltipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
    elevation: 6,
  },
});
