// Dashboard — protected page showing live gauge, stats, recent readings, and device status
import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../hooks/useDevice';
import { useLeakAlerts } from '../hooks/useLeakAlerts';
import Navbar from '../components/Navbar';
import LiveGauge from '../components/LiveGauge';
import LeakBanner from '../components/LeakBanner';
import RegisterDevice from './RegisterDevice';
import {
  getFlowStatus,
  formatLitres,
  formatFlowRate,
  formatTimestamp,
} from '../utils/pulseConverter';
import {
  Droplets,
  Activity,
  AlertTriangle,
  Database,
  WifiOff,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { device, deviceLoading } = useDevice(user?.uid);
  const { alerts } = useLeakAlerts(user?.uid);

  const [readings, setReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [dismissedLeak, setDismissedLeak] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);

  // Real-time listener for pulse data
  useEffect(() => {
    if (!user?.uid || !device) {
      setPulseLoading(false);
      return;
    }

    const colRef = collection(db, `users/${user.uid}/pulse_data`);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReadings(docs.slice(0, 8));
        setLatestReading(docs[0] ?? null);
        setConnectionError(false);
        setPulseLoading(false);

        // Calculate today's total litres
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayTotal = docs.reduce((sum, doc) => {
          const ts = doc.timestamp?.toDate?.();
          if (ts && ts >= today) return sum + (parseFloat(doc.litres) || 0);
          return sum;
        }, 0);
        setTodayTotal(dayTotal);
      },
      () => {
        setConnectionError(true);
        setPulseLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, device]);

  // Reset leak banner when alerts clear
  useEffect(() => {
    if (alerts.length === 0) setDismissedLeak(false);
  }, [alerts]);

  const currentFlowRate = parseFloat(latestReading?.flow_rate) || 0;
  const flowStatus = getFlowStatus(currentFlowRate);
  const activeAlertCount = alerts.length;

  const statCards = [
    {
      label: 'Used Today',
      value: formatLitres(todayTotal),
      icon: Droplets,
      iconClass: 'text-accent',
      iconBg: 'bg-accent/10',
    },
    {
      label: 'Current Flow',
      value: formatFlowRate(currentFlowRate),
      icon: Activity,
      iconClass: flowStatus === 'leak' ? 'text-danger' : flowStatus === 'flowing' ? 'text-success' : 'text-muted',
      iconBg: flowStatus === 'leak' ? 'bg-danger/10' : flowStatus === 'flowing' ? 'bg-success/10' : 'bg-muted/10',
    },
    {
      label: 'Active Alerts',
      value: activeAlertCount.toString(),
      icon: AlertTriangle,
      iconClass: activeAlertCount > 0 ? 'text-danger' : 'text-muted',
      iconBg: activeAlertCount > 0 ? 'bg-danger/10' : 'bg-muted/10',
    },
    {
      label: 'Total Readings',
      value: (latestReading?.reading ?? 0).toString(),
      icon: Database,
      iconClass: 'text-primary',
      iconBg: 'bg-primary/10',
    },
  ];

  return (
    <div className="page-wrapper">
      {/* Leak banner */}
      {!dismissedLeak && alerts.length > 0 && (
        <LeakBanner alerts={alerts} onDismiss={() => setDismissedLeak(true)} />
      )}

      <Navbar />

      <main
        className={`max-w-6xl mx-auto px-4 md:px-6 py-6 main-content-padded ${
          !dismissedLeak && alerts.length > 0 ? 'pt-20' : ''
        }`}
      >
        {/* Page header */}
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-serif text-white">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">
            {device ? `Monitoring: ${device.nickname ?? device.serialNumber}` : 'No device connected'}
          </p>
        </div>

        {/* Connection error */}
        {connectionError && (
          <div className="alert-error mb-4 animate-slide-down">
            <WifiOff size={16} />
            <span>Reconnecting to Firestore… Check your internet connection.</span>
            <RefreshCw size={14} className="ml-auto animate-spin" />
          </div>
        )}

        {/* No device — show register form */}
        {!deviceLoading && !device && (
          <div className="card max-w-lg mx-auto animate-slide-up">
            <RegisterDevice />
          </div>
        )}

        {/* Device found — show dashboard */}
        {!deviceLoading && device && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 animate-slide-up">
              {statCards.map((card) => (
                <div key={card.label} className="stat-card">
                  <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-1`}>
                    <card.icon size={18} className={card.iconClass} />
                  </div>
                  <span className="stat-label">{card.label}</span>
                  <span className="stat-value font-mono text-xl">{card.value}</span>
                </div>
              ))}
            </div>

            {/* Gauge + recent readings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Gauge panel */}
              <div className="card flex flex-col items-center justify-center gap-6 animate-slide-up md:col-span-1">
                <div className="text-center">
                  <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">Live Flow Rate</h2>
                  <p className="text-xs text-muted">Updates every 30 seconds</p>
                </div>

                {pulseLoading ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <RefreshCw size={28} className="text-muted animate-spin" />
                    <p className="text-sm text-muted">Waiting for data…</p>
                  </div>
                ) : (
                  <LiveGauge flowRate={currentFlowRate} isConnecting={connectionError} />
                )}

                {latestReading && (
                  <div className="w-full bg-bg rounded-xl p-3 text-center">
                    <p className="text-xs text-muted mb-1">Last reading</p>
                    <p className="text-sm text-white font-mono">
                      {formatTimestamp(latestReading.timestamp)}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {latestReading.pulses} pulses · {latestReading.litres} L
                    </p>
                  </div>
                )}

                {/* Device info */}
                <div className="w-full border-t border-border pt-4 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Cpu size={15} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{device.nickname ?? 'My Device'}</p>
                    <p className="text-xs text-muted font-mono">{device.serialNumber}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Active
                  </span>
                </div>
              </div>

              {/* Recent readings table */}
              <div className="card md:col-span-2 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-white">Recent Readings</h2>
                  <span className="text-xs text-muted">Last 8 entries</span>
                </div>

                {readings.length === 0 && !pulseLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <Activity size={32} className="text-muted/40" />
                    <p className="text-sm text-muted">No readings yet.</p>
                    <p className="text-xs text-muted max-w-xs">
                      Run <code className="font-mono bg-bg px-2 py-0.5 rounded text-accent">node simulate-pulse.cjs {user?.uid}</code> to generate data.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs text-muted font-semibold uppercase tracking-wider pb-2 pr-4">Time</th>
                          <th className="text-right text-xs text-muted font-semibold uppercase tracking-wider pb-2 pr-4">Flow</th>
                          <th className="text-right text-xs text-muted font-semibold uppercase tracking-wider pb-2 pr-4">Volume</th>
                          <th className="text-right text-xs text-muted font-semibold uppercase tracking-wider pb-2">Pulses</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {readings.map((r, i) => {
                          const st = getFlowStatus(r.flow_rate);
                          return (
                            <tr key={r.id} className={`transition-colors ${i === 0 ? 'bg-white/2' : ''}`}>
                              <td className="py-2.5 pr-4 font-mono text-xs text-muted">
                                {formatTimestamp(r.timestamp)}
                              </td>
                              <td className="py-2.5 pr-4 text-right">
                                <span className={`font-mono text-xs font-medium ${
                                  st === 'leak' ? 'text-danger' :
                                  st === 'flowing' ? 'text-success' :
                                  'text-muted'
                                }`}>
                                  {formatFlowRate(r.flow_rate)}
                                </span>
                              </td>
                              <td className="py-2.5 pr-4 text-right font-mono text-xs text-white">
                                {formatLitres(r.litres)}
                              </td>
                              <td className="py-2.5 text-right font-mono text-xs text-muted">
                                {r.pulses}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Loading skeleton */}
        {deviceLoading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="text-muted animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
}
