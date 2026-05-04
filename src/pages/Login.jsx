// Login — handles sign in, sign up, and password reset in a single tabbed page
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Droplets, Mail, Lock, Eye, EyeOff, Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mapFirebaseError } from '../utils/pulseConverter';

// 'login' | 'register' | 'reset'
export default function Login() {
  const { user, login, register, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/dashboard';

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  function resetForm() {
    setError('');
    setPassword('');
    setConfirmPassword('');
    setResetSent(false);
  }

  function switchMode(next) {
    resetForm();
    setMode(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else if (mode === 'register') {
        await register(email, password);
        navigate('/dashboard', { replace: true });
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    login: 'Welcome back',
    register: 'Create an account',
    reset: 'Reset your password',
  };

  const subs = {
    login: 'Sign in to your Wata Watcha dashboard',
    register: 'Start monitoring your household water today',
    reset: 'We\'ll email you a link to reset your password',
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12 animate-fade-in">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary transition-transform group-hover:scale-105">
            <Droplets size={22} className="text-white" />
          </div>
          <span className="font-serif text-2xl text-white">Wata Watcha</span>
        </Link>

        <div className="card animate-slide-up">
          {/* Mode toggle tabs (login / register) */}
          {mode !== 'reset' && (
            <div className="flex rounded-xl bg-bg border border-border p-1 mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === 'login' ? 'bg-primary text-white' : 'text-muted hover:text-white'
                }`}
                id="tab-login"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === 'register' ? 'bg-primary text-white' : 'text-muted hover:text-white'
                }`}
                id="tab-register"
              >
                Create Account
              </button>
            </div>
          )}

          {/* Back button for reset mode */}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors mb-5"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </button>
          )}

          <h1 className="text-xl font-serif text-white mb-1">{titles[mode]}</h1>
          <p className="text-sm text-muted mb-6">{subs[mode]}</p>

          {/* Reset success state */}
          {resetSent ? (
            <div className="flex flex-col items-center gap-4 py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
                <CheckCircle size={28} className="text-success" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Check your email</p>
                <p className="text-sm text-muted">
                  A password reset link has been sent to <strong className="text-white">{email}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="btn-secondary mt-2 text-sm px-5 py-2.5"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="alert-error text-sm" role="alert">
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="auth-email" className="label-text">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    id="auth-email"
                    type="email"
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password (not for reset mode) */}
              {mode !== 'reset' && (
                <div>
                  <label htmlFor="auth-password" className="label-text">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pl-10 pr-11"
                      placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm password (register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-confirm" className="label-text">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      id="auth-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      className="input-field pl-10 pr-11"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot password link */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-xs text-muted hover:text-accent transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
                id="auth-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Please wait…
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' :
                  mode === 'register' ? 'Create Account' :
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Wata Watcha · Group 2 · SDM404 · Torrens University Australia
        </p>
      </div>
    </div>
  );
}
