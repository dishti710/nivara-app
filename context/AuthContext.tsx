import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener...');

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          console.log('📱 Auth state changed:', firebaseUser?.email);

          if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as User;
              console.log('✅ User loaded:', userData.name);
              setUser({
                ...userData,
                id: firebaseUser.uid,
              });
            } else {
              console.log('⚠️ User doc not found');
              setUser(null);
            }
          } else {
            console.log('📴 No user logged in');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Error in auth listener:', error);
          setUser(null);
        } finally {
          setFirebaseUser(firebaseUser);
          setLoading(false);
          console.log('✅ Auth loading complete');
        }
      },
      (error) => {
        console.error('❌ Auth listener error:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    firebaseUser,
    loading,

    signUp: async (email, password, name) => {
      try {
        console.log('📝 Signing up:', email);
        const { user: newFirebaseUser } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userRef = doc(db, 'users', newFirebaseUser.uid);
        const userData: User = {
          id: newFirebaseUser.uid,
          name,
          email,
          avatar: undefined,
          cycleLength: 28,
          periodDays: 5,
          lastPeriodDate: new Date().toISOString(),
          emergencyContacts: [],
          settings: {
            periodReminders: true,
            dailyWellnessCheck: true,
            appLock: false,
            locationSharing: false,
            wellnessCheckIn: true,
            reminderTime: '09:00',
          },
          createdAt: new Date().toISOString(),
        };

        await setDoc(userRef, userData);
        console.log('✅ User created:', name);
        setUser(userData);
      } catch (error: any) {
        console.error('❌ Sign up error:', error);
        throw new Error(error.message || 'Failed to sign up');
      }
    },

    signIn: async (email, password) => {
      try {
        console.log('🔓 Signing in:', email);
        const { user: signedInFirebaseUser } = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userDocRef = doc(db, 'users', signedInFirebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User;
          console.log('✅ User logged in:', userData.name);
          setUser({
            ...userData,
            id: signedInFirebaseUser.uid,
          });
        } else {
          console.error('⚠️ User doc not found after sign in');
        }
      } catch (error: any) {
        console.error('❌ Sign in error:', error);
        throw new Error(error.message || 'Failed to sign in');
      }
    },

    signOut: async () => {
      try {
        console.log('🚪 Signing out');
        await firebaseSignOut(auth);
        setUser(null);
        console.log('✅ Signed out');
      } catch (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
    },

    updateUserProfile: async (updates) => {
      if (!user) throw new Error('No user logged in');

      try {
        console.log('🔄 Updating user profile');
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, updates, { merge: true });
        setUser({
          ...user,
          ...updates,
        });
        console.log('✅ Profile updated');
      } catch (error) {
        console.error('❌ Update profile error:', error);
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}