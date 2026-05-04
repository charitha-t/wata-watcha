// Mock hardware pulse data generator — writes simulated water meter readings to Firestore
// Usage: node simulate-pulse.cjs USER_UID [--leak]
// Normal: 0–5 random pulses every 30 seconds | Leak mode: constant 8 pulses per interval

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// ─── REPLACE WITH YOUR FIREBASE CONFIG ─────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAVq4QoMYi-bZ9HBU0iuGSfodX8CrQBoJ8",
  authDomain: "wata-watcha.firebaseapp.com",
  projectId: "wata-watcha",
  storageBucket: "wata-watcha.firebasestorage.app",
  messagingSenderId: "255818666419",
  appId: "1:255818666419:web:17af904ee60cb6c47dfbc6",
};
// ───────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const uid = args[0];
const isLeak = args.includes('--leak');

if (!uid) {
  console.error('❌  Usage: node simulate-pulse.cjs USER_UID [--leak]');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const LITRES_PER_PULSE = 0.5;
const INTERVAL_SECONDS = 30;
let totalLitres = 0;
let writeCount = 0;

function getRandomPulses() {
  return Math.floor(Math.random() * 6); // 0 – 5
}

function formatTime(date) {
  return date.toLocaleTimeString('en-AU', { hour12: false });
}

async function writePulse() {
  const pulses = isLeak ? 8 : getRandomPulses();
  const litres = parseFloat((pulses * LITRES_PER_PULSE).toFixed(2));
  const flow_rate = parseFloat(((litres / INTERVAL_SECONDS) * 60).toFixed(2));
  writeCount++;
  totalLitres += litres;

  const data = {
    pulses,
    litres,
    flow_rate,
    timestamp: serverTimestamp(),
    reading: writeCount,
  };

  try {
    const colRef = collection(db, `users/${uid}/pulse_data`);
    await addDoc(colRef, data);
    const now = new Date();
    console.log(
      `[${formatTime(now)}] ✅ #${writeCount} — pulses: ${pulses}, ` +
      `litres: ${litres} L, flow: ${flow_rate} L/min, ` +
      `total: ${totalLitres.toFixed(1)} L` +
      (isLeak ? ' ⚠️  LEAK MODE' : '')
    );
  } catch (err) {
    console.error(`[${formatTime(new Date())}] ❌ Write failed:`, err.message);
  }
}

console.log('🚰  Wata Watcha — Pulse Simulator');
console.log('─'.repeat(50));
console.log(`   UID  : ${uid}`);
console.log(`   Mode : ${isLeak ? '⚠️  LEAK DETECTION (8 pulses/interval)' : '✅  Normal (0–5 pulses/interval)'}`);
console.log(`   Rate : every ${INTERVAL_SECONDS}s`);
console.log('─'.repeat(50));
console.log('Press Ctrl+C to stop.\n');

writePulse();
setInterval(writePulse, INTERVAL_SECONDS * 1000);
