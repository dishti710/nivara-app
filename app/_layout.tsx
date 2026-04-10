import { COLORS } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SOSProvider } from '@/context/SOSContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // Force show content after 5 seconds even if loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⏱️ Timeout reached');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🌙</Text>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textLight, fontSize: 14 }}>
          Loading Luna...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {firebaseUser ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="auth" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SOSProvider>
        <RootNavigator />
      </SOSProvider>
    </AuthProvider>
  );
}