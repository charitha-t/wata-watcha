// Firebase initialization — replace placeholder values with your project credentials
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─── REPLACE WITH YOUR FIREBASE CONFIG ─────────────────────────────────────
// Get these values from:
//   Firebase Console → Your Project → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyAVq4QoMYi-bZ9HBU0iuGSfodX8CrQBoJ8",
  authDomain: "wata-watcha.firebaseapp.com",
  projectId: "wata-watcha",
  storageBucket: "wata-watcha.firebasestorage.app",
  messagingSenderId: "255818666419",
  appId: "1:255818666419:web:17af904ee60cb6c47dfbc6",
};
// ───────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
