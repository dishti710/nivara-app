import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSOS } from '@/context/SOSContext';
import { COLORS } from '@/constants/colors';

export function SOSModal() {
  const { isSOSActive, sosTimer, cancelSOS } = useSOS();
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

  return (
    <Modal visible={isSOSActive} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.warning}>🆘</Text>
            <Text style={styles.headerText}>SOS Active</Text>
          </View>

          <Text style={styles.subtitle}>
            Your contacts are being notified
          </Text>

          {/* Animated Timer */}
          <Animated.View
            style={[
              styles.timerContainer,
              { transform: [{ rotate }] },
            ]}
          >
            <Text style={styles.timer}>{String(sosTimer).padStart(2, '0')}:00</Text>
          </Animated.View>

          {/* Status Updates */}
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Sending location to 3 contacts...</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Background recording started</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                Silent mode — screen stays normal
              </Text>
            </View>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={cancelSOS}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>✕ Cancel SOS (I'm safe)</Text>
          </TouchableOpacity>

          {/* Alert Sent Message */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontSize: 40,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    marginRight: 12,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '500',
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