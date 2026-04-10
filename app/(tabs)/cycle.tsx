import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CycleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📅 Cycle Tracking</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
});