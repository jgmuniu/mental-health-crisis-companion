import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';

const MOOD_STORAGE_KEY = 'safeguide_mood_log';
const CHECKIN_STORAGE_KEY = 'safeguide_checkins';

const MOODS = [
  { value: 5, emoji: '😄', label: 'Great',       color: '#7ACCA0' },
  { value: 4, emoji: '😊', label: 'Good',        color: '#A5C8D8' },
  { value: 3, emoji: '😐', label: 'Okay',        color: '#D4A017' },
  { value: 2, emoji: '😔', label: 'Low',         color: '#E07A55' },
  { value: 1, emoji: '😢', label: 'Struggling',  color: '#E05555' },
];

// ── Reflection questions by time of day ──────────────────────────────────
const MORNING_QUESTIONS = [
  'What is one thing you are looking forward to today?',
  'How did you sleep, and how does your body feel right now?',
  'What is one small thing you can do for yourself today?',
  'What emotion is showing up most strongly this morning?',
  'Is there anything weighing on you as you start today?',
  'What would make today feel like a good day for you?',
];

const EVENING_QUESTIONS = [
  'What was the hardest part of today, and how did you handle it?',
  'Was there a moment today — even a small one — that felt okay or good?',
  'How do you feel compared to this morning?',
  'What do you need most before you sleep tonight?',
  'Is there anything you are carrying that you would like to put down?',
  'What is one thing you got through today, even if it was difficult?',
];

const ANYTIME_QUESTIONS = [
  'How are you feeling right now, in this moment?',
  'What is your body telling you today?',
  'What emotions have been strongest for you lately?',
  'Is there something you have been avoiding thinking about?',
  'What would feel like relief right now?',
  'Who or what has been a source of comfort recently?',
];

const getQuestion = () => {
  const hour = new Date().getHours();
  const pool = hour < 12 ? MORNING_QUESTIONS : hour < 18 ? ANYTIME_QUESTIONS : EVENING_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤' };
  if (hour < 21) return { text: 'Good evening', emoji: '🌙' };
  return { text: 'Late night check-in', emoji: '🌟' };
};

const loadCheckins = () => {
  try { return JSON.parse(localStorage.getItem(CHECKIN_STORAGE_KEY) || '[]'); }
  catch { return []; }
};

const saveCheckin = (entry) => {
  const existing = loadCheckins();
  localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify([...existing, entry]));
};

const saveMood = (value) => {
  try {
    const log = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || '[]');
    log.push({ value, timestamp: new Date().toISOString() });
    localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(log));
  } catch {}
};

const alreadyCheckedInToday = () => {
  const checkins = loadCheckins();
  const today = new Date().toDateString();
  return checkins.some(c => new Date(c.timestamp).toDateString() === today);
};

