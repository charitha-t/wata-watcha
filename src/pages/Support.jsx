// Support — protected page with FAQ accordion and contact form with simulated success state
import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Send, CheckCircle, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';

const faqs = [
  {
    q: 'How do I install the sensor on my water meter?',
    a: 'Attach your pulse-output sensor (e.g. YF-S201) to the water meter\'s pulse output terminals. Connect the sensor to your ESP32/Arduino, upload the firmware that sends readings to Firebase, and register the device serial number in the app.',
  },
  {
    q: 'What do I do when a leak alert fires?',
    a: 'Check all taps, appliances, and toilets immediately. Look for any running water, dripping fixtures, or wet spots. If you cannot find the source, turn off your mains water supply and contact a licensed plumber.',
  },
  {
    q: 'Why is my flow rate stuck at 0 L/min?',
    a: 'This usually means no pulse data is being received. Make sure your device is powered on and connected to the internet, or run the simulator with: node simulate-pulse.cjs YOUR_UID',
  },
  {
    q: 'Can I use Wata Watcha without a physical sensor?',
    a: 'Yes! Use the included simulate-pulse.cjs script to generate test data. Run it in Node.js with your Firebase UID to simulate normal flow, or add the --leak flag to test leak detection.',
  },
  {
    q: 'How do I find my Firebase User UID?',
    a: 'Sign in to the app, then open your browser console (F12) and type: firebase.auth().currentUser.uid. Alternatively, go to Firebase Console → Authentication → Users and copy your UID from there.',
  },
  {
    q: 'The simulator fails with a permission error. What should I do?',
    a: 'Make sure you have added your Firebase config credentials to simulate-pulse.cjs. Also check that Firestore rules allow writes to users/{uid}/pulse_data/** — deploy the included firestore.rules file.',
  },
  {
    q: 'How is my data secured?',
    a: 'All data is stored in Google Firestore with strict security rules. Only your authenticated account can read or write your data. Passwords are managed by Firebase Authentication — we never store them.',
  },
];

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/3 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        id={`faq-${index}`}
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-accent text-xs font-mono flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-white font-medium text-sm">{q}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 animate-fade-in border-t border-border pt-3">
          <p className="text-muted text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Support() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    // Simulate async submission
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1200);
  }

  function handleReset() {
    setName('');
    setMessage('');
    setSubmitted(false);
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 main-content-padded">
        {/* Header */}
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-serif text-white">Support</h1>
          <p className="text-sm text-muted mt-0.5">Answers to common questions and a way to reach the team</p>
        </div>

        {/* FAQ section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-accent" />
            <h2 className="text-base font-semibold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Contact form */}
        <div className="card animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <MessageSquare size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Contact the Team</h2>
              <p className="text-xs text-muted">SDM404 Group 2 — Torrens University Australia</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 animate-fade-in text-center">
              <div className="w-14 h-14 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
                <CheckCircle size={28} className="text-success" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Message received!</p>
                <p className="text-sm text-muted">
                  Thanks, {name}! We'll get back to you as soon as possible.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary text-sm px-5 py-2.5 mt-2"
                id="send-another-btn"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="support-name" className="label-text">
                  Your Name <span className="text-danger">*</span>
                </label>
                <input
                  id="support-name"
                  type="text"
                  className="input-field"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={64}
                />
              </div>
              <div>
                <label htmlFor="support-message" className="label-text">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  id="support-message"
                  className="input-field resize-none"
                  placeholder="Describe your issue or question…"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={1000}
                />
                <p className="text-xs text-muted mt-1 text-right">{message.length}/1000</p>
              </div>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !message.trim()}
                className="btn-primary text-sm px-5 py-2.5"
                id="support-submit-btn"
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                ) : (
                  <><Send size={14} /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
