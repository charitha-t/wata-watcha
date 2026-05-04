// Firebase initialization — replace placeholder values with your project credentials
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─── REPLACE WITH YOUR FIREBASE CONFIG ─────────────────────────────────────
// Get these values from:
//   Firebase Console → Your Project → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey: "Your App ID",
  authDomain: "Your App ID",
  projectId: "wata-watcha",
  storageBucket: "Your App ID",
  messagingSenderId: "Your App ID",
  appId: "Your App ID",
};
// ───────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
