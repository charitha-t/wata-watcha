// Navbar — sticky desktop top bar + fixed mobile bottom tab bar with active route highlighting
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Droplets,
  LayoutDashboard,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/support', label: 'Support', icon: HelpCircle },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch {
      setLoggingOut(false);
    }
  }

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      {/* ── DESKTOP TOP NAVBAR ─────────────────────────────────── */}
      <header className="hidden md:block sticky top-0 z-40 glass border-b border-border">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
              <Droplets size={18} className="text-white" />
            </div>
            <span className="font-serif text-lg text-white">Wata Watcha</span>
          </NavLink>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link'
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface transition-all duration-200 border border-transparent hover:border-border"
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              <div className="w-7 h-7 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center text-xs font-bold text-accent">
                {emailInitial}
              </div>
              <span className="text-sm text-muted max-w-32 truncate">{user?.email}</span>
              <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-down z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-muted">Signed in as</p>
                  <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                >
                  <LogOut size={15} />
                  {loggingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ── MOBILE TOP HEADER ──────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Droplets size={15} className="text-white" />
            </div>
            <span className="font-serif text-base text-white">Wata Watcha</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 text-muted hover:text-danger transition-colors text-xs font-medium disabled:opacity-50"
          >
            <LogOut size={14} />
            {loggingOut ? '…' : 'Out'}
          </button>
        </div>
      </header>

      {/* ── MOBILE BOTTOM TAB BAR ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border mobile-tab-bar">
        <div className="flex items-center justify-around py-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'tab-btn-active' : 'tab-btn'
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-accent' : 'text-muted'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
