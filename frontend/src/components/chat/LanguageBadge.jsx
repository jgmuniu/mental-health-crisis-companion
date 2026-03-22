import React, { useState, useEffect } from 'react';

const FLAGS = { en: '🇬🇧', sw: '🇰🇪' };
const LABELS = { en: 'English', sw: 'Kiswahili' };

// Small badge shown in chat header when language switches
export const LanguageBadge = ({ language, detectedFrom, onForce }) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (detectedFrom && !dismissed) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(t);
    }
  }, [detectedFrom, dismissed]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      zIndex: 20, animation: 'langSlideUp 0.3s ease',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 14px 8px 12px',
      background: 'rgba(17,25,39,0.95)',
      border: '1px solid rgba(74,143,168,0.4)',
      borderRadius: 20,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      fontSize: 13, color: '#E8EDF5',
      whiteSpace: 'nowrap'
    }}>
      <style>{`
        @keyframes langSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <span style={{ fontSize: 16 }}>{FLAGS[language]}</span>
      <span style={{ color: '#A5C8D8' }}>{LABELS[language]} detected</span>

      {/* Quick switch */}
      <button
        onClick={() => { onForce(language === 'en' ? 'sw' : 'en'); setVisible(false); setDismissed(true); }}
        style={{
          padding: '3px 10px', borderRadius: 12, fontSize: 11,
          background: 'rgba(74,143,168,0.2)', border: '1px solid rgba(74,143,168,0.4)',
          color: '#A5C8D8', cursor: 'pointer', marginLeft: 2
        }}
      >
        Switch to {language === 'en' ? '🇰🇪 Kiswahili' : '🇬🇧 English'}
      </button>

      <button
        onClick={() => { setVisible(false); setDismissed(true); }}
        style={{ background: 'transparent', border: 'none', color: '#4A6A8A', cursor: 'pointer', fontSize: 14, padding: '0 2px' }}
      >✕</button>
    </div>
  );
};

// Compact inline indicator for the chat footer
export const LanguageIndicator = ({ language, onForce }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <span style={{ fontSize: 11 }}>{FLAGS[language]}</span>
    <button
      onClick={() => onForce(language === 'en' ? 'sw' : 'en')}
      title={`Switch to ${language === 'en' ? 'Kiswahili' : 'English'}`}
      style={{
        background: 'transparent', border: 'none', padding: 0,
        color: '#4A6A8A', cursor: 'pointer', fontSize: 10,
        textDecoration: 'underline'
      }}
    >
      {LABELS[language]}
    </button>
  </span>
);

export default LanguageBadge;