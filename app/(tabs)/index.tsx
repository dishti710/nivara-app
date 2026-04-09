import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  BounceIn,
} from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useSOS } from '@/context/SOSContext';
import { COLORS, PHASES } from '@/constants/colors';
import { ThemedView } from '@/components/ui/ThemedView';
import { CycleCard } from '@/components/CycleCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { triggerSOS } = useSOS();
  const [tapCount, setTapCount] = useState(0);
  const [cycleData, setCycleData] = useState<any>(null);

  useEffect(() => {
    // Fetch cycle data
    fetchCycleData();
  }, []);

  const fetchCycleData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch('http://YOUR_API/cycle/current', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setCycleData(await response.json());
      }
    } catch (error) {
      console.error('Error fetching cycle data:', error);
    }
  };

  // Triple tap avatar to trigger SOS
  const handleAvatarPress = () => {
    setTapCount(tapCount + 1);
    if (tapCount === 2) {
      triggerSOS(user?.emergencyContacts || []);
      setTapCount(0);
    } else {
      setTimeout(() => setTapCount(0), 500);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>
            {user?.name} {user?.avatar ? '🩸' : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAvatarPress}
          style={[styles.avatar, { backgroundColor: COLORS.primary }]}
        >
          <Text style={styles.avatarText}>
            {user?.name?.[0].toUpperCase()}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Cycle Card */}
      {cycleData && (
        <Animated.View entering={BounceIn.delay(100)}>
          <CycleCard
            phase={cycleData.phase}
            currentDay={cycleData.currentDay}
            totalDays={cycleData.cycleLength}
            nextPeriod={cycleData.nextPeriodDate}
          />
        </Animated.View>
      )}

      {/* Stats Grid */}
      <Animated.View
        style={styles.statsGrid}
        entering={BounceIn.delay(200)}
      >
        <ThemedView variant="card" style={styles.statCard}>
          <Text style={styles.statIcon}>💧</Text>
          <Text style={styles.statValue}>{user?.cycleLength || 28}</Text>
          <Text style={styles.statLabel}>Avg cycle length</Text>
        </ThemedView>

        <ThemedView variant="card" style={styles.statCard}>
          <Text style={styles.statIcon}>🌙</Text>
          <Text style={styles.statValue}>{user?.periodDays || 5}</Text>
          <Text style={styles.statLabel}>Period days</Text>
        </ThemedView>

        <ThemedView variant="card" style={styles.statCard}>
          <Text style={styles.statIcon}>😊</Text>
          <Text style={styles.statValue}>Calm</Text>
          <Text style={styles.statLabel}>Today's mood</Text>
        </ThemedView>

        <ThemedView variant="card" style={styles.statCard}>
          <Text style={styles.statIcon}>🛡️</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            Active
          </Text>
          <Text style={styles.statLabel}>Safety mode</Text>
        </ThemedView>
      </Animated.View>

      {/* Insight Card */}
      <Animated.View entering={BounceIn.delay(300)}>
        <ThemedView variant="card" style={styles.insightCard}>
          <Text style={styles.insightText}>
            💝 You're in the {cycleData?.phase} phase. Energy may dip — it's a
            good day to rest and stay hydrated.
          </Text>
        </ThemedView>
      </Animated.View>

      {/* Hidden Feature Info */}
      <Animated.View entering={BounceIn.delay(400)}>
        <ThemedView
          style={[
            styles.hiddenFeatureCard,
            { backgroundColor: '#FFE4E9' },
          ]}
        >
          <Text style={styles.hiddenFeatureTitle}>🔒 Hidden Feature:</Text>
          <Text style={styles.hiddenFeatureText}>
            Triple-tap the avatar (P) to arm silent SOS. Triple-tap "Unsafe"
            on Mood screen to trigger alert.
          </Text>
        </ThemedView>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  insightCard: {
    marginBottom: 16,
    backgroundColor: '#F0F4FF',
  },
  insightText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  hiddenFeatureCard: {
    marginBottom: 32,
    borderRadius: 16,
    padding: 16,
  },
  hiddenFeatureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
    marginBottom: 8,
  },
  hiddenFeatureText: {
    fontSize: 13,
    color: COLORS.danger,
    lineHeight: 18,
  },
});