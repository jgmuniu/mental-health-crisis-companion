import React from 'react';

// ── Offline banner — shown at top of chat when connection is lost ──────────
export const OfflineBanner = ({ isOffline, justReconnected, queueCount }) => {
  if (!isOffline && !justReconnected) return null;

  if (justReconnected) return (
    <div style={{
      padding: '10px 20px',
      background: 'rgba(122,204,160,0.12)',
      borderBottom: '1px solid rgba(122,204,160,0.3)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'bannerIn 0.3s ease',
      flexShrink: 0
    }}>
      <style>{`@keyframes bannerIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <span style={{ fontSize: 16 }}>✅</span>
      <p style={{ margin: 0, fontSize: 13, color: '#7ACCA0' }}>
        Back online! {queueCount > 0 ? `${queueCount} queued message${queueCount > 1 ? 's' : ''} will be sent.` : 'Full responses restored.'}
      </p>
    </div>
  );

  return (
    <div style={{
      padding: '10px 20px',
      background: 'rgba(212,160,23,0.1)',
      borderBottom: '1px solid rgba(212,160,23,0.3)',
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0
    }}>
      <span style={{ fontSize: 16 }}>📡</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#D4A017', fontWeight: 500 }}>
          You're offline
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#A07A10' }}>
          Rafiki will respond with pre-written support messages. Crisis lines still work.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a href="tel:0800723253" style={{
          padding: '5px 12px', background: 'rgba(220,80,80,0.15)',
          border: '1px solid rgba(220,80,80,0.3)', borderRadius: 8,
          color: '#E05555', textDecoration: 'none', fontSize: 11, fontWeight: 600
        }}>📞 0800 723 253</a>
      </div>
    </div>
  );
};

// ── Full offline page — shown when navigating to pages that need internet ──
export const OfflinePage = ({ onRetry }) => (
  <div style={{
    minHeight: '100vh', background: '#0D1B2A',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, color: '#E8EDF5'
  }}>
    <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>📡</div>
      <h1 style={{ fontSize: 24, margin: '0 0 12px', fontWeight: 400, color: '#E8EDF5' }}>
        You're offline
      </h1>
      <p style={{ fontSize: 14, color: '#7A9BB5', margin: '0 0 28px', lineHeight: 1.7 }}>
        This page needs an internet connection. But several features still work offline —
        your journal, mood tracker, safety plan, breathing exercises, and check-ins are all available.
      </p>

      {/* What still works */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 20px', marginBottom: 24, textAlign: 'left'
      }}>
        <p style={{ fontSize: 12, color: '#4A8FA8', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Available offline
        </p>
        {[
          { emoji: '💬', label: 'Chat — basic support responses', path: '/chat' },
          { emoji: '📓', label: 'Journal', path: '/journal' },
          { emoji: '🌡', label: 'Mood tracker (Dashboard)', path: '/dashboard' },
          { emoji: '🛡', label: 'Safety Plan', path: '/safety-plan' },
          { emoji: '🌬', label: 'Breathing exercises', path: '/breathing' },
          { emoji: '✅', label: 'Daily Check-in', path: '/checkin' },
        ].map(({ emoji, label, path }) => (
          <a key={path} href={path} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            textDecoration: 'none', color: '#A5C8D8', fontSize: 13
          }}>
            <span>{emoji}</span> {label}
            <span style={{ marginLeft: 'auto', color: '#4A6A8A', fontSize: 12 }}>→</span>
          </a>
        ))}
      </div>

      {/* Crisis lines — always accessible */}
      <div style={{
        background: 'rgba(220,80,80,0.08)', borderRadius: 12,
        border: '1px solid rgba(220,80,80,0.25)',
        padding: '14px 18px', marginBottom: 20
      }}>
        <p style={{ fontSize: 12, color: '#E05555', margin: '0 0 10px', fontWeight: 500 }}>
          🚨 Crisis lines work without internet
        </p>
        {[
          { name: 'EMKF', tel: '0800723253', display: '0800 723 253' },
          { name: 'Niskize', tel: '0900620800', display: '0900 620 800' },
          { name: 'Befrienders', tel: '+254722178177', display: '+254 722 178 177' },
        ].map(({ name, tel, display }) => (
          <a key={tel} href={`tel:${tel}`} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '6px 0', textDecoration: 'none',
            borderBottom: '1px solid rgba(220,80,80,0.1)'
          }}>
            <span style={{ fontSize: 13, color: '#E8EDF5' }}>{name}</span>
            <span style={{ fontSize: 13, color: '#E05555', fontWeight: 600 }}>{display}</span>
          </a>
        ))}
      </div>

      <button onClick={onRetry} style={{
        padding: '12px 28px', background: '#4A8FA8', border: 'none',
        borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
      }}>↻ Try Again</button>
    </div>
  </div>
);

export default OfflineBanner;