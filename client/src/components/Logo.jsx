import React from 'react';

export default function Logo({ size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        boxShadow: '0 0 14px rgba(59, 130, 246, 0.25)'
      }}
    >
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoShieldGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="logoFlameGrad" x1="16" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Shield */}
        <path
          d="M16 3L5 7V15C5 21.6 9.7 27.7 16 29C22.3 27.7 27 21.6 27 15V7L16 3Z"
          stroke="url(#logoShieldGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Thermometer stem */}
        <path
          d="M16 9V17"
          stroke="#38bdf8"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Thermometer bulb */}
        <circle
          cx="16"
          cy="20"
          r="3"
          fill="url(#logoFlameGrad)"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}
