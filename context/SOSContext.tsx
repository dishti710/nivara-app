import React, { createContext, useContext, useState } from 'react';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useAuth } from './AuthContext';

interface SOSContextType {
  isSOSActive: boolean;
  sosTimer: number;
  triggerSOS: (contacts: any[]) => Promise<void>;
  cancelSOS: () => void;
}

export const SOSContext = createContext<SOSContextType | undefined>(undefined);

export function SOSProvider({ children }: { children: React.ReactNode }) {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosTimer, setSOSTimer] = useState(30);
  const { user } = useAuth();

  const triggerSOS = async (contacts: any[]) => {
    setIsSOSActive(true);
    setSOSTimer(30);

    try {
      // Get current location
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          location = await Location.getCurrentPositionAsync({});
        }
      } catch (e) {
        console.error('Location error:', e);
      }

      // Send SMS to contacts
      const canSendSMS = await SMS.isAvailableAsync();
      if (canSendSMS && contacts.length > 0) {
        const message = `🆘 EMERGENCY: ${user?.name} needs help! Location: https://maps.google.com/?q=${location?.coords.latitude},${location?.coords.longitude}`;
        await SMS.sendSMSAsync(
          contacts.map((c) => c.phone),
          message
        );
      }

      // Send alert to backend
      await fetch('http://YOUR_API/sos/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          location: location?.coords,
          timestamp: new Date().toISOString(),
        }),
      });

      // Start countdown timer
      const interval = setInterval(() => {
        setSOSTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('SOS Error:', error);
      setIsSOSActive(false);
    }
  };

  const cancelSOS = () => {
    setIsSOSActive(false);
    setSOSTimer(30);
  };

  return (
    <SOSContext.Provider value={{ isSOSActive, sosTimer, triggerSOS, cancelSOS }}>
      {children}
    </SOSContext.Provider>
  );
}

export function useSOS() {
  const context = useContext(SOSContext);
  if (!context) throw new Error('useSOS must be used within SOSProvider');
  return context;
}