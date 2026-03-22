import React from 'react';

// Stars that look like stars — not fog.
// Root cause of haze: 3×3px SVG tile repeated wall-to-wall = solid white wash.
// Fix: 200×200px sparse tile with only a handful of dots, low opacity layers.

export const Stars = ({
  twinkleSpeed = 6,
  withGradient = false,
}) => {
  const starPattern = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20"  cy="40"  r="0.8" fill="white" opacity="0.7"/>
    <circle cx="75"  cy="15"  r="0.6" fill="white" opacity="0.5"/>
    <circle cx="130" cy="80"  r="1.0" fill="white" opacity="0.8"/>
    <circle cx="170" cy="30"  r="0.7" fill="white" opacity="0.6"/>
    <circle cx="50"  cy="120" r="0.9" fill="white" opacity="0.7"/>
    <circle cx="100" cy="160" r="0.6" fill="white" opacity="0.5"/>
    <circle cx="160" cy="140" r="0.8" fill="white" opacity="0.6"/>
    <circle cx="10"  cy="180" r="0.5" fill="white" opacity="0.4"/>
    <circle cx="190" cy="100" r="0.7" fill="white" opacity="0.7"/>
    <circle cx="90"  cy="55"  r="0.5" fill="white" opacity="0.5"/>
    <circle cx="145" cy="185" r="0.6" fill="white" opacity="0.4"/>
    <circle cx="35"  cy="75"  r="0.4" fill="white" opacity="0.6"/>
  </svg>`;

  const twinklePattern = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="55"  cy="25"  r="0.7" fill="white" opacity="0.8"/>
    <circle cx="110" cy="70"  r="0.5" fill="white" opacity="0.6"/>
    <circle cx="180" cy="55"  r="0.9" fill="white" opacity="0.7"/>
    <circle cx="30"  cy="150" r="0.6" fill="white" opacity="0.5"/>
    <circle cx="140" cy="110" r="0.8" fill="white" opacity="0.7"/>
    <circle cx="70"  cy="190" r="0.5" fill="white" opacity="0.4"/>
    <circle cx="195" cy="175" r="0.7" fill="white" opacity="0.6"/>
  </svg>`;

  const encode = (svg) => btoa(svg);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', zIndex: 0, overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('data:image/svg+xml;base64,${encode(starPattern)}')`,
        backgroundSize: '200px 200px',
        opacity: 0.9,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('data:image/svg+xml;base64,${encode(twinklePattern)}')`,
        backgroundSize: '200px 200px',
        backgroundPosition: '100px 100px',
        animation: `starTwinkle ${twinkleSpeed}s infinite ease-in-out`,
        pointerEvents: 'none'
      }} />

      {withGradient && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(10,15,26,0.3) 0%, rgba(13,27,42,0.2) 100%)',
          pointerEvents: 'none'
        }} />
      )}

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export const SimpleStars = () => {
  const pattern = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30"  cy="50"  r="0.8" fill="white" opacity="0.6"/>
    <circle cx="120" cy="20"  r="0.6" fill="white" opacity="0.5"/>
    <circle cx="170" cy="90"  r="0.7" fill="white" opacity="0.7"/>
    <circle cx="60"  cy="140" r="0.5" fill="white" opacity="0.5"/>
    <circle cx="150" cy="160" r="0.8" fill="white" opacity="0.6"/>
  </svg>`;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('data:image/svg+xml;base64,${btoa(pattern)}')`,
        backgroundSize: '200px 200px',
        opacity: 0.7,
        animation: 'simpleTwinkle 4s infinite ease-in-out'
      }} />
      <style>{`
        @keyframes simpleTwinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default Stars;