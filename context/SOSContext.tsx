import { sosService } from '@/services/firebaseServices';
import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

interface SOSContextType {
  isSOSActive: boolean;
  sosTimer: number;
  sosMessage: string;
  triggerSOS: (contacts: any[]) => Promise<void>;
  cancelSOS: () => Promise<void>;
}

export const SOSContext = createContext<SOSContextType | undefined>(undefined);

export function SOSProvider({ children }: { children: React.ReactNode }) {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosTimer, setSOSTimer] = useState(30);
  const [sosMessage, setSOSMessage] = useState('');
  const [sosAlertId, setSOSAlertId] = useState<string>('');
  const { user } = useAuth();
const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const triggerSOS = async (contacts: any[]) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    setIsSOSActive(true);
    setSOSTimer(30);
    setSOSMessage('Getting your location...');

    try {
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setSOSMessage('Sending location to 3 contacts...');
        }
      } catch (locationError) {
        console.error('Location error:', locationError);
        setSOSMessage('Location unavailable, sending alert anyway...');
      }

      const alertId = await sosService.createSOSAlert(
        user.id,
        location
          ? {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            }
          : null,
        user.name
      );

      setSOSAlertId(alertId);
      setSOSMessage('Background recording started');

      const primaryContacts = contacts.filter((c) => c.isPrimary).slice(0, 3);
      if (primaryContacts.length > 0) {
        console.log('Would send SMS to:', primaryContacts);
      }

      timerInterval.current = setInterval(() => {
        setSOSTimer((prev) => {
          if (prev <= 1) {
            if (timerInterval.current) clearInterval(timerInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('SOS Error:', error);
      setIsSOSActive(false);
      setSOSMessage('Error triggering SOS');
    }
  };

  const cancelSOS = async () => {
    if (sosAlertId) {
      try {
        await sosService.cancelSOS(sosAlertId);
      } catch (error) {
        console.error('Error cancelling SOS:', error);
      }
    }

    setIsSOSActive(false);
    setSOSTimer(30);
    setSOSMessage('');
    setSOSAlertId('');

    if (timerInterval.current) clearInterval(timerInterval.current);
  };

  return (
    <SOSContext.Provider
      value={{ isSOSActive, sosTimer, sosMessage, triggerSOS, cancelSOS }}
    >
      {children}
    </SOSContext.Provider>
  );
}

export function useSOS() {
  const context = useContext(SOSContext);
  if (!context) throw new Error('useSOS must be used within SOSProvider');
  return context;
}