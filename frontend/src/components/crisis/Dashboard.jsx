import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getSessions, getSession, deleteSession } from '../../services/sessionService';
import { ShareSession } from '../chat/ShareSession';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';

const MOODS = [
  { value: 5, emoji: '😄', label: 'Great',      color: '#7ACCA0' },
  { value: 4, emoji: '😊', label: 'Good',       color: '#A5C8D8' },
  { value: 3, emoji: '😐', label: 'Okay',       color: '#D4A017' },
  { value: 2, emoji: '😔', label: 'Low',        color: '#E07A55' },
  { value: 1, emoji: '😢', label: 'Struggling', color: '#E05555' },
];

const MOOD_STORAGE_KEY = 'safeguide_mood_log';
const loadMoodLog = () => { try { return JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || '[]'); } catch { return []; } };
const saveMoodLog = (log) => localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(log));

// ── Mood bar chart ────────────────────────────────────────────────────────
const MoodChart = ({ entries }) => {
  if (!entries.length) return null;
  const recent = entries.slice(-14);
  const BAR_W = 28, CHART_H = 100;
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minWidth: recent.length * (BAR_W + 6), height: CHART_H + 32 }}>
        {recent.map((entry, i) => {
          const mood = MOODS.find(m => m.value === entry.value) || MOODS[2];
          const barH = Math.max(4, Math.round((entry.value / 5) * CHART_H));
          const label = new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: BAR_W }}>
              <span style={{ fontSize: 9, color: '#4A6A8A' }}>{mood.emoji}</span>
              <div title={`${mood.label} — ${label}`} style={{
                width: BAR_W, height: barH,
                background: `linear-gradient(to top, ${mood.color}CC, ${mood.color}66)`,
                borderRadius: '4px 4px 0 0', border: `1px solid ${mood.color}40`,
                transition: 'height 0.3s ease', cursor: 'default'
              }} />
              <span style={{ fontSize: 9, color: '#4A6A8A', whiteSpace: 'nowrap', transform: 'rotate(-30deg)', transformOrigin: 'top center', marginTop: 4 }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Mood sparkline ────────────────────────────────────────────────────────
const MoodSparkline = ({ entries }) => {
  if (entries.length < 2) return null;
  const recent = entries.slice(-14);
  const W = 200, H = 40, pad = 4;
  const xs = recent.map((_, i) => pad + (i / (recent.length - 1)) * (W - pad * 2));
  const ys = recent.map(e => H - pad - ((e.value - 1) / 4) * (H - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4A8FA8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7ACCA0" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#sparkGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {recent.map((e, i) => {
        const mood = MOODS.find(m => m.value === e.value) || MOODS[2];
        return <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill={mood.color} />;
      })}
    </svg>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [shareSession, setShareSession] = useState(null); // { messages, session_id }

  const [moodLog, setMoodLog] = useState(loadMoodLog);
  const [loggedToday, setLoggedToday] = useState(false);
  const [moodSection, setMoodSection] = useState(true);

  useEffect(() => {
    const today = new Date().toDateString();
    setLoggedToday(moodLog.some(e => new Date(e.timestamp).toDateString() === today));
  }, [moodLog]);

  useEffect(() => {
    if (user?.isAnonymous) { setLoading(false); return; }
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessions();
      setSessions(data.sessions || []);
    } catch { setError('Could not load sessions. Make sure you are signed in.'); }
    finally { setLoading(false); }
  };

  const openSession = async (session) => {
    if (selectedSession?.session_id === session.session_id) {
      setSelectedSession(null); setSessionMessages([]); return;
    }
    setSelectedSession(session);
    setLoadingMessages(true);
    try {
      const data = await getSession(session.session_id);
      setSessionMessages(data.session?.messages || []);
    } catch { setSessionMessages([]); }
    finally { setLoadingMessages(false); }
  };

  const handleDelete = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      if (selectedSession?.session_id === sessionId) { setSelectedSession(null); setSessionMessages([]); }
      setDeleteConfirm(null);
    } catch { setError('Could not delete session.'); }
  };

  const logMood = (moodValue) => {
    const updated = [...moodLog, { value: moodValue, timestamp: new Date().toISOString() }];
    setMoodLog(updated); saveMoodLog(updated);
  };
  const clearMoodLog = () => { setMoodLog([]); saveMoodLog([]); };

  const avgMood = moodLog.length ? (moodLog.reduce((s, e) => s + e.value, 0) / moodLog.length).toFixed(1) : null;
  const latestMood = moodLog.length ? MOODS.find(m => m.value === moodLog[moodLog.length - 1].value) : null;
  const weekEntries = moodLog.filter(e => Date.now() - new Date(e.timestamp) < 7 * 86400000);
  const weekAvg = weekEntries.length ? (weekEntries.reduce((s, e) => s + e.value, 0) / weekEntries.length).toFixed(1) : null;

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const riskColor = (l) => l >= 3 ? '#E05555' : l >= 2 ? '#D4A017' : l >= 1 ? '#A5C8D8' : '#4A6A8A';
  const riskLabel = (l) => l >= 3 ? 'Crisis' : l >= 2 ? 'High' : l >= 1 ? 'Elevated' : 'Low';

  const totalMessages = sessions.reduce((sum, s) => sum + (s.message_count || 0), 0);
  const crisisCount = sessions.filter(s => s.risk_level >= 3).length;

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{ background: CARD, borderRadius: 16, border: BORDER, padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <h3 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 4px', color: color || '#E8EDF5' }}>{value}</h3>
      <p style={{ fontSize: 12, color: '#7A9BB5', margin: 0 }}>{title}</p>
    </div>
  );

  const ActionBtn = ({ label, onClick }) => (
    <button onClick={onClick} style={{
      padding: '14px', background: CARD, border: BORDER, borderRadius: 12,
      color: '#E8EDF5', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s', width: '100%'
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(165,200,216,0.1)'; e.currentTarget.style.borderColor = 'rgba(165,200,216,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = CARD; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
    >{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 48px' }}>

        {/* Header */}
        <button onClick={() => navigate('/chat')} style={{
          background: 'transparent', border: 'none', color: '#7A9BB5', fontSize: 14, cursor: 'pointer', marginBottom: 20
        }}>← Back to Chat</button>
        <h1 style={{
          fontSize: 30, margin: '0 0 6px',
          background: 'linear-gradient(135deg, #E8EDF5, #A5C8D8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>Your Dashboard</h1>
        <p style={{ fontSize: 14, color: '#7A9BB5', marginBottom: 32 }}>
          Welcome back, {user?.username || user?.name || 'User'}!
        </p>

        {/* Anonymous notice */}
        {user?.isAnonymous && (
          <div style={{ padding: '20px 24px', background: CARD, border: BORDER, borderRadius: 14, marginBottom: 32, textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px', color: '#E8EDF5', fontSize: 15 }}>🔒 You're in anonymous mode — sessions are not saved.</p>
            <p style={{ margin: '0 0 16px', color: '#7A9BB5', fontSize: 13 }}>Create a free account to save your chat history.</p>
            <button onClick={() => navigate('/register')} style={{ padding: '10px 24px', background: ACCENT, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}>Create Account</button>
          </div>
        )}

        {/* ── MOOD TRACKER ─────────────────────────────────────────────── */}
        <div style={{ background: CARD, borderRadius: 16, border: BORDER, marginBottom: 28, overflow: 'hidden' }}>
          <button onClick={() => setMoodSection(v => !v)} style={{
            width: '100%', background: 'transparent', border: 'none',
            padding: '18px 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer', color: '#E8EDF5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🌡</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#E8EDF5' }}>Mood Tracker</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7A9BB5' }}>
                  {moodLog.length === 0 ? 'No entries yet' : `${moodLog.length} entries · avg ${avgMood}/5`}
                </p>
              </div>
              {latestMood && <span style={{ fontSize: 20, marginLeft: 8 }}>{latestMood.emoji}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {moodLog.length >= 2 && <MoodSparkline entries={moodLog} />}
              <span style={{ color: '#4A6A8A', fontSize: 13, transform: moodSection ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>▼</span>
            </div>
          </button>

          <div style={{ maxHeight: moodSection ? '600px' : '0', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
            <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ marginTop: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: '#A5C8D8', margin: '0 0 12px', fontWeight: 500 }}>
                  {loggedToday ? '✓ Mood logged today — update it?' : 'How are you feeling today?'}
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {MOODS.map(mood => (
                    <button key={mood.value} onClick={() => logMood(mood.value)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                      background: latestMood?.value === mood.value && loggedToday ? `${mood.color}25` : 'rgba(255,255,255,0.04)',
                      border: latestMood?.value === mood.value && loggedToday ? `1px solid ${mood.color}80` : '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.15s'
                    }}>
                      <span style={{ fontSize: 24 }}>{mood.emoji}</span>
                      <span style={{ fontSize: 11, color: mood.color }}>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {moodLog.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'All-time avg', value: avgMood },
                    weekAvg ? { label: 'This week', value: weekAvg } : null,
                    { label: 'Total entries', value: moodLog.length },
                  ].filter(Boolean).map(({ label, value }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: BORDER, padding: '14px', textAlign: 'center' }}>
                      <p style={{ fontSize: 22, margin: '0 0 4px', color: '#E8EDF5', fontWeight: 600 }}>{value}</p>
                      <p style={{ fontSize: 11, color: '#7A9BB5', margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {moodLog.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: '#7A9BB5', margin: '0 0 12px' }}>Last {Math.min(moodLog.length, 14)} entries</p>
                  <MoodChart entries={moodLog} />
                </div>
              )}

              {moodLog.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, color: '#7A9BB5', margin: 0 }}>Recent entries</p>
                    <button onClick={clearMoodLog} style={{
                      background: 'transparent', border: '1px solid rgba(220,80,80,0.3)',
                      borderRadius: 6, color: '#E05555', cursor: 'pointer', fontSize: 11, padding: '3px 10px'
                    }}>Clear all</button>
                  </div>
                  <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                    {[...moodLog].reverse().slice(0, 10).map((entry, i) => {
                      const mood = MOODS.find(m => m.value === entry.value) || MOODS[2];
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 18 }}>{mood.emoji}</span>
                          <span style={{ fontSize: 13, color: mood.color, flex: 1 }}>{mood.label}</span>
                          <span style={{ fontSize: 11, color: '#4A6A8A' }}>
                            {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {' · '}
                            {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {moodLog.length === 0 && (
                <p style={{ fontSize: 13, color: '#4A6A8A', textAlign: 'center', padding: '16px 0 0' }}>
                  Log your mood daily to see trends over time.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── SESSION STATS ─────────────────────────────────────────────── */}
        {!user?.isAnonymous && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard title="Total Sessions" value={sessions.length} icon="💬" />
            <StatCard title="Total Messages" value={totalMessages} icon="✉️" />
            <StatCard title="Crisis Sessions" value={crisisCount} icon="🚨" color="#E05555" />
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.12)', border: '1px solid rgba(220,80,80,0.3)', borderRadius: 10, color: '#E05555', fontSize: 13, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* ── SESSIONS LIST ─────────────────────────────────────────────── */}
        {!user?.isAnonymous && (
          <div style={{ background: CARD, borderRadius: 16, border: BORDER, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, margin: 0, color: '#E8EDF5' }}>Saved Sessions</h2>
              <button onClick={() => navigate('/chat')} style={{
                padding: '8px 18px', background: ACCENT, border: 'none',
                borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer'
              }}>+ New Chat</button>
            </div>

            {loading && <p style={{ color: '#7A9BB5', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Loading sessions...</p>}

            {!loading && sessions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ color: '#7A9BB5', fontSize: 14, margin: '0 0 16px' }}>No saved sessions yet. Start a conversation!</p>
                <button onClick={() => navigate('/chat')} style={{ padding: '10px 24px', background: ACCENT, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}>Start Chatting</button>
              </div>
            )}

            {sessions.map(session => (
              <div key={session.session_id}>
                {/* Session row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer'
                }} onClick={() => openSession(session)}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'radial-gradient(circle at 35% 35%, #A5C8D8, #4A6A8A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                  }}>💬</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ color: '#E8EDF5', fontSize: 14 }}>Session {session.session_id?.slice(-6)}</span>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                        background: riskColor(session.risk_level) + '20',
                        color: riskColor(session.risk_level),
                        border: `1px solid ${riskColor(session.risk_level)}40`
                      }}>{riskLabel(session.risk_level)}</span>
                    </div>
                    <span style={{ color: '#4A6A8A', fontSize: 12 }}>
                      {session.message_count || 0} messages · {formatDate(session.last_message_at || session.created_at)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: '#7A9BB5', fontSize: 13, transform: selectedSession?.session_id === session.session_id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    <button onClick={e => { e.stopPropagation(); setDeleteConfirm(session.session_id); }} style={{
                      background: 'transparent', border: '1px solid rgba(220,80,80,0.3)',
                      borderRadius: 6, color: '#E05555', cursor: 'pointer', fontSize: 11, padding: '4px 10px'
                    }}>Delete</button>
                  </div>
                </div>

                {/* Delete confirm */}
                {deleteConfirm === session.session_id && (
                  <div style={{
                    padding: '12px 16px', background: 'rgba(220,80,80,0.08)',
                    border: '1px solid rgba(220,80,80,0.2)', borderRadius: 8, margin: '8px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
                  }}>
                    <span style={{ fontSize: 13, color: '#E8EDF5' }}>Delete this session permanently?</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleDelete(session.session_id)} style={{ padding: '6px 14px', background: '#E05555', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer' }}>Yes, delete</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ padding: '6px 14px', background: CARD, border: BORDER, borderRadius: 6, color: '#E8EDF5', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Expanded messages */}
                {selectedSession?.session_id === session.session_id && (
                  <div style={{ margin: '8px 0 12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', maxHeight: 420, overflowY: 'auto' }}>
                    {loadingMessages && <p style={{ color: '#7A9BB5', fontSize: 13, textAlign: 'center' }}>Loading messages...</p>}
                    {!loadingMessages && sessionMessages.length === 0 && <p style={{ color: '#7A9BB5', fontSize: 13, textAlign: 'center' }}>No messages found.</p>}

                    {/* Share button — shown when messages are loaded */}
                    {!loadingMessages && sessionMessages.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                        <button
                          onClick={() => setShareSession({ messages: sessionMessages, session_id: session.session_id })}
                          style={{
                            padding: '6px 14px', background: 'rgba(74,143,168,0.1)',
                            border: '1px solid rgba(74,143,168,0.3)', borderRadius: 8,
                            color: '#A5C8D8', cursor: 'pointer', fontSize: 12,
                            display: 'flex', alignItems: 'center', gap: 6
                          }}
                        >📤 Share session</button>
                      </div>
                    )}

                    {sessionMessages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                          background: msg.role === 'user' ? '#4A8FA820' : 'rgba(255,255,255,0.05)',
                          border: msg.role === 'user' ? '1px solid #4A8FA840' : '1px solid rgba(255,255,255,0.08)',
                          fontSize: 13, color: '#E8EDF5', lineHeight: 1.5
                        }}>
                          <p style={{ margin: '0 0 4px' }}>{msg.content}</p>
                          {msg.timestamp && (
                            <span style={{ fontSize: 10, color: '#4A6A8A' }}>
                              {new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <ActionBtn label="💬 New Chat"    onClick={() => navigate('/chat')} />
          <ActionBtn label="📚 Resources"   onClick={() => navigate('/resources')} />
          <ActionBtn label="🗺️ Find Help"   onClick={() => navigate('/map')} />
          <ActionBtn label="🌬 Breathe"     onClick={() => navigate('/breathing')} />
          <ActionBtn label="🛡 Safety Plan" onClick={() => navigate('/safety-plan')} />
          <ActionBtn label="📓 Journal"     onClick={() => navigate('/journal')} />
          <ActionBtn label="🔔 Reminders"   onClick={() => navigate('/notifications')} />
          <ActionBtn label="👥 Contacts" onClick={() => navigate('/trusted-contacts')} />
          <ActionBtn label="✅ Check-in" onClick={() => navigate('/checkin')} />
        </div>
      </div>

      {/* Share modal — rendered outside the scroll container */}
      {shareSession && (
        <ShareSession
          messages={shareSession.messages}
          sessionId={shareSession.session_id}
          onClose={() => setShareSession(null)}
          trigger="modal"
        />
      )}
    </div>
  );
};

export default Dashboard;