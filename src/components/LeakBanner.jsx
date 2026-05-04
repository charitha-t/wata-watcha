// LeakBanner — animated alert banner displayed when an active leak is detected
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatTimestamp } from '../utils/pulseConverter';

export default function LeakBanner({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  const latest = alerts[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-danger border-b border-danger/60 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                ⚠️ Leak Detected — {latest.deviceName ?? 'Your Device'}
              </p>
              <p className="text-white/80 text-xs">
                {latest.litres ? `${Number(latest.litres).toFixed(1)} L lost` : 'Abnormal flow rate detected'}
                {latest.timestamp ? ` · Detected at ${formatTimestamp(latest.timestamp)}` : ''}
                {alerts.length > 1 ? ` · ${alerts.length} active alerts` : ''}
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Dismiss leak alert"
            >
              <X size={16} className="text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
