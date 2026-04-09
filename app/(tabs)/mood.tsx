import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useSOS } from '@/context/SOSContext';
import { COLORS, MOODS, SYMPTOMS, EMOTIONS } from '@/constants/colors';
import { ThemedView } from '@/components/ui/ThemedView';

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { triggerSOS } = useSOS();

  const [selectedMood, setSelectedMood] = useState(2);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [unsafeTapCount, setUnsafeTapCount] = useState(0);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const toggleEmotion = (emotion: string) => {
    if (emotion === 'Unsafe') {
      setUnsafeTapCount(unsafeTapCount + 1);
      if (unsafeTapCount === 2) {
        triggerSOS(user?.emergencyContacts || []);
        setUnsafeTapCount(0);
      } else {
        setTimeout(() => setUnsafeTapCount(0), 500);
      }
      return;
    }

    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSave = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch('http://YOUR_API/mood/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          symptoms: selectedSymptoms,
          emotions: selectedEmotions,
          notes,
        }),
      });

      if (response.ok) {
        alert('Mood entry saved!');
        setSelectedMood(2);
        setSelectedSymptoms([]);
        setSelectedEmotions([]);
        setNotes('');
      }
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>How are you?</Text>
      </Animated.View>

      {/* Mood Selector */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.moodSelector}>
        <View style={styles.moodEmojis}>
          {MOODS.map((mood, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedMood(index)}
              style={[
                styles.moodButton,
                selectedMood === index && styles.moodButtonActive,
              ]}
            >
              <Text style={styles.moodEmoji}>{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Physical Symptoms */}
      <Animated.View entering={FadeIn.delay(200)}>
        <ThemedView variant="card">
          <Text style={styles.sectionTitle}>Physical Symptoms</Text>
          <View style={styles.tagGrid}>
            {SYMPTOMS.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                onPress={() => toggleSymptom(symptom)}
                style={[
                  styles.tag,
                  selectedSymptoms.includes(symptom) && styles.tagActive,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedSymptoms.includes(symptom) && styles.tagTextActive,
                  ]}
                >
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>
      </Animated.View>

      {/* Emotional State */}
      <Animated.View entering={FadeIn.delay(300)}>
        <ThemedView variant="card">
          <Text style={styles.sectionTitle}>Emotional State</Text>
          <View style={styles.tagGrid}>
            {EMOTIONS.map((emotion) => (
              <TouchableOpacity
                key={emotion}
                onPress={() => toggleEmotion(emotion)}
                style={[
                  styles.tag,
                  emotion === 'Unsafe' && styles.tagUnsafe,
                  selectedEmotions.includes(emotion) && styles.tagActive,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    emotion === 'Unsafe' && styles.tagUnsafeText,
                    selectedEmotions.includes(emotion) && styles.tagTextActive,
                  ]}
                >
                  {emotion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.unsafeHint}>
            💡 Triple-tap "Unsafe" to trigger SOS
          </Text>
        </ThemedView>
      </Animated.View>

      {/* Notes */}
      <Animated.View entering={FadeIn.delay(400)}>
        <ThemedView variant="card">
          <Text style={styles.sectionTitle}>Private Journal Note</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Write something private..."
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </ThemedView>
      </Animated.View>

      {/* Save Button */}
      <Animated.View entering={FadeIn.delay(500)}>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Save Entry</Text>
        </TouchableOpacity>
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
    marginTop: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  moodSelector: {
    marginBottom: 24,
  },
  moodEmojis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E9D5FF',
  },
  moodEmoji: {
    fontSize: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  tagActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  tagTextActive: {
    color: COLORS.surface,
  },
  tagUnsafe: {
    borderColor: COLORS.danger,
  },
  tagUnsafeText: {
    color: COLORS.danger,
  },
  unsafeHint: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 12,
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'System',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
});