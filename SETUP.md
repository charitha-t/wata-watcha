# Wata Watcha — Setup Guide

> **SDM404 Software Development Management · Torrens University Australia · Group 2**
> Real-time household water monitoring and leak detection dashboard.

---

## Prerequisites

| Tool | Minimum Version | Download |
|------|----------------|---------|
| Node.js | v18 LTS | https://nodejs.org |
| npm | v9+ | Included with Node.js |
| A browser | Any modern | Chrome recommended |

---

## Step 1 — Install dependencies

Open a terminal in the `wata-watcha/` folder and run:

```bash
npm install
```

This installs React, Firebase, Recharts, Tailwind CSS, Vite, and all other dependencies.

---

## Step 2 — Create a Firebase project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Enter project name: `wata-watcha` (or any name you like)
4. Disable Google Analytics (not needed) → Click **"Create project"**
5. Wait for the project to be created → Click **"Continue"**

---

## Step 3 — Enable Email/Password Authentication

1. In the Firebase Console sidebar → Click **"Authentication"**
2. Click **"Get started"**
3. Under **"Sign-in method"** tab → Click **"Email/Password"**
4. Toggle **"Enable"** → Click **"Save"**

---

## Step 4 — Enable Firestore Database

1. In the sidebar → Click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** → Click **"Next"**
4. Choose a location closest to you (e.g. `australia-southeast1`) → Click **"Enable"**

> **Note:** Test mode allows all reads/writes for 30 days.
> Deploy `firestore.rules` before going to production.

---

## Step 5 — Get your Firebase config

1. In Firebase Console → Click the **gear icon ⚙️** → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **web icon `</>`** to add a web app
4. Enter app nickname: `wata-watcha-web` → Click **"Register app"**
5. You will see a config object like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

---

## Step 6 — Add credentials to the app

### 6a — Update `src/firebase.js`

Open `src/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← paste your values here
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 6b — Update `simulate-pulse.cjs`

Open `simulate-pulse.cjs` and paste the **same** config values there too.

---

## Step 7 — Run the app

```bash
npm run dev
```

Open your browser at **http://localhost:5173**

---

## Step 8 — Create an account and register a device

1. Click **"Get Started Free"** on the landing page
2. Click the **"Create Account"** tab
3. Enter your email and a password (min. 6 chars) → Click **"Create Account"**
4. You will be redirected to the Dashboard
5. You'll see a **"Register Your Device"** form — enter this demo serial:

```
WW-2026-00001
```

6. Optionally add a nickname (e.g. `Main Meter`) → Click **"Register Device"**

---

## Step 9 — Run the pulse simulator

Find your Firebase **User UID**:
- Open browser DevTools (F12) → Console tab
- Type: `firebase.auth().currentUser` — look for the `uid` field

> Or go to Firebase Console → Authentication → Users → copy the UID column.

### Normal mode (random 0–5 pulses every 30s):

```bash
node simulate-pulse.cjs YOUR_UID_HERE
```

### Leak detection mode (constant 8 pulses = high flow rate):

```bash
node simulate-pulse.cjs YOUR_UID_HERE --leak
```

The simulator will log every write to the console. Switch back to the app and watch the gauge update live!

---

## Step 10 — Deploy Firestore security rules (before sharing)

Install Firebase CLI if you haven't:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
```

Then deploy the rules:
```bash
firebase deploy --only firestore:rules
```

---

## Building for production

```bash
npm run build
```

Output goes to the `dist/` folder. Serve it with any static host (Firebase Hosting, Vercel, Netlify).

To preview the production build locally:
```bash
npm run preview
```

---

## Project structure

```
wata-watcha/
├── index.html                  ← HTML entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── firestore.rules             ← Deploy to Firebase before going live
├── simulate-pulse.cjs          ← Node.js mock sensor script
├── SETUP.md                    ← This file
└── src/
    ├── main.jsx                ← React root
    ├── App.jsx                 ← Router + route guards
    ├── index.css               ← Global styles + Tailwind
    ├── firebase.js             ← Firebase SDK init ← ADD YOUR CONFIG HERE
    ├── context/
    │   └── AuthContext.jsx     ← Auth state + methods
    ├── hooks/
    │   ├── useDevice.js        ← Real-time device listener
    │   └── useLeakAlerts.js    ← Real-time leak alert listener
    ├── utils/
    │   └── pulseConverter.js   ← Unit conversion + error mapping
    ├── components/
    │   ├── Navbar.jsx          ← Desktop top bar + mobile bottom tabs
    │   ├── ProtectedRoute.jsx  ← Auth guard HOC
    │   ├── LiveGauge.jsx       ← Animated SVG flow gauge
    │   └── LeakBanner.jsx      ← Slide-down leak alert banner
    └── pages/
        ├── Landing.jsx         ← Public marketing page
        ├── Login.jsx           ← Sign in / Register / Password reset
        ├── Dashboard.jsx       ← Live monitoring (protected)
        ├── RegisterDevice.jsx  ← Device registration form
        ├── Analytics.jsx       ← Usage charts (protected)
        ├── Settings.jsx        ← Account + device settings (protected)
        └── Support.jsx         ← FAQ + contact form (protected)
```

---

## Firestore data structure

```
users/
  {uid}/
    device/
      main          { serialNumber, nickname, registeredAt, active }
    pulse_data/
      {docId}       { pulses, litres, flow_rate, timestamp, reading }
    leak_alerts/
      {docId}       { deviceName, timestamp, litres, resolved }

registered_devices/
  {serialNumber}    { uid, registeredAt }   ← global registry, prevents duplicates
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Update Node.js to v18+ |
| White screen on startup | Check `src/firebase.js` has real credentials |
| Gauge shows 0 | Run the simulator, check Firestore rules are deployed |
| Login error "invalid-credential" | Double-check email/password, ensure Auth is enabled |
| Simulator `permission-denied` | Verify UID is correct, check Firestore rules |
| Tailwind classes not applying | Run `npm run dev` (not build), check `tailwind.config.js` content paths |

---

*Wata Watcha · Group 2 · SDM404 · Torrens University Australia · 2026*
