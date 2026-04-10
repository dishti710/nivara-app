import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { contactService } from '@/services/firebaseServices';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, signOut, updateUserProfile } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    isPrimary: false,
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      if (user) {
        const loadedContacts = await contactService.getContacts(user.id);
        setContacts(loadedContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!contactForm.name || !contactForm.phone) {
      Alert.alert('Error', 'Please fill in name and phone');
      return;
    }

    try {
      const newContact = {
        id: Date.now().toString(),
        ...contactForm,
      };

      await contactService.addContact(user!.id, newContact);
      setContacts([...contacts, newContact]);
      setContactForm({ name: '', phone: '', email: '', isPrimary: false });
      setShowContactForm(false);
      Alert.alert('Success', 'Emergency contact added!');
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    try {
      await contactService.removeContact(user!.id, contactId);
      setContacts(contacts.filter((c) => c.id !== contactId));
      Alert.alert('Success', 'Contact removed');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove contact');
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View
            style={[styles.avatar, { backgroundColor: COLORS.primary }]}
          >
            <Text style={styles.avatarText}>
              {user?.name?.[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Period reminders</Text>
          <Switch
            value={user?.settings?.periodReminders || false}
            onValueChange={(value) =>
              updateUserProfile({
                ...user!,
                settings: {
                  ...user!.settings,
                  periodReminders: value,
                },
              })
            }
            trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Daily wellness check</Text>
          <Switch
            value={user?.settings?.dailyWellnessCheck || false}
            onValueChange={(value) =>
              updateUserProfile({
                ...user!,
                settings: {
                  ...user!.settings,
                  dailyWellnessCheck: value,
                },
              })
            }
            trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
          />
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
          <TouchableOpacity
            onPress={() => setShowContactForm(!showContactForm)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {showContactForm && (
          <View style={styles.contactForm}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={COLORS.textLight}
              value={contactForm.name}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (+1234567890)"
              placeholderTextColor={COLORS.textLight}
              value={contactForm.phone}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, phone: text })
              }
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor={COLORS.textLight}
              value={contactForm.email}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, email: text })
              }
              keyboardType="email-address"
            />

            <View style={styles.checkboxRow}>
              <Switch
                value={contactForm.isPrimary}
                onValueChange={(value) =>
                  setContactForm({ ...contactForm, isPrimary: value })
                }
              />
              <Text style={styles.checkboxLabel}>Mark as Primary Contact</Text>
            </View>

            <TouchableOpacity
              onPress={handleAddContact}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        {contacts.length === 0 ? (
          <Text style={styles.emptyText}>
            No emergency contacts. Add one for SOS alerts.
          </Text>
        ) : (
          contacts.map((contact) => (
            <View key={contact.id} style={styles.contactItem}>
              <View>
                <Text style={styles.contactItemName}>{contact.name}</Text>
                <Text style={styles.contactItemPhone}>{contact.phone}</Text>
                {contact.email && (
                  <Text style={styles.contactItemEmail}>{contact.email}</Text>
                )}
                {contact.isPrimary && (
                  <Text style={styles.primaryTag}>Primary</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Remove Contact', 'Are you sure?', [
                    { text: 'Cancel' },
                    {
                      text: 'Remove',
                      onPress: () => handleRemoveContact(contact.id),
                    },
                  ])
                }
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    margin: 16,
    borderRadius: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.surface,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactForm: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.surface,
  },
  contactItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  contactItemPhone: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  contactItemEmail: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  primaryTag: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: COLORS.danger,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
    paddingVertical: 20,
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
});