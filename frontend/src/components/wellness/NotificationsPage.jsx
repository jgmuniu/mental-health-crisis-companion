import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// ── Toggle switch ─────────────────────────────────────────────────────────
const Toggle = ({ value, onChange, disabled }) => (
  <button onClick={() => !disabled && onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12, border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    background: value && !disabled ? ACCENT : 'rgba(255,255,255,0.1)',
    position: 'relative', flexShrink: 0, transition: 'background 0.2s',
    opacity: disabled ? 0.4 : 1
  }}>
    <span style={{
      position: 'absolute', top: 3,
      left: value && !disabled ? 23 : 3,
      width: 18, height: 18, borderRadius: '50%',
      background: '#fff', transition: 'left 0.2s', display: 'block'
    }} />
  </button>
);

// ── Reminder row ──────────────────────────────────────────────────────────
const ReminderRow = ({ label, emoji, hint, config, onChange, disabled, showDay }) => (
  <div style={{
    padding: '14px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    opacity: disabled ? 0.5 : 1
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <p style={{ margin: 0, fontSize: 14, color: '#E8EDF5' }}>{label}</p>
        </div>
        {hint && <p style={{ margin: '3px 0 0 26px', fontSize: 11, color: '#4A6A8A' }}>{hint}</p>}
      </div>
      <Toggle value={config?.enabled || false} onChange={v => onChange({ enabled: v })} disabled={disabled} />
    </div>

    {config?.enabled && !disabled && (
      <div style={{ marginTop: 10, marginLeft: 26, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {showDay && (
          <select
            value={config.day ?? 0}
            onChange={e => onChange({ day: parseInt(e.target.value) })}
            style={{
              padding: '6px 10px', borderRadius: 8, fontSize: 12,
              background: 'rgba(255,255,255,0.07)', border: BORDER,
              color: '#E8EDF5', outline: 'none'
            }}
          >
            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#4A6A8A' }}>at</span>
          <input
            type="time"
            value={config.time || '08:00'}
            onChange={e => onChange({ time: e.target.value })}
            style={{
              padding: '6px 10px', borderRadius: 8, fontSize: 13,
              background: 'rgba(255,255,255,0.07)', border: `1px solid ${ACCENT}40`,
              color: '#E8EDF5', outline: 'none'
            }}
          />
        </div>
      </div>
    )}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    schedule, permission, swReady, error,
    enable, disable, updateReminder,
    sendTestNotification, isSupported
  } = useNotifications();

  const [enabling, setEnabling] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleEnable = async () => {
    setEnabling(true);
    await enable();
    setEnabling(false);
  };

  const handleTest = () => {
    sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const isBlocked = permission === 'denied';
  const isGranted = permission === 'granted';

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 24px 48px' }}>

        {/* Header */}
        <button onClick={() => navigate('/chat')} style={{
          background: 'transparent', border: 'none', color: '#7A9BB5',
          fontSize: 14, cursor: 'pointer', marginBottom: 20
        }}>← Back to Chat</button>

        <h1 style={{
          fontSize: 28, margin: '0 0 6px',
          background: 'linear-gradient(135deg, #E8EDF5, #A5C8D8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>Reminders</h1>
        <p style={{ fontSize: 14, color: '#7A9BB5', marginBottom: 28, lineHeight: 1.6 }}>
          Gentle nudges to check in with yourself throughout the day.
          All reminders are scheduled locally — no data is sent to any server.
        </p>

        {/* Not supported */}
        {!isSupported && (
          <div style={{ padding: '18px 20px', background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.3)', borderRadius: 14, marginBottom: 24 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#E05555' }}>
              ⚠️ Push notifications are not supported in this browser.
              Try Chrome or Edge on Android or desktop.
            </p>
          </div>
        )}

        {/* Blocked */}
        {isBlocked && (
          <div style={{ padding: '18px 20px', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: 14, marginBottom: 24 }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#D4A017', fontWeight: 500 }}>
              🚫 Notifications are blocked
            </p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#7A9BB5', lineHeight: 1.6 }}>
              You've blocked notifications for this site. To enable reminders, open your
              browser settings and allow notifications for this site, then come back here.
            </p>
            <code style={{ fontSize: 11, color: '#4A6A8A', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4 }}>
              Settings → Privacy & Security → Notifications → Allow
            </code>
          </div>
        )}

        {/* SW error */}
        {error && (
          <div style={{ padding: '14px 18px', background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.2)', borderRadius: 12, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#E05555' }}>⚠️ {error}</p>
          </div>
        )}

        {/* Master enable card */}
        <div style={{ background: CARD, borderRadius: 16, border: BORDER, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 16, color: '#E8EDF5', fontWeight: 500 }}>
                🔔 Enable Reminders
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#7A9BB5' }}>
                {schedule.enabled
                  ? `Active · ${Object.values(schedule).filter(v => v?.enabled === true).length - 1} reminders scheduled`
                  : 'All reminders are currently off'}
              </p>
            </div>
            {schedule.enabled ? (
              <button onClick={disable} style={{
                padding: '8px 18px', background: 'rgba(220,80,80,0.1)',
                border: '1px solid rgba(220,80,80,0.3)', borderRadius: 8,
                color: '#E05555', cursor: 'pointer', fontSize: 13
              }}>Turn Off</button>
            ) : (
              <button
                onClick={handleEnable}
                disabled={!isSupported || isBlocked || enabling}
                style={{
                  padding: '8px 20px', background: (!isSupported || isBlocked) ? 'rgba(74,143,168,0.2)' : ACCENT,
                  border: 'none', borderRadius: 8, color: (!isSupported || isBlocked) ? '#4A6A8A' : '#fff',
                  cursor: (!isSupported || isBlocked) ? 'default' : 'pointer',
                  fontSize: 13, fontWeight: 500
                }}
              >
                {enabling ? 'Enabling…' : isGranted ? 'Enable' : 'Allow & Enable'}
              </button>
            )}
          </div>

          {/* Permission status */}
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: BORDER }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Browser permission', value: permission === 'granted' ? '✓ Granted' : permission === 'denied' ? '✗ Blocked' : '? Not asked', color: permission === 'granted' ? '#7ACCA0' : permission === 'denied' ? '#E05555' : '#D4A017' },
                { label: 'Service worker', value: swReady ? '✓ Ready' : '⏳ Loading', color: swReady ? '#7ACCA0' : '#D4A017' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p style={{ margin: '0 0 2px', fontSize: 11, color: '#4A6A8A' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 13, color, fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reminder settings */}
        <div style={{ background: CARD, borderRadius: 16, border: BORDER, padding: '4px 24px 8px', marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#4A6A8A', margin: '16px 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Daily Reminders
          </p>

          <ReminderRow
            label="Morning Check-in" emoji="☀️"
            hint="Opens the chat to start your day"
            config={schedule.morningCheckin}
            onChange={v => updateReminder('morningCheckin', v)}
            disabled={!schedule.enabled}
          />
          <ReminderRow
            label="Evening Mood Log" emoji="🌙"
            hint="Prompts you to log your mood in the dashboard"
            config={schedule.eveningMood}
            onChange={v => updateReminder('eveningMood', v)}
            disabled={!schedule.enabled}
          />
          <ReminderRow
            label="Journal Reminder" emoji="📓"
            hint="A gentle nudge to write in your journal"
            config={schedule.journalReminder}
            onChange={v => updateReminder('journalReminder', v)}
            disabled={!schedule.enabled}
          />
          <ReminderRow
            label="Breathing Break" emoji="🌬"
            hint="Mid-day reminder for a quick breathing exercise"
            config={schedule.breathingBreak}
            onChange={v => updateReminder('breathingBreak', v)}
            disabled={!schedule.enabled}
          />

          <p style={{ fontSize: 12, color: '#4A6A8A', margin: '20px 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Weekly
          </p>

          <ReminderRow
            label="Weekly Reflection" emoji="🪞"
            hint="A once-a-week check-in on your progress"
            config={schedule.weeklyReflection}
            onChange={v => updateReminder('weeklyReflection', v)}
            disabled={!schedule.enabled}
            showDay
          />
        </div>

        {/* Test button */}
        {schedule.enabled && isGranted && (
          <div style={{ background: CARD, borderRadius: 14, border: BORDER, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 14, color: '#E8EDF5' }}>Test Notification</p>
                <p style={{ margin: 0, fontSize: 12, color: '#7A9BB5' }}>Send a test to confirm notifications are working</p>
              </div>
              <button onClick={handleTest} style={{
                padding: '8px 18px',
                background: testSent ? 'rgba(122,204,160,0.15)' : CARD,
                border: testSent ? '1px solid rgba(122,204,160,0.4)' : BORDER,
                borderRadius: 8,
                color: testSent ? '#7ACCA0' : '#E8EDF5',
                cursor: 'pointer', fontSize: 13, transition: 'all 0.2s'
              }}>
                {testSent ? '✓ Sent!' : '🔔 Send Test'}
              </button>
            </div>
          </div>
        )}

        {/* Info footer */}
        <div style={{ padding: '16px 18px', background: CARD, borderRadius: 12, border: BORDER, fontSize: 12, color: '#7A9BB5', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 6px', color: '#A5C8D8', fontWeight: 500 }}>ℹ️ How reminders work</p>
          <p style={{ margin: 0 }}>
            Reminders use your browser's notification system and a local service worker.
            They fire at the times you set, even if the app is closed — as long as your
            browser is running. No data leaves your device. Reminders reset if you clear
            browser data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;