import React, { useEffect } from 'react';
import { COLORS } from '../../constants/colors';

// ── Default export — used in ChatApp ──────────────────────────────────────
export const TypingIndicator = ({
  dotCount = 3,
  dotSize = 8,
  animationSpeed = 1.4,
  bounceHeight = 10,
  showLabel = false,
  label = 'Assistant is typing...',
  variant = 'default',
  reducedMotion = false,
}) => {
  useEffect(() => {
    if (document.getElementById('typing-indicator-styles')) return;
    const style = document.createElement('style');
    style.id = 'typing-indicator-styles';
    style.textContent = `
      @keyframes ti-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-${bounceHeight}px); }
      }
      @keyframes ti-pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.2); opacity: 1; }
      }
      @keyframes ti-fade {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('typing-indicator-styles');
      if (el) el.remove();
    };
  }, [bounceHeight]);

  const animName = reducedMotion ? 'none' : {
    pulse: 'ti-pulse', fade: 'ti-fade', default: 'ti-bounce'
  }[variant] || 'ti-bounce';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
      <div style={{
        display: 'flex', gap: dotSize * 0.75,
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        border: '1px solid rgba(255,255,255,0.08)',
        width: 'fit-content'
      }}>
        {Array.from({ length: dotCount }).map((_, i) => (
          <div key={i} style={{
            width: dotSize, height: dotSize, borderRadius: '50%',
            background: COLORS.accent?.primary || '#4A8FA8',
            animation: animName === 'none' ? 'none' : `${animName} ${animationSpeed}s infinite ease-in-out`,
            animationDelay: `${i * 0.2}s`
          }} />
        ))}
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, color: COLORS.text?.muted || '#7A9BB5', fontStyle: 'italic' }}>
          {label}
        </span>
      )}
    </div>
  );
};

export const MinimalTypingIndicator = () => (
  <div style={{ display: 'flex', gap: 4, padding: '8px 12px', alignItems: 'center' }}>
    <span style={{ fontSize: 12, color: '#7A9BB5', marginRight: 4 }}>Typing</span>
    <div style={{ display: 'flex', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 4, height: 4, borderRadius: '50%', background: '#7A9BB5',
          animation: 'simplePulse 1s infinite', animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
    <style>{`@keyframes simplePulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
  </div>
);

export default TypingIndicator;