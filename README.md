# Wata Watcha — Smart Water Monitoring Dashboard

Wata Watcha is a production-ready, real-time household water monitoring and intelligent leak detection system. It connects to hardware water meter sensors to provide homeowners with live flow data, historical analytics, and instant security alerts to prevent expensive water damage.

---

## 🚀 Quick Start for New Users

Follow these steps to set up Wata Watcha on any machine.

### 1. Prerequisites
Ensure you have the following installed:
*   **Node.js** (v18.0.0 or higher)
*   **npm** (comes with Node.js)
*   A modern web browser (Chrome, Firefox, Edge)

### 2. Installation
1.  Download or clone the project folder.
2.  Open your terminal/command prompt in the `wata-watcha` directory.
3.  Run the installation command:
    ```bash
    npm install
    ```

### 3. Firebase Setup
This project uses Firebase for Authentication and Real-time Database (Firestore).
1.  Create a new project at [Firebase Console](https://console.firebase.google.com/).
2.  **Enable Authentication**: Go to Authentication > Sign-in method > Enable **Email/Password**.
3.  **Create Firestore Database**: Go to Firestore Database > Create Database > Select **Test Mode**.
4.  **Add Web App**: In Project Settings, click the `</>` icon to register a web app.
5.  **Copy Credentials**: Copy the `firebaseConfig` object.

### 4. Configuration
You must add your Firebase credentials to two files:

1.  **Frontend Config**: Open `src/firebase.js` and paste your config:
    ```javascript
    const firebaseConfig = {
      apiKey: "...",
      authDomain: "...",
      projectId: "...",
      // ... rest of your keys
    };
    ```

2.  **Simulator Config**: Open `simulate-pulse.cjs` and paste the **same** config there.

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Testing the System

### 1. Create an Account
Go to the landing page, click **Get Started**, and register with any email and password.

### 2. Register a Device
Once logged in, you will be prompted to register a device. Use the following demo serial number:
`WW-2026-00001`

### 3. Run the Hardware Simulator
To see live data moving on your dashboard without physical hardware, run the mock sensor script in a separate terminal:
```bash
# Get your User UID from the App Settings or Firebase Console
node simulate-pulse.cjs YOUR_USER_UID
```

*   **Normal Mode**: `node simulate-pulse.cjs UID` (Random 0-5 L/min)
*   **Leak Mode**: `node simulate-pulse.cjs UID --leak` (Constant 8 L/min - triggers red alert banner)

---

## 📦 Project Structure

*   `src/App.jsx` - Main router and authentication guards.
*   `src/pages/Dashboard.jsx` - Real-time monitoring UI with SVG gauge.
*   `src/pages/Analytics.jsx` - Usage trends using Recharts.
*   `src/pages/Landing.jsx` - Public marketing and SEO-optimized entry page.
*   `simulate-pulse.cjs` - Node.js script simulating hardware sensor pulses.
*   `firestore.rules` - Security rules to protect user data.

---

## 🔒 Firestore Security Rules
For production, ensure you deploy the included `firestore.rules`. During testing, you can set your rules to "Test Mode" in the Firebase Console:
```javascript
match /{document=**} {
  allow read, write: if true;
}
```

---

## ✨ Features
*   **Live SVG Gauge**: Animated visualization of real-time water flow.
*   **Instant Alerts**: Top-bar banner notifications when leaks are detected.
*   **Usage Analytics**: Daily/Weekly/Monthly consumption charts.
*   **Device Management**: Securely pair sensors with specific user accounts.
*   **Responsive Design**: Mobile-first UI with a premium dark theme.

---

**Developed by Group 2**
*University Project for SDM404 Software Development Management*
