import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { exportSessions, getSessions, deleteSession } from '../../services/sessionService';
import { useSettings, BG_COLORS } from '../../hooks/useSettings';

const PANEL_BG = '#111927';
const CARD = 'rgba(255,255,255,0.05)';
const BORDER = '1px solid rgba(255,255,255,0.1)';
const ACCENT = '#4A8FA8';

// ── Primitives ────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <p style={{ fontSize: 10, color: '#4A6A8A', textTransform: 'uppercase',
    letterSpacing: '0.1em', margin: '24px 0 10px', fontWeight: 600 }}>
    {children}
  </p>
);

const Row = ({ label, hint, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 14, color: '#E8EDF5' }}>{label}</p>
      {hint && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4A6A8A' }}>{hint}</p>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
    background: value ? ACCENT : 'rgba(255,255,255,0.1)',
    position: 'relative', flexShrink: 0, transition: 'background 0.2s'
  }}>
    <span style={{
      position: 'absolute', top: 3, left: value ? 23 : 3,
      width: 18, height: 18, borderRadius: '50%', background: '#fff',
      transition: 'left 0.2s', display: 'block'
    }} />
  </button>
);

const Chips = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)} style={{
        padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
        border: value === o.value ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
        background: value === o.value ? `${ACCENT}30` : 'rgba(255,255,255,0.04)',
        color: value === o.value ? '#E8EDF5' : '#7A9BB5', transition: 'all 0.15s'
      }}>{o.label}</button>
    ))}
  </div>
);

const Slider = ({ value, onChange, min = 0.5, max = 2, step = 0.1, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 150 }}>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ flex: 1, accentColor: ACCENT }} />
    <span style={{ fontSize: 12, color: '#7A9BB5', minWidth: 36, textAlign: 'right' }}>
      {value}{label}
    </span>
  </div>
);

