import React from "react";

export function WaveSparkline() {
  return (
    <div className="w-full h-16 mt-3">
      <svg
        viewBox="0 0 300 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <path
          d="M0 45 C40 45, 60 52, 90 40 C120 28, 140 38, 170 20 C200 8, 230 25, 260 22 C280 20, 290 28, 300 25"
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M0 45 C40 45, 60 52, 90 40 C120 28, 140 38, 170 20 C200 8, 230 25, 260 22 C280 20, 290 28, 300 25 L300 60 L0 60 Z"
          fill="url(#waveGradient)"
        />
      </svg>
    </div>
  );
}
