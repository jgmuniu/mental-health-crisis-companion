import React, { useState } from 'react';

const ACCENT = '#4A8FA8';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';

// ── Format helpers ────────────────────────────────────────────────────────
const formatTimestamp = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const buildSummaryText = (messages, sessionId) => {
  const userMessages = messages.filter(m => m.role === 'user');
  const date = formatTimestamp(messages[0]?.timestamp || new Date().toISOString());
  const lines = [
    `🧭 SafeGuide Session Summary`,
    `Date: ${date}`,
    `Session: ${sessionId?.slice(-6) || 'N/A'}`,
    `Messages exchanged: ${messages.length}`,
    '',
    '--- Key things I shared ---',
    ...userMessages.slice(0, 5).map((m, i) => `${i + 1}. ${m.content.slice(0, 120)}${m.content.length > 120 ? '…' : ''}`),
    '',
    '--- Resources ---',
    '📞 EMKF Crisis Hotline: 0800 723 253 (free)',
    '📞 Niskize: 0900 620 800',
    '📞 Befrienders Kenya: +254 722 178 177',
    '',
    'Shared from SafeGuide mental health companion.',
  ];
  return lines.join('\n');
};

const buildFullTranscript = (messages, sessionId) => {
  const date = formatTimestamp(messages[0]?.timestamp || new Date().toISOString());
  const lines = [
    `🧭 SafeGuide — Full Session Transcript`,
    `Date: ${date} | Session: ${sessionId?.slice(-6) || 'N/A'}`,
    '─'.repeat(40),
    '',
    ...messages.map(m => {
      const who = m.role === 'user' ? '👤 You' : '🤝 Rafiki';
      const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
      return `${who} ${time ? `[${time}]` : ''}\n${m.content}\n`;
    }),
    '─'.repeat(40),
    'Crisis lines: EMKF 0800 723 253 | Niskize 0900 620 800 | Befrienders +254 722 178 177',
    'Shared from SafeGuide.',
  ];
  return lines.join('\n');
};

// ── Share methods ─────────────────────────────────────────────────────────
const shareViaWhatsApp = (text) => {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
};

const shareViaEmail = (text, sessionId) => {
  const subject = encodeURIComponent(`SafeGuide Session — ${new Date().toLocaleDateString()}`);
  const body = encodeURIComponent(text);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};

const shareNative = async (text, sessionId) => {
  if (!navigator.share) return false;
  try {
    await navigator.share({
      title: 'SafeGuide Session',
      text,
    });
    return true;
  } catch { return false; }
};

