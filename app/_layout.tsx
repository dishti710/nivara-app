import { COLORS } from '@/constants/colors';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopColor: '#E5E7EB',
        paddingBottom: 8,
        paddingTop: 8,
      },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: '🏠' }} />
      <Tabs.Screen name="cycle" options={{ title: 'Cycle', tabBarLabel: '🔄' }} />
      <Tabs.Screen name="mood" options={{ title: 'Mood', tabBarLabel: '😊' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: '👤' }} />
    </Tabs>
  );
}