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
        borderRadius: '6px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)'
      }}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Civic Shield Outline */}
        <path
          d="M16 4L6 8V15C6 21.2 10.3 26.9 16 28C21.7 26.9 26 21.2 26 15V8L16 4Z"
          stroke="#77848D"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Precision Thermal Geometry */}
        <path
          d="M16 9V17"
          stroke="#315F7D"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle
          cx="16"
          cy="20.5"
          r="2.8"
          fill="#B4473D"
          stroke="#FFFFFF"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
