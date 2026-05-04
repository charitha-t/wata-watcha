// RegisterDevice — validates serial number and registers a device to the current user in Firestore
import React, { useState } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Cpu, Loader } from 'lucide-react';

const SERIAL_REGEX = /^WW-\d{4}-\d{5}$/;

export default function RegisterDevice({ onRegistered }) {
  const { user } = useAuth();
  const [serial, setSerial] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');

    const trimmedSerial = serial.trim().toUpperCase();
    const trimmedNickname = nickname.trim() || 'My Device';

    if (!SERIAL_REGEX.test(trimmedSerial)) {
      setError('Serial number must be in format WW-YYYY-NNNNN (e.g. WW-2026-00001).');
      return;
    }

    setLoading(true);
    try {
      // Check global registry — is this serial already taken?
      const globalRef = doc(db, 'registered_devices', trimmedSerial);
      const globalSnap = await getDoc(globalRef);

      if (globalSnap.exists()) {
        const existing = globalSnap.data();
        if (existing.uid !== user.uid) {
          setError('This serial number is already registered to another account.');
          setLoading(false);
          return;
        }
      }

      // Write to global registry
      await setDoc(globalRef, {
        uid: user.uid,
        registeredAt: serverTimestamp(),
      });

      // Write to user's device document
      const deviceRef = doc(db, `users/${user.uid}/device/main`);
      await setDoc(deviceRef, {
        serialNumber: trimmedSerial,
        nickname: trimmedNickname,
        registeredAt: serverTimestamp(),
        active: true,
      });

      setSuccess(true);
      if (onRegistered) onRegistered();
    } catch {
      setError('Registration failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center glow-success">
          <CheckCircle size={32} className="text-success" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">Device Registered!</h3>
          <p className="text-muted text-sm">
            Your device is now connected. Start the simulator to see live data.
          </p>
        </div>
        <div className="alert-info text-sm">
          <span>Run: <code className="font-mono bg-white/10 px-2 py-0.5 rounded">node simulate-pulse.cjs {user?.uid}</code></span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-5" noValidate>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Cpu size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Register Your Device</h3>
          <p className="text-xs text-muted">Connect your Wata Watcha sensor to start monitoring</p>
        </div>
      </div>

      {error && (
        <div className="alert-error text-sm" role="alert">
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="serial-number" className="label-text">
          Serial Number <span className="text-danger">*</span>
        </label>
        <input
          id="serial-number"
          type="text"
          className="input-field font-mono tracking-wider uppercase"
          placeholder="WW-2026-00001"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          required
          maxLength={14}
          autoComplete="off"
        />
        <p className="text-xs text-muted mt-1.5">Format: WW-YYYY-NNNNN (found on your device label)</p>
      </div>

      <div>
        <label htmlFor="device-nickname" className="label-text">
          Device Nickname <span className="text-muted font-normal normal-case">(optional)</span>
        </label>
        <input
          id="device-nickname"
          type="text"
          className="input-field"
          placeholder="My Device"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={32}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !serial}
        className="btn-primary w-full"
        id="register-device-btn"
      >
        {loading ? (
          <>
            <Loader size={16} className="animate-spin" />
            Registering…
          </>
        ) : (
          <>
            <Cpu size={16} />
            Register Device
          </>
        )}
      </button>
    </form>
  );
}