// ── Main Panel ────────────────────────────────────────────────────────────
export const SettingsPanel = ({ open, onClose }) => {
  // Own the settings state directly — no prop dependency
  const { settings, update, reset } = useSettings();
  const { user, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  const [voices, setVoices] = useState([]);
  const [exportDone, setExportDone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');

  const showStatus = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 3000); };

  // Load TTS voices
  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis?.getVoices() || [];
      const lang = settings?.language || 'en';
      setVoices(all.filter(v => v.lang.startsWith(lang)));
    };
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, [settings?.language]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleExport = async () => {
    try {
      const data = await exportSessions();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safeguide-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch { showStatus('Export failed. Please try again.'); }
  };

  const handleDeleteAll = async () => {
    try {
      const result = await getSessions();
      const sessions = result.sessions || [];
      await Promise.all(sessions.map(s => deleteSession(s.session_id)));
      showStatus('All sessions deleted.');
      setDeleteConfirm(false);
    } catch { showStatus('Could not delete sessions.'); }
  };

  const handlePasswordChange = async () => {
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Passwords do not match.'); return; }
    if (pwForm.next.length < 8) { setPwMsg('Min. 8 characters required.'); return; }
    if (!pwForm.current.trim()) { setPwMsg('Current password is required.'); return; }
    const result = await changePassword(pwForm.current, pwForm.next);
    setPwMsg(result.success ? 'Password updated successfully.' : result.error);
    if (result.success) setPwForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwMsg(''), 4000);
  };

  const handleLogout = () => { logout(); navigate('/'); onClose(); };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#E8EDF5', outline: 'none', boxSizing: 'border-box', marginBottom: 8
  };

  // Guard — if settings somehow not ready yet
  if (!settings) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 98,
        background: 'rgba(0,0,0,0.45)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.25s'
      }} />

      {/* Panel */}
      <div ref={panelRef} style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 360, maxWidth: '92vw',
        background: PANEL_BG,
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        zIndex: 99,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, color: '#E8EDF5', fontWeight: 600 }}>Settings</h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4A6A8A' }}>
              {user?.username || user?.name || 'User'}
              {user?.isAnonymous ? ' · Anonymous' : user?.email ? ` · ${user.email}` : ''}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: BORDER,
            background: 'rgba(255,255,255,0.05)', color: '#7A9BB5',
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 32px' }}>

          {/* ── APPEARANCE ── */}
          <SectionTitle>🎨 Appearance</SectionTitle>

          <Row label="Theme">
            <Chips value={settings.theme} onChange={v => update('theme', v)} options={[
              { label: '🌙 Dark', value: 'dark' },
              { label: '☀️ Light', value: 'light' },
              { label: '⚡ Contrast', value: 'highContrast' },
            ]} />
          </Row>

          <Row label="Background">
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(BG_COLORS).map(([key, color]) => (
                <button key={key} onClick={() => update('bgColor', key)} title={key} style={{
                  width: 26, height: 26, borderRadius: '50%', background: color, cursor: 'pointer',
                  border: settings.bgColor === key
                    ? `2px solid ${ACCENT}`
                    : '2px solid rgba(255,255,255,0.15)',
                  flexShrink: 0
                }} />
              ))}
            </div>
          </Row>

          <Row label="Font Size">
            <Chips value={settings.fontSize} onChange={v => update('fontSize', v)} options={[
              { label: 'S', value: 'small' },
              { label: 'M', value: 'medium' },
              { label: 'L', value: 'large' },
            ]} />
          </Row>

          <Row label="Spacing">
            <Chips value={settings.messageSpacing} onChange={v => update('messageSpacing', v)} options={[
              { label: 'Compact', value: 'compact' },
              { label: 'Comfortable', value: 'comfortable' },
            ]} />
          </Row>

          <Row label="Bubble Style">
            <Chips value={settings.bubbleStyle} onChange={v => update('bubbleStyle', v)} options={[
              { label: 'Rounded', value: 'rounded' },
              { label: 'Sharp', value: 'sharp' },
              { label: 'Minimal', value: 'minimal' },
            ]} />
          </Row>

          <Row label="Reduced Motion" hint="Disables all animations">
            <Toggle value={settings.reducedMotion} onChange={v => update('reducedMotion', v)} />
          </Row>

          {/* ── VOICE ── */}
          <SectionTitle>🔊 Voice & Speech</SectionTitle>

          <Row label="Voice Responses">
            <Toggle value={settings.voiceEnabled} onChange={v => update('voiceEnabled', v)} />
          </Row>

          <Row label="Auto-send Voice" hint="Sends when you stop speaking">
            <Toggle value={settings.autoSendVoice} onChange={v => update('autoSendVoice', v)} />
          </Row>

          <Row label="Speech Speed">
            <Slider value={settings.voiceSpeed} onChange={v => update('voiceSpeed', v)}
              min={0.5} max={1.8} step={0.1} label="×" />
          </Row>

          {voices.length > 0 && (
            <Row label="Voice" hint="TTS voice">
              <select value={settings.voiceName} onChange={e => update('voiceName', e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: 8, fontSize: 12,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#E8EDF5', maxWidth: 170, outline: 'none'
                }}>
                <option value="">Auto (warm voice)</option>
                {voices.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </Row>
          )}

          <Row label="Language">
            <Chips value={settings.language} onChange={v => update('language', v)} options={[
              { label: '🇬🇧 EN', value: 'en' },
              { label: '🇪🇸 ES', value: 'es' },
              { label: '🇫🇷 FR', value: 'fr' },
              { label: '🇰🇪 SW', value: 'sw' },
            ]} />
          </Row>

          {/* ── ACCOUNT ── */}
          {!user?.isAnonymous && (
            <>
              <SectionTitle>🔐 Account</SectionTitle>
              <p style={{ fontSize: 13, color: '#7A9BB5', margin: '0 0 10px' }}>Change Password</p>
              <input type="password" placeholder="Current password"
                value={pwForm.current}
                onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                style={inputStyle} />
              <input type="password" placeholder="New password (min. 8 chars)"
                value={pwForm.next}
                onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                style={inputStyle} />
              <input type="password" placeholder="Confirm new password"
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                style={inputStyle} />
              {pwMsg && (
                <p style={{ fontSize: 12, margin: '0 0 8px',
                  color: pwMsg.includes('success') ? '#7ACCA0' : '#E05555' }}>
                  {pwMsg}
                </p>
              )}
              <button onClick={handlePasswordChange} style={{
                width: '100%', padding: '9px', background: ACCENT, border: 'none',
                borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', marginBottom: 4
              }}>Update Password</button>
            </>
          )}

          {/* ── DATA & PRIVACY ── */}
          <SectionTitle>🗂 Data & Privacy</SectionTitle>

          {!user?.isAnonymous && (
            <Row label="Export History" hint="Downloads JSON of all sessions">
              <button onClick={handleExport} style={{
                padding: '7px 16px',
                background: exportDone ? 'rgba(122,204,160,0.1)' : CARD,
                border: exportDone ? '1px solid #7ACCA0' : BORDER,
                borderRadius: 8,
                color: exportDone ? '#7ACCA0' : '#E8EDF5',
                fontSize: 13, cursor: 'pointer'
              }}>
                {exportDone ? '✓ Exported' : '⬇ Export'}
              </button>
            </Row>
          )}

          {!user?.isAnonymous && (
            <Row label="Delete All Sessions" hint="Permanently removes all history">
              {deleteConfirm ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={handleDeleteAll} style={{
                    padding: '6px 14px', background: '#E05555', border: 'none',
                    borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer'
                  }}>Confirm</button>
                  <button onClick={() => setDeleteConfirm(false)} style={{
                    padding: '6px 14px', background: CARD, border: BORDER,
                    borderRadius: 8, color: '#E8EDF5', fontSize: 12, cursor: 'pointer'
                  }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(true)} style={{
                  padding: '7px 16px', background: 'rgba(224,85,85,0.08)',
                  border: '1px solid rgba(224,85,85,0.3)', borderRadius: 8,
                  color: '#E05555', fontSize: 13, cursor: 'pointer'
                }}>🗑 Delete All</button>
              )}
            </Row>
          )}

          {statusMsg && (
            <p style={{ fontSize: 12, color: '#7A9BB5', margin: '10px 0 0' }}>{statusMsg}</p>
          )}

          <Row label="Reset to Defaults">
            <button onClick={reset} style={{
              padding: '7px 16px', background: CARD, border: BORDER,
              borderRadius: 8, color: '#7A9BB5', fontSize: 13, cursor: 'pointer'
            }}>Reset</button>
          </Row>

          {/* ── SESSION ── */}
          <SectionTitle>⎋ Session</SectionTitle>

          <button onClick={handleLogout} style={{
            width: '100%', padding: '12px',
            background: 'rgba(224,85,85,0.08)',
            border: '1px solid rgba(224,85,85,0.25)',
            borderRadius: 10, color: '#E05555',
            fontSize: 14, cursor: 'pointer', marginBottom: 10
          }}>Sign Out</button>

          {user?.isAnonymous && (
            <button onClick={() => { navigate('/register'); onClose(); }} style={{
              width: '100%', padding: '12px',
              background: `${ACCENT}20`, border: `1px solid ${ACCENT}50`,
              borderRadius: 10, color: '#A5C8D8', fontSize: 14, cursor: 'pointer'
            }}>Create Account to Save Progress</button>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;