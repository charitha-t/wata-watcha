// Utility functions — convert raw pulse readings into human-readable water measurements
const LITRES_PER_PULSE = 0.5;
const SECONDS_PER_INTERVAL = 30;

export function pulsesToLitres(pulses) {
  return parseFloat((pulses * LITRES_PER_PULSE).toFixed(2));
}

export function pulsesToFlowRate(pulses) {
  const litres = pulsesToLitres(pulses);
  return parseFloat(((litres / SECONDS_PER_INTERVAL) * 60).toFixed(2));
}

export function formatLitres(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} kL`;
  return `${Number(value).toFixed(1)} L`;
}

export function formatFlowRate(lpm) {
  return `${Number(lpm).toFixed(1)} L/min`;
}

export function getFlowStatus(flowRate) {
  const rate = parseFloat(flowRate) || 0;
  if (rate === 0) return 'no-flow';
  if (rate > 5) return 'leak';
  return 'flowing';
}

export function statusLabel(status) {
  const labels = {
    'no-flow': 'No Flow',
    'flowing': 'Water Flowing',
    'leak': 'Leak Detected',
  };
  return labels[status] ?? 'Unknown';
}

export function statusColors(status) {
  const colors = {
    'no-flow': { bg: 'bg-muted/20', text: 'text-muted', dot: 'bg-muted', ring: 'border-muted/40' },
    'flowing': { bg: 'bg-success/15', text: 'text-success', dot: 'bg-success', ring: 'border-success/40' },
    'leak': { bg: 'bg-danger/15', text: 'text-danger', dot: 'bg-danger', ring: 'border-danger/40' },
  };
  return colors[status] ?? colors['no-flow'];
}

export function formatTimestamp(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function mapFirebaseError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/requires-recent-login': 'Please log out and log back in before changing your password.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}
