import React, { useState } from 'react';

const ACCENT = '#4A8FA8';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';

const TAG_COLORS = [
  ['#4A8FA8', '#4A8FA820'],
  ['#7ACCA0', '#7ACCA020'],
  ['#D4A017', '#D4A01720'],
  ['#A5C8D8', '#A5C8D820'],
  ['#E07A55', '#E07A5520'],
];

export const SessionSummary = ({ summary, loading, onFollowUp, onClose, onNewSession }) => {
  const [usedQuestions, setUsedQuestions] = useState([]);

  const handleFollowUp = (question) => {
    setUsedQuestions(prev => [...prev, question]);
    onFollowUp(question);
    onClose(); // collapse summary after picking a follow-up
  };

  if (loading) return (
    <div style={{
      margin: '16px 20px', padding: '20px 24px',
      background: CARD, borderRadius: 16, border: BORDER,
      display: 'flex', alignItems: 'center', gap: 14
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: ACCENT,
            animation: 'summaryBounce 1s infinite ease-in-out',
            animationDelay: `${i * 0.2}s`
          }} />
        ))}
      </div>
      <span style={{ fontSize: 14, color: '#7A9BB5' }}>Generating session summary…</span>
      <style>{`@keyframes summaryBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );

  if (!summary) return null;

  return (
    <div style={{
      margin: '16px 20px 8px',
      background: 'rgba(74,143,168,0.08)',
      borderRadius: 16,
      border: `1px solid ${ACCENT}30`,
      overflow: 'hidden',
      animation: 'summarySlideIn 0.4s ease'
    }}>
      <style>{`
        @keyframes summarySlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '14px 18px',
        background: `${ACCENT}15`,
        borderBottom: `1px solid ${ACCENT}20`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🪞</span>
          <span style={{ fontSize: 14, color: '#E8EDF5', fontWeight: 500 }}>Session Summary</span>
        </div>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none',
          color: '#4A6A8A', cursor: 'pointer', fontSize: 16, padding: '2px 6px'
        }}>✕</button>
      </div>

      <div style={{ padding: '16px 18px' }}>

        {/* Affirmation */}
        <div style={{
          padding: '10px 14px', marginBottom: 14,
          background: 'rgba(122,204,160,0.08)',
          border: '1px solid rgba(122,204,160,0.2)',
          borderRadius: 10
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#7ACCA0', lineHeight: 1.6, fontStyle: 'italic' }}>
            💙 {summary.affirmation}
          </p>
        </div>

        {/* Summary text */}
        <p style={{ fontSize: 13, color: '#C0CDD8', lineHeight: 1.7, margin: '0 0 12px' }}>
          {summary.summary}
        </p>

        {/* Progress note */}
        {summary.progress && (
          <p style={{ fontSize: 12, color: '#7ACCA0', margin: '0 0 14px', lineHeight: 1.6 }}>
            ✨ {summary.progress}
          </p>
        )}

        {/* Themes */}
        {summary.themes?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {summary.themes.map((theme, i) => {
              const [text, bg] = TAG_COLORS[i % TAG_COLORS.length];
              return (
                <span key={theme} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  background: bg, color: text, border: `1px solid ${text}40`
                }}>#{theme}</span>
              );
            })}
          </div>
        )}

        {/* Follow-up questions */}
        {summary.followUps?.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: '#4A6A8A', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Continue exploring
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {summary.followUps.map((q, i) => {
                const used = usedQuestions.includes(q);
                return (
                  <button key={i} onClick={() => !used && handleFollowUp(q)} style={{
                    padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                    background: used ? 'rgba(255,255,255,0.02)' : CARD,
                    border: used ? '1px solid rgba(255,255,255,0.06)' : BORDER,
                    color: used ? '#4A6A8A' : '#D0D8E4',
                    cursor: used ? 'default' : 'pointer',
                    fontSize: 13, lineHeight: 1.5,
                    transition: 'all 0.15s',
                    opacity: used ? 0.5 : 1
                  }}
                    onMouseEnter={e => { if (!used) e.currentTarget.style.borderColor = `${ACCENT}60`; }}
                    onMouseLeave={e => { if (!used) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  >
                    <span style={{ color: ACCENT, marginRight: 8, fontSize: 12 }}>→</span>
                    {q}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onNewSession} style={{
            flex: 1, padding: '9px', borderRadius: 8, background: ACCENT,
            border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500
          }}>+ New Session</button>
          <button onClick={onClose} style={{
            padding: '9px 16px', borderRadius: 8, background: CARD,
            border: BORDER, color: '#7A9BB5', cursor: 'pointer', fontSize: 13
          }}>Continue Chat</button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;