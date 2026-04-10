import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCa1_wV21x55muWCf4B2eDOsmMxPbUO09Q",
  authDomain: "nivara-4df0e.firebaseapp.com",
  projectId: "nivara-4df0e",
  storageBucket: "nivara-4df0e.firebasestorage.app",
  messagingSenderId: "499453482454",
  appId: "1:499453482454:web:9e999be76ab1f42e380077"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;