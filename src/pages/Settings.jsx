// Settings — protected page for editing device nickname and changing account password
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../hooks/useDevice';
import Navbar from '../components/Navbar';
import {
  User,
  Cpu,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader,
  CheckCircle,
} from 'lucide-react';
import { mapFirebaseError } from '../utils/pulseConverter';

export default function Settings() {
  const { user, changePassword } = useAuth();
  const { device, deviceLoading } = useDevice(user?.uid);

  // Nickname state
  const [nickname, setNickname] = useState('');
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [nicknameMsg, setNicknameMsg] = useState(null); // { type: 'success'|'error', text }

  // Password state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // Initialise nickname field from device when loaded
  React.useEffect(() => {
    if (device) setNickname(device.nickname ?? '');
  }, [device]);

  async function handleNicknameSave(e) {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameMsg({ type: 'error', text: 'Nickname cannot be empty.' });
      return;
    }
    setNicknameLoading(true);
    setNicknameMsg(null);
    try {
      const deviceRef = doc(db, `users/${user.uid}/device/main`);
      await updateDoc(deviceRef, { nickname: trimmed });
      setNicknameMsg({ type: 'success', text: 'Device nickname updated successfully.' });
    } catch {
      setNicknameMsg({ type: 'error', text: 'Failed to update nickname. Please try again.' });
    } finally {
      setNicknameLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwdMsg(null);

    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPwdLoading(true);
    try {
      await changePassword(currentPwd, newPwd);
      setPwdMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: mapFirebaseError(err.code) });
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 main-content-padded">
        {/* Header */}
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-serif text-white">Settings</h1>
          <p className="text-sm text-muted mt-0.5">Manage your account and device preferences</p>
        </div>

        {/* Account info card */}
        <div className="card mb-5 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <User size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Account</h2>
              <p className="text-xs text-muted">Your login credentials</p>
            </div>
          </div>
          <div>
            <label className="label-text">Email Address</label>
            <input
              type="email"
              className="input-field opacity-60 cursor-not-allowed"
              value={user?.email ?? ''}
              readOnly
              aria-label="Email address (read only)"
            />
            <p className="text-xs text-muted mt-1.5">Email cannot be changed after registration.</p>
          </div>
        </div>

        {/* Device nickname card */}
        <div className="card mb-5 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Cpu size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Device</h2>
              <p className="text-xs text-muted">
                {device ? `Serial: ${device.serialNumber}` : 'No device registered'}
              </p>
            </div>
          </div>

          {deviceLoading ? (
            <div className="flex items-center gap-2 text-muted text-sm py-2">
              <Loader size={14} className="animate-spin" />
              Loading device…
            </div>
          ) : !device ? (
            <p className="text-sm text-muted">
              Register a device from the{' '}
              <a href="/dashboard" className="text-accent hover:underline">Dashboard</a>.
            </p>
          ) : (
            <form onSubmit={handleNicknameSave} className="space-y-4" noValidate>
              {nicknameMsg && (
                <div className={nicknameMsg.type === 'success' ? 'alert-success text-sm' : 'alert-error text-sm'}>
                  {nicknameMsg.type === 'success' && <CheckCircle size={14} />}
                  <span>{nicknameMsg.text}</span>
                </div>
              )}
              <div>
                <label htmlFor="device-nickname-setting" className="label-text">Device Nickname</label>
                <input
                  id="device-nickname-setting"
                  type="text"
                  className="input-field"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={32}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={nicknameLoading}
                className="btn-primary text-sm px-5 py-2.5"
                id="save-nickname-btn"
              >
                {nicknameLoading ? (
                  <><Loader size={14} className="animate-spin" /> Saving…</>
                ) : (
                  <><Save size={14} /> Save Nickname</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Change password card */}
        <div className="card animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Lock size={18} className="text-warning" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Change Password</h2>
              <p className="text-xs text-muted">Requires your current password to confirm</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4" noValidate>
            {pwdMsg && (
              <div className={pwdMsg.type === 'success' ? 'alert-success text-sm' : 'alert-error text-sm'}>
                {pwdMsg.type === 'success' && <CheckCircle size={14} />}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <div>
              <label htmlFor="current-password" className="label-text">Current Password</label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Your current password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new-password" className="label-text">New Password</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="At least 6 characters"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="label-text">Confirm New Password</label>
              <input
                id="confirm-new-password"
                type="password"
                className="input-field"
                placeholder="Repeat new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="btn-primary text-sm px-5 py-2.5"
              id="change-password-btn"
            >
              {pwdLoading ? (
                <><Loader size={14} className="animate-spin" /> Updating…</>
              ) : (
                <><Lock size={14} /> Update Password</>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
