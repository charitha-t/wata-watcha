// Analytics — protected page showing water usage charts with Daily/Weekly/Monthly period toggle
import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../hooks/useDevice';
import Navbar from '../components/Navbar';
import { BarChart2, RefreshCw, Droplets, TrendingUp, Zap } from 'lucide-react';
import { formatLitres } from '../utils/pulseConverter';

const PERIODS = [
  { key: 'daily', label: 'Daily', days: 1, points: 24, unit: 'hour' },
  { key: 'weekly', label: 'Weekly', days: 7, points: 7, unit: 'day' },
  { key: 'monthly', label: 'Monthly', days: 30, points: 30, unit: 'day' },
];

function buildTimeSlots(period) {
  const now = new Date();
  const slots = [];

  if (period.unit === 'hour') {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now);
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() - i);
      slots.push({ label: `${String(d.getHours()).padStart(2, '0')}:00`, start: d, end: new Date(d.getTime() + 3600000), litres: 0 });
    }
  } else {
    for (let i = period.points - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      slots.push({
        label: d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
        start: d,
        end,
        litres: 0,
      });
    }
  }

  return slots;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-muted mb-1">{label}</p>
        <p className="text-base font-mono font-medium text-accent">
          {formatLitres(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { user } = useAuth();
  const { device } = useDevice(user?.uid);
  const [activePeriod, setActivePeriod] = useState('weekly');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const period = PERIODS.find((p) => p.key === activePeriod);

  useEffect(() => {
    if (!user?.uid) return;
    loadData();
  }, [user?.uid, activePeriod]);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const since = new Date();
      since.setDate(since.getDate() - period.days);
      if (period.unit === 'hour') {
        since.setHours(since.getHours() - 24);
      }

      const colRef = collection(db, `users/${user.uid}/pulse_data`);
      const q = query(
        colRef,
        where('timestamp', '>=', Timestamp.fromDate(since)),
        orderBy('timestamp', 'asc')
      );

      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ ...d.data() }));

      const slots = buildTimeSlots(period);

      docs.forEach((doc) => {
        const ts = doc.timestamp?.toDate?.();
        if (!ts) return;
        const slot = slots.find((s) => ts >= s.start && ts < s.end);
        if (slot) slot.litres += parseFloat(doc.litres) || 0;
      });

      setChartData(
        slots.map((s) => ({
          label: s.label,
          litres: parseFloat(s.litres.toFixed(2)),
        }))
      );
    } catch {
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const total = chartData.reduce((s, d) => s + d.litres, 0);
  const avg = chartData.length ? total / chartData.filter((d) => d.litres > 0).length || 0 : 0;
  const peak = Math.max(...chartData.map((d) => d.litres), 0);
  const hasData = total > 0;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 main-content-padded">
        {/* Header */}
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-serif text-white">Analytics</h1>
          <p className="text-sm text-muted mt-0.5">
            Water usage over time{device ? ` · ${device.nickname ?? device.serialNumber}` : ''}
          </p>
        </div>

        {error && (
          <div className="alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-slide-up">
          <div className="stat-card">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-1">
              <Droplets size={18} className="text-accent" />
            </div>
            <span className="stat-label">Total</span>
            <span className="stat-value text-xl">{formatLitres(total)}</span>
          </div>
          <div className="stat-card">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-1">
              <TrendingUp size={18} className="text-success" />
            </div>
            <span className="stat-label">Average</span>
            <span className="stat-value text-xl">{formatLitres(isNaN(avg) ? 0 : avg)}</span>
          </div>
          <div className="stat-card">
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center mb-1">
              <Zap size={18} className="text-warning" />
            </div>
            <span className="stat-label">Peak</span>
            <span className="stat-value text-xl">{formatLitres(peak)}</span>
          </div>
        </div>

        {/* Chart card */}
        <div className="card animate-slide-up">
          {/* Period toggle */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart2 size={17} className="text-accent" />
              Water Consumption
            </h2>
            <div className="flex bg-bg border border-border rounded-xl p-1 gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActivePeriod(p.key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activePeriod === p.key
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-white'
                  }`}
                  id={`period-${p.key}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw size={24} className="text-muted animate-spin" />
            </div>
          ) : !hasData ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/10 flex items-center justify-center">
                <BarChart2 size={28} className="text-muted/40" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">Not enough data yet</p>
                <p className="text-sm text-muted">
                  Run the simulator to generate readings, then check back here.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="litresGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0077B6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0077B6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#8BA3BC', fontSize: 11, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                  interval={activePeriod === 'daily' ? 3 : 0}
                />
                <YAxis
                  tick={{ fill: '#8BA3BC', fontSize: 11, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}L`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1E3A5F', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="litres"
                  stroke="#00B4D8"
                  strokeWidth={2.5}
                  fill="url(#litresGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#00B4D8', stroke: '#0D1B2A', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
}