// ── Step components ────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }) => (
  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        width: i < current ? 24 : 8, height: 8, borderRadius: 4,
        background: i < current ? ACCENT : i === current ? '#A5C8D8' : 'rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease'
      }} />
    ))}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const DailyCheckIn = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);         // 0=welcome, 1=mood, 2=reflect, 3=done
  const [mood, setMood] = useState(null);
  const [reflection, setReflection] = useState('');
  const [question] = useState(getQuestion);
  const [greeting] = useState(getGreeting);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    setAlreadyDone(alreadyCheckedInToday());
    // Calculate streak
    const checkins = loadCheckins();
    let streak = 0;
    const d = new Date();
    const seen = new Set(checkins.map(c => new Date(c.timestamp).toDateString()));
    while (seen.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    setStreakCount(streak);
  }, []);

  const handleMoodSelect = (value) => {
    setMood(value);
    saveMood(value);
    setTimeout(() => setStep(2), 300);
  };

  const handleComplete = () => {
    saveCheckin({
      timestamp: new Date().toISOString(),
      mood,
      reflection: reflection.trim(),
      question,
    });
    setStep(3);
  };

  const selectedMood = MOODS.find(m => m.value === mood);

  // ── Welcome / already done ──────────────────────────────────────────────
  if (alreadyDone && step === 0) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
        <h1 style={{ fontSize: 24, color: '#E8EDF5', margin: '0 0 10px', fontWeight: 400 }}>
          Already checked in today
        </h1>
        <p style={{ fontSize: 14, color: '#7A9BB5', marginBottom: 28, lineHeight: 1.7 }}>
          You've already completed your daily check-in. Come back tomorrow, or check in again if you'd like to update how you're feeling.
        </p>
        {streakCount > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}30`, borderRadius: 20, marginBottom: 28
          }}>
            <span style={{ fontSize: 20 }}>🔥</span>
            <span style={{ fontSize: 14, color: '#A5C8D8' }}>{streakCount} day streak</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setAlreadyDone(false)} style={{
            padding: '11px 22px', background: CARD, border: BORDER,
            borderRadius: 10, color: '#E8EDF5', cursor: 'pointer', fontSize: 14
          }}>Check in again</button>
          <button onClick={() => navigate('/chat')} style={{
            padding: '11px 22px', background: ACCENT, border: 'none',
            borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
          }}>Go to Chat →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Step indicator */}
        {step > 0 && step < 3 && <StepIndicator current={step} total={3} />}

        {/* ── Step 0: Welcome ───────────────────────────────────────────── */}
        {step === 0 && (
          <div style={{ textAlign: 'center', animation: 'checkInFade 0.4s ease' }}>
            <style>{`@keyframes checkInFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{greeting.emoji}</div>
            <h1 style={{
              fontSize: 28, margin: '0 0 10px', fontWeight: 400,
              background: 'linear-gradient(135deg, #E8EDF5, #A5C8D8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>{greeting.text}</h1>
            <p style={{ fontSize: 15, color: '#7A9BB5', margin: '0 0 8px', lineHeight: 1.7 }}>
              Time for your daily check-in. This takes about 2 minutes.
            </p>
            {streakCount > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 18px', background: `${ACCENT}15`,
                border: `1px solid ${ACCENT}30`, borderRadius: 20, marginBottom: 16
              }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <span style={{ fontSize: 13, color: '#A5C8D8' }}>{streakCount} day streak — keep it going!</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{
                padding: '14px', background: ACCENT, border: 'none',
                borderRadius: 12, color: '#fff', cursor: 'pointer',
                fontSize: 16, fontWeight: 500
              }}>Start Check-in ✓</button>
              <button onClick={() => navigate('/chat')} style={{
                padding: '12px', background: 'transparent', border: BORDER,
                borderRadius: 12, color: '#7A9BB5', cursor: 'pointer', fontSize: 14
              }}>Skip — go to chat</button>
              <button onClick={() => navigate(-1)} style={{
                background: 'transparent', border: 'none',
                color: '#4A6A8A', cursor: 'pointer', fontSize: 13
              }}>← Back</button>
            </div>
          </div>
        )}

        {/* ── Step 1: Mood ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div style={{ animation: 'checkInFade 0.3s ease' }}>
            <h2 style={{ fontSize: 22, color: '#E8EDF5', margin: '0 0 6px', fontWeight: 400, textAlign: 'center' }}>
              How are you feeling right now?
            </h2>
            <p style={{ fontSize: 13, color: '#7A9BB5', textAlign: 'center', margin: '0 0 28px' }}>
              Be honest — there are no wrong answers.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {MOODS.map(m => (
                <button key={m.value} onClick={() => handleMoodSelect(m.value)} style={{
                  padding: '16px 8px', borderRadius: 14, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  background: mood === m.value ? `${m.color}20` : CARD,
                  border: mood === m.value ? `2px solid ${m.color}70` : BORDER,
                  transition: 'all 0.15s',
                  transform: mood === m.value ? 'scale(1.06)' : 'scale(1)'
                }}>
                  <span style={{ fontSize: 32 }}>{m.emoji}</span>
                  <span style={{ fontSize: 11, color: m.color, fontWeight: mood === m.value ? 600 : 400 }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Reflection ────────────────────────────────────────── */}
        {step === 2 && (
          <div style={{ animation: 'checkInFade 0.3s ease' }}>
            {/* Show selected mood */}
            {selectedMood && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
                padding: '10px 16px', background: `${selectedMood.color}15`,
                border: `1px solid ${selectedMood.color}30`, borderRadius: 10
              }}>
                <span style={{ fontSize: 22 }}>{selectedMood.emoji}</span>
                <span style={{ fontSize: 14, color: selectedMood.color }}>Feeling {selectedMood.label}</span>
              </div>
            )}

            <h2 style={{ fontSize: 20, color: '#E8EDF5', margin: '0 0 20px', fontWeight: 400, lineHeight: 1.5 }}>
              {question}
            </h2>

            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="Write as much or as little as you like. This is just for you."
              autoFocus
              rows={5}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: reflection.trim() ? `1px solid ${ACCENT}40` : BORDER,
                color: '#E8EDF5', fontSize: 14, outline: 'none',
                resize: 'none', lineHeight: 1.7, boxSizing: 'border-box',
                fontFamily: "'Georgia', serif", marginBottom: 16
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleComplete} style={{
                flex: 1, padding: '13px', background: ACCENT, border: 'none',
                borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 500
              }}>
                {reflection.trim() ? 'Complete Check-in ✓' : 'Skip reflection & finish'}
              </button>
              <button onClick={() => setStep(1)} style={{
                padding: '13px 16px', background: CARD, border: BORDER,
                borderRadius: 10, color: '#7A9BB5', cursor: 'pointer', fontSize: 14
              }}>← Back</button>
            </div>

            <p style={{ fontSize: 11, color: '#4A6A8A', textAlign: 'center', marginTop: 10 }}>
              🔒 Saved privately on your device only
            </p>
          </div>
        )}

        {/* ── Step 3: Done ──────────────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', animation: 'checkInFade 0.4s ease' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {selectedMood?.emoji || '💙'}
            </div>
            <h2 style={{ fontSize: 24, color: '#E8EDF5', margin: '0 0 10px', fontWeight: 400 }}>
              Check-in complete
            </h2>
            <p style={{ fontSize: 14, color: '#7A9BB5', margin: '0 0 8px', lineHeight: 1.7 }}>
              Thank you for taking a moment to check in with yourself.
              {selectedMood && selectedMood.value <= 2 && (
                <span> It sounds like today is hard — you don't have to face it alone.</span>
              )}
            </p>

            {/* Streak */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', background: `${ACCENT}15`,
              border: `1px solid ${ACCENT}30`, borderRadius: 20, margin: '12px 0 24px'
            }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{ fontSize: 13, color: '#A5C8D8' }}>
                {streakCount + 1} day streak!
              </span>
            </div>

            {/* Next steps based on mood */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedMood && selectedMood.value <= 2 && (
                <button onClick={() => navigate('/chat')} style={{
                  padding: '13px', background: '#E05555', border: 'none',
                  borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
                }}>💬 Talk to Rafiki now</button>
              )}
              {selectedMood && selectedMood.value <= 2 && (
                <button onClick={() => navigate('/breathing')} style={{
                  padding: '12px', background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`,
                  borderRadius: 10, color: '#A5C8D8', cursor: 'pointer', fontSize: 14
                }}>🌬 Try a breathing exercise</button>
              )}
              <button onClick={() => navigate('/chat')} style={{
                padding: '13px', background: selectedMood?.value <= 2 ? CARD : ACCENT,
                border: selectedMood?.value <= 2 ? BORDER : 'none',
                borderRadius: 10, color: selectedMood?.value <= 2 ? '#E8EDF5' : '#fff',
                cursor: 'pointer', fontSize: 14, fontWeight: selectedMood?.value > 2 ? 500 : 400
              }}>
                {selectedMood?.value > 2 ? '💬 Start a chat →' : '💬 Go to chat'}
              </button>
              <button onClick={() => navigate('/journal')} style={{
                padding: '12px', background: CARD, border: BORDER,
                borderRadius: 10, color: '#7A9BB5', cursor: 'pointer', fontSize: 14
              }}>📓 Write in journal</button>
              <button onClick={() => navigate('/dashboard')} style={{
                padding: '12px', background: 'transparent', border: 'none',
                color: '#4A6A8A', cursor: 'pointer', fontSize: 13
              }}>View mood history →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyCheckIn;