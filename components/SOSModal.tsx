import { COLORS } from '@/constants/colors';
import { useSOS } from '@/context/FirebaseSOSContext';
import React, { useEffect } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export function SOSModal() {
  const { isSOSActive, sosTimer, sosMessage, cancelSOS } = useSOS();
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSOSActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSOSActive]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isSOSActive) return null;

  return (
    <Modal visible={isSOSActive} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.warning}>🆘</Text>
            <Text style={styles.headerText}>SOS Active</Text>
          </View>

          <Text style={styles.subtitle}>Your contacts are being notified</Text>

          {/* Animated Timer */}
          <Animated.View style={[styles.timerContainer, { transform: [{ rotate }] }]}>
            <Text style={styles.timer}>
              {String(sosTimer).padStart(2, '0')}:00
            </Text>
          </Animated.View>

          {/* Status Messages */}
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusText}>Sending location to 3 contacts...</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusText}>Background recording started</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusText}>
                Silent mode — screen stays normal
              </Text>
            </View>
            {sosMessage && (
              <View style={styles.statusItem}>
                <Text style={styles.statusDot}>✓</Text>
                <Text style={styles.statusText}>{sosMessage}</Text>
              </View>
            )}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity onPress={cancelSOS} style={styles.cancelButton}>
            <Text style={styles.cancelText}>✕ Cancel SOS (I'm safe)</Text>
          </TouchableOpacity>

          {/* Alert Sent Badge */}
          <View style={styles.alertSent}>
            <Text style={styles.alertSentText}>🔔 Alert sent silently</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  warning: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.danger,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  timerContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.danger,
  },
  statusList: {
    marginBottom: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFE4E9',
    borderRadius: 12,
  },
  statusDot: {
    fontSize: 12,
    color: COLORS.danger,
    marginRight: 12,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '500',
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
  },
  alertSent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    alignItems: 'center',
  },
  alertSentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
});