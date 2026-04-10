import { COLORS } from '@/constants/colors';
import { AuthContext } from '@/context/AuthContext';
import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const auth = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

const handleSubmit = async () => {
  console.log('Button pressed, isLogin:', isLogin);
  console.log('Email:', email, 'Password:', password, 'Name:', name);
  try {
    if (isLogin) {
      await auth?.signIn(email, password);
    } else {
      await auth?.signUp(email, password, name);
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    Alert.alert('Error', error.message);
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌙 Nivara</Text>
      {!isLogin && (
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor={COLORS.textLight} />
      )}
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textLight} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={COLORS.textLight} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggle}>{isLogin ? 'Need an account? Sign Up' : 'Have an account? Sign In'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.background },
  title: { fontSize: 48, textAlign: 'center', marginBottom: 40 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14, color: COLORS.text },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: COLORS.surface, fontWeight: '700', fontSize: 16 },
  toggle: { textAlign: 'center', marginTop: 16, color: COLORS.primary },
});