// ── ShareSession panel ────────────────────────────────────────────────────
export const ShareSession = ({ messages, sessionId, onClose, trigger = 'button' }) => {
  const [mode, setMode] = useState('summary');   // 'summary' | 'full'
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const text = mode === 'summary'
    ? buildSummaryText(messages, sessionId)
    : buildFullTranscript(messages, sessionId);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNative = async () => {
    const ok = await shareNative(text, sessionId);
    if (!ok) handleCopy(); // fallback to copy if native share not available
  };

  const canNativeShare = !!navigator.share;
  const userMsgCount = messages.filter(m => m.role === 'user').length;

  if (userMsgCount < 1) return null;

  // Inline button trigger (used in chat footer)
  if (trigger === 'inline' && !open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        background: 'transparent', border: 'none',
        color: '#A5C8D8', cursor: 'pointer',
        fontSize: 10, textDecoration: 'underline', padding: 0
      }}>
        📤 Share session
      </button>
    );
  }

  // Full panel (used from dashboard or after inline trigger)
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.2s ease'
    }} onClick={(e) => { if (e.target === e.currentTarget) { setOpen(false); onClose?.(); } }}>
      <style>{`@keyframes fadeIn { from{opacity:0} to{opacity:1} }`}</style>

      <div style={{
        width: '100%', maxWidth: 480,
        background: '#111927',
        borderRadius: 20, border: BORDER,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.25s ease'
      }}>
        <style>{`@keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }`}</style>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: BORDER,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📤</span>
            <h3 style={{ margin: 0, fontSize: 16, color: '#E8EDF5', fontWeight: 500 }}>Share Session</h3>
          </div>
          <button onClick={() => { setOpen(false); onClose?.(); }} style={{
            background: 'transparent', border: 'none', color: '#4A6A8A',
            cursor: 'pointer', fontSize: 18, lineHeight: 1
          }}>✕</button>
        </div>

        <div style={{ padding: '18px 20px' }}>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { id: 'summary', label: '📋 Summary', hint: 'Key points only' },
              { id: 'full', label: '📄 Full transcript', hint: 'All messages' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setMode(opt.id)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                background: mode === opt.id ? `${ACCENT}25` : CARD,
                border: mode === opt.id ? `1px solid ${ACCENT}60` : BORDER,
                color: mode === opt.id ? '#E8EDF5' : '#7A9BB5',
                fontSize: 13, transition: 'all 0.15s'
              }}>
                <div>{opt.label}</div>
                <div style={{ fontSize: 10, color: '#4A6A8A', marginTop: 2 }}>{opt.hint}</div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{
            padding: '12px 14px', marginBottom: 16,
            background: 'rgba(255,255,255,0.03)',
            border: BORDER, borderRadius: 10,
            maxHeight: 160, overflowY: 'auto',
            fontSize: 12, color: '#7A9BB5', lineHeight: 1.6,
            fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
          }}>
            {text.slice(0, 500)}{text.length > 500 ? '\n…(truncated in preview)' : ''}
          </div>

          {/* Privacy notice */}
          <div style={{
            padding: '8px 12px', marginBottom: 16,
            background: 'rgba(212,160,23,0.08)',
            border: '1px solid rgba(212,160,23,0.25)',
            borderRadius: 8, fontSize: 11, color: '#D4A017', lineHeight: 1.5
          }}>
            ⚠️ You are sharing personal information. Only share with people you trust.
            This session may contain sensitive details about your mental health.
          </div>

          {/* Share buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* WhatsApp */}
            <button onClick={() => shareViaWhatsApp(text)} style={{
              padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(37,211,102,0.1)',
              border: '1px solid rgba(37,211,102,0.3)',
              color: '#25D366', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}
            >
              <span style={{ fontSize: 20 }}>💬</span>
              Share via WhatsApp
            </button>

            {/* Email */}
            <button onClick={() => shareViaEmail(text, sessionId)} style={{
              padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(74,143,168,0.1)',
              border: `1px solid ${ACCENT}40`,
              color: '#A5C8D8', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = `rgba(74,143,168,0.18)`}
              onMouseLeave={e => e.currentTarget.style.background = `rgba(74,143,168,0.1)`}
            >
              <span style={{ fontSize: 20 }}>✉️</span>
              Share via Email
            </button>

            {/* Native share (mobile) */}
            {canNativeShare && (
              <button onClick={handleNative} style={{
                padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                background: CARD, border: BORDER,
                color: '#E8EDF5', fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span style={{ fontSize: 20 }}>📲</span>
                Share via…
              </button>
            )}

            {/* Copy */}
            <button onClick={handleCopy} style={{
              padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
              background: copied ? 'rgba(122,204,160,0.1)' : CARD,
              border: copied ? '1px solid rgba(122,204,160,0.4)' : BORDER,
              color: copied ? '#7ACCA0' : '#7A9BB5', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.2s'
            }}>
              <span style={{ fontSize: 20 }}>{copied ? '✓' : '📋'}</span>
              {copied ? 'Copied to clipboard!' : 'Copy to clipboard'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

// ── Compact share button for chat footer ──────────────────────────────────
export const ShareButton = ({ messages, sessionId }) => {
  const [open, setOpen] = useState(false);
  const userMsgCount = messages.filter(m => m.role === 'user').length;
  if (userMsgCount < 1) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        background: 'transparent', border: 'none',
        color: '#A5C8D8', cursor: 'pointer',
        fontSize: 10, textDecoration: 'underline', padding: 0
      }}>
        📤 Share
      </button>
      {open && (
        <ShareSession
          messages={messages}
          sessionId={sessionId}
          onClose={() => setOpen(false)}
          trigger="modal"
        />
      )}
    </>
  );
};

export default ShareSession;