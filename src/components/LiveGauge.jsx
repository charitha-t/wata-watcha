// LiveGauge — animated circular SVG gauge displaying real-time flow rate in L/min
import React, { useEffect, useState } from 'react';
import { getFlowStatus, statusColors, statusLabel } from '../utils/pulseConverter';

const RADIUS = 80;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_FLOW = 10; // L/min — full-scale value

function getArcOffset(flowRate) {
  const clamped = Math.min(Math.max(parseFloat(flowRate) || 0, 0), MAX_FLOW);
  const fraction = clamped / MAX_FLOW;
  return CIRCUMFERENCE * (1 - fraction * 0.75); // 75% arc
}

export default function LiveGauge({ flowRate = 0, isConnecting = false }) {
  const [displayedRate, setDisplayedRate] = useState(flowRate);

  useEffect(() => {
    setDisplayedRate(flowRate);
  }, [flowRate]);

  const status = getFlowStatus(displayedRate);
  const colors = statusColors(status);

  const strokeColor =
    status === 'leak' ? '#EF233C' :
    status === 'flowing' ? '#06D6A0' :
    '#1E3A5F';

  const glowClass =
    status === 'leak' ? 'glow-danger' :
    status === 'flowing' ? 'glow-success' :
    '';

  const dashOffset = getArcOffset(displayedRate);
  const viewSize = (RADIUS + STROKE_WIDTH + 4) * 2;
  const center = viewSize / 2;

  // 75% arc: start at 135deg, end at 45deg (going clockwise)
  const startAngle = 135;
  const endAngle = 45;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const trackStart = {
    x: center + RADIUS * Math.cos(startRad),
    y: center + RADIUS * Math.sin(startRad),
  };
  const trackEnd = {
    x: center + RADIUS * Math.cos(endRad),
    y: center + RADIUS * Math.sin(endRad),
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative rounded-full p-2 ${glowClass} transition-all duration-700`}>
        <svg
          width={viewSize}
          height={viewSize}
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className="drop-shadow-lg"
          aria-label={`Flow rate gauge: ${displayedRate} L/min`}
        >
          {/* Track (background arc) */}
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            stroke="#1E3A5F"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${CIRCUMFERENCE * 0.75} ${CIRCUMFERENCE * 0.25}`}
            strokeDashoffset={CIRCUMFERENCE * 0.125}
            strokeLinecap="round"
            transform={`rotate(135, ${center}, ${center})`}
          />

          {/* Active arc */}
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${CIRCUMFERENCE * 0.75} ${CIRCUMFERENCE * 0.25}`}
            strokeDashoffset={
              (() => {
                const clamped = Math.min(Math.max(parseFloat(displayedRate) || 0, 0), MAX_FLOW);
                const fraction = clamped / MAX_FLOW;
                // We want 0% flow = full offset (hidden), 100% flow = 0 offset (full arc)
                const arcLength = CIRCUMFERENCE * 0.75;
                return arcLength * (1 - fraction);
              })()
            }
            strokeLinecap="round"
            transform={`rotate(135, ${center}, ${center})`}
            className="gauge-transition"
          />

          {/* Center value */}
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="28"
            fontFamily="DM Mono, monospace"
            fontWeight="500"
          >
            {isConnecting ? '...' : Number(displayedRate).toFixed(1)}
          </text>

          <text
            x={center}
            y={center + 22}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#8BA3BC"
            fontSize="11"
            fontFamily="DM Sans, sans-serif"
          >
            L/min
          </text>

          {/* Min / Max labels */}
          <text
            x={trackStart.x}
            y={trackStart.y + 18}
            textAnchor="middle"
            fill="#1E3A5F"
            fontSize="9"
            fontFamily="DM Mono, monospace"
          >
            0
          </text>
          <text
            x={trackEnd.x}
            y={trackEnd.y + 18}
            textAnchor="middle"
            fill="#1E3A5F"
            fontSize="9"
            fontFamily="DM Mono, monospace"
          >
            {MAX_FLOW}
          </text>
        </svg>

        {/* Pulse ring for leak state */}
        {status === 'leak' && (
          <div className="absolute inset-0 rounded-full border-2 border-danger/40 pulse-ring" />
        )}
      </div>

      {/* Status badge */}
      <div className={`badge ${colors.bg} ${colors.text} ${colors.ring} border text-sm px-4 py-1.5`}>
        <span className={`w-2 h-2 rounded-full ${colors.dot} ${status !== 'no-flow' ? 'animate-pulse' : ''}`} />
        {statusLabel(status)}
      </div>
    </div>
  );
}
