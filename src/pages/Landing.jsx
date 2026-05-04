// Landing — public marketing page with hero, features, stats, FAQ accordion, and footer
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets,
  Zap,
  BarChart2,
  Shield,
  Bell,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    desc: 'Live flow rate readings every 30 seconds from your water meter sensor, displayed on a beautiful animated dashboard.',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
  },
  {
    icon: Bell,
    title: 'Instant Leak Alerts',
    desc: 'Automatically detects abnormal flow patterns and fires an alert within 60 seconds — before damage can spread.',
    color: 'text-danger',
    bg: 'bg-danger/10 border-danger/20',
  },
  {
    icon: BarChart2,
    title: 'Usage Analytics',
    desc: 'Daily, weekly, and monthly water consumption charts with peak usage identification and trend analysis.',
    color: 'text-success',
    bg: 'bg-success/10 border-success/20',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Your data is protected with Firebase Authentication and strict Firestore security rules — only you can see your usage.',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20',
  },
];

const stats = [
  { value: '1 in 6', label: 'Australian homes have hidden leaks', sub: 'Source: Water Services Association' },
  { value: '$30K+', label: 'Average water damage claim', sub: 'Source: Insurance Council of Australia' },
  { value: '< 60s', label: 'Alert time after leak starts', sub: 'Wata Watcha detection speed' },
  { value: '200 L', label: 'Lost per day from a dripping tap', sub: 'Per Water Corporation WA' },
];

const faqs = [
  {
    q: 'What hardware do I need to use Wata Watcha?',
    a: 'Wata Watcha works with any pulse-output water meter sensor (YF-S201 or similar). The sensor connects to a microcontroller (e.g. ESP32) which sends pulse data to Firebase. You can also test the app using the included simulate-pulse.cjs script.',
  },
  {
    q: 'How does leak detection work?',
    a: 'The app continuously monitors your flow rate. If the flow rate exceeds 5 L/min for a 30-second interval — indicating continuous high flow with no normal usage — the system automatically creates a leak alert and displays a banner notification.',
  },
  {
    q: 'Is my water usage data private?',
    a: 'Yes. Firestore security rules ensure that only your own account can read or write your data. No other user or admin can access your readings, device info, or alerts.',
  },
  {
    q: 'Can I monitor multiple devices?',
    a: 'The current version supports one device per account. Multi-device support is planned for a future release.',
  },
  {
    q: 'How do I get my device serial number?',
    a: 'Your Wata Watcha sensor comes with a label on the back in the format WW-YYYY-NNNNN. For testing purposes, you can use the demo serial WW-2026-00001.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/3 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-white font-medium text-sm">{q}</span>
        <ChevronDown
          size={18}
          className={`text-muted flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 animate-fade-in">
          <p className="text-muted text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleCTA() {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="page-wrapper">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
              <Droplets size={18} className="text-white" />
            </div>
            <span className="font-serif text-lg text-white">Wata Watcha</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm px-4 py-2">
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm" id="nav-signin">
                  Sign In
                </Link>
                <Link
                  to="/login"
                  onClick={() => setTimeout(() => document.getElementById('tab-register')?.click(), 50)}
                  className="btn-primary text-sm px-4 py-2"
                  id="nav-get-started"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6">
        {/* Bg blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-accent text-xs font-semibold mb-8">
            <Zap size={12} />
            Real-time household water monitoring
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-tight mb-6">
            <span className="text-gradient-hero">Stop Leaks</span>
            <br />
            <span className="text-white">Before They Cost You</span>
          </h1>

          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Wata Watcha connects to your household water meter and gives you live flow data,
            instant leak alerts, and deep usage analytics — all in one beautiful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCTA}
              className="btn-primary text-base px-8 py-4 glow-primary"
              id="hero-cta-btn"
            >
              {user ? 'Open Dashboard' : 'Get Started Free'}
              <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              className="btn-secondary text-base px-8 py-4"
              id="hero-learn-more"
            >
              See How It Works
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-muted">
            {['No credit card required', 'Free to use', 'Runs locally', 'Open source'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-success" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 px-6 border-y border-border bg-surface/40">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <div className="text-3xl font-mono font-medium text-gradient mb-1">{s.value}</div>
              <div className="text-sm text-white font-medium mb-0.5">{s.label}</div>
              <div className="text-xs text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-heading">Everything you need to protect your home</h2>
            <p className="section-sub max-w-xl mx-auto">
              From live sensor data to historical analytics, Wata Watcha gives you complete visibility over your household water.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className={`card border ${f.bg} hover:border-opacity-60 transition-all duration-300 group`}>
                <div className={`w-11 h-11 rounded-xl ${f.bg} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-heading">Up and running in minutes</h2>
            <p className="section-sub">No complicated setup. No cloud subscriptions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create an Account', desc: 'Sign up with your email and password. No credit card needed.' },
              { step: '02', title: 'Register Your Device', desc: 'Enter your sensor\'s serial number (format: WW-YYYY-NNNNN) to pair it.' },
              { step: '03', title: 'Monitor Live', desc: 'Open the dashboard and watch real-time flow data appear as your sensor sends readings.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-xl font-medium text-accent">{item.step}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-heading">Frequently asked questions</h2>
            <p className="section-sub">Everything you need to know about Wata Watcha.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center card border-primary/30 glow-primary">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-6">
            <Droplets size={28} className="text-accent" />
          </div>
          <h2 className="text-3xl font-serif text-white mb-3">Ready to protect your home?</h2>
          <p className="text-muted mb-8">
            Join households already using Wata Watcha to monitor water usage and catch leaks early.
          </p>
          <button
            onClick={handleCTA}
            className="btn-primary text-base px-8 py-4 mx-auto glow-primary"
            id="bottom-cta-btn"
          >
            {user ? 'Go to Dashboard' : 'Get Started — It\'s Free'}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/80 flex items-center justify-center">
              <Droplets size={13} className="text-white" />
            </div>
            <span className="text-sm text-muted">Wata Watcha</span>
          </div>
          <p className="text-xs text-muted text-center">
            © 2026 Group 2 — SDM404 Software Development Management · Torrens University Australia
          </p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
