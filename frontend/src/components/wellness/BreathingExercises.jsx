import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';

// ── Exercise definitions ───────────────────────────────────────────────────
const BREATHING_TECHNIQUES = [
  {
    id: 'box',
    name: 'Box Breathing',
    emoji: '⬜',
    description: 'Used by Navy SEALs to stay calm under pressure. Equal counts for each phase.',
    benefit: 'Reduces stress & anxiety',
    phases: [
      { label: 'Inhale', duration: 4, color: '#4A8FA8', instruction: 'Breathe in slowly through your nose' },
      { label: 'Hold', duration: 4, color: '#7ACCA0', instruction: 'Hold your breath gently' },
      { label: 'Exhale', duration: 4, color: '#A5C8D8', instruction: 'Breathe out slowly through your mouth' },
      { label: 'Hold', duration: 4, color: '#D4A017', instruction: 'Rest before the next breath' },
    ]
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    emoji: '🌙',
    description: 'A natural tranquilizer for the nervous system. Great before sleep or during panic.',
    benefit: 'Calms panic & aids sleep',
    phases: [
      { label: 'Inhale', duration: 4, color: '#4A8FA8', instruction: 'Inhale quietly through your nose' },
      { label: 'Hold', duration: 7, color: '#7ACCA0', instruction: 'Hold your breath' },
      { label: 'Exhale', duration: 8, color: '#A5C8D8', instruction: 'Exhale completely through your mouth' },
    ]
  },
  {
    id: 'diaphragmatic',
    name: 'Deep Belly Breathing',
    emoji: '🫁',
    description: 'Activates the parasympathetic nervous system. Place one hand on your belly.',
    benefit: 'Instant calm & grounding',
    phases: [
      { label: 'Inhale', duration: 5, color: '#4A8FA8', instruction: 'Let your belly rise as you breathe in' },
      { label: 'Hold', duration: 2, color: '#7ACCA0', instruction: 'Pause at the top' },
      { label: 'Exhale', duration: 6, color: '#A5C8D8', instruction: 'Let your belly fall as you breathe out' },
      { label: 'Rest', duration: 2, color: '#7A9BB5', instruction: 'Relax before the next breath' },
    ]
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    emoji: '🔄',
    description: 'Breathe at 5 breaths per minute to synchronize heart rate and breathing.',
    benefit: 'Heart rate balance',
    phases: [
      { label: 'Inhale', duration: 6, color: '#4A8FA8', instruction: 'Slow, steady inhale through your nose' },
      { label: 'Exhale', duration: 6, color: '#A5C8D8', instruction: 'Slow, steady exhale through your nose' },
    ]
  }
];

const GROUNDING_EXERCISES = [
  {
    id: '54321',
    name: '5-4-3-2-1 Grounding',
    emoji: '👁',
    duration: '3–5 min',
    description: 'Uses your five senses to anchor you to the present moment.',
    steps: [
      { count: 5, sense: 'see', emoji: '👀', instruction: 'Name 5 things you can SEE right now. Look around carefully — a color, a shape, light, shadow.' },
      { count: 4, sense: 'touch', emoji: '✋', instruction: 'Name 4 things you can TOUCH. Feel the texture of your clothes, the surface beneath you, the air on your skin.' },
      { count: 3, sense: 'hear', emoji: '👂', instruction: 'Name 3 things you can HEAR. Listen for distant sounds, close sounds, your own breathing.' },
      { count: 2, sense: 'smell', emoji: '👃', instruction: 'Name 2 things you can SMELL. If you can\'t smell anything, think of your two favorite scents.' },
      { count: 1, sense: 'taste', emoji: '👅', instruction: 'Name 1 thing you can TASTE. Notice the current taste in your mouth, or think of a comforting flavor.' },
    ]
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    emoji: '🧘',
    duration: '5–10 min',
    description: 'Slowly move attention through your body to release held tension.',
    steps: [
      { emoji: '🦶', instruction: 'Start at your feet. Notice any tension, warmth, or sensation. Breathe into that area and let it soften.' },
      { emoji: '🦵', instruction: 'Move up to your calves and knees. Unclench any muscles. Let your legs feel heavy and relaxed.' },
      { emoji: '🍑', instruction: 'Notice your hips and lower back. This is where many people hold stress. Breathe and release.' },
      { emoji: '🫁', instruction: 'Bring attention to your belly and chest. Notice the rise and fall with each breath. Let it be effortless.' },
      { emoji: '💪', instruction: 'Scan your shoulders and arms down to your hands. Drop your shoulders away from your ears.' },
      { emoji: '🗣', instruction: 'Notice your jaw, face, and scalp. Unclench your teeth. Soften the muscles around your eyes.' },
      { emoji: '🧠', instruction: 'Now take in your whole body at once. You are here. You are safe. Take three deep breaths.' },
    ]
  },
  {
    id: 'cold-water',
    name: 'Temperature Reset',
    emoji: '💧',
    duration: '1–2 min',
    description: 'Cold water activates the dive reflex, slowing your heart rate rapidly.',
    steps: [
      { emoji: '🚰', instruction: 'Go to a sink and run cold water.' },
      { emoji: '✋', instruction: 'Place your wrists under the cold water for 30 seconds. Feel the sensation fully.' },
      { emoji: '💦', instruction: 'Splash cold water on your face three times. Take a slow breath after each splash.' },
      { emoji: '🧊', instruction: 'If available, hold an ice cube in your hand. Focus completely on the cold sensation.' },
      { emoji: '😮‍💨', instruction: 'Take a slow breath in and a long exhale out. Notice your heart rate beginning to slow.' },
    ]
  },
  {
    id: 'safe-place',
    name: 'Safe Place Visualization',
    emoji: '🏡',
    duration: '5 min',
    description: 'Guide yourself to a mental safe haven when surroundings feel overwhelming.',
    steps: [
      { emoji: '👁', instruction: 'Close your eyes and take three slow breaths. Let your shoulders drop.' },
      { emoji: '🌿', instruction: 'Picture a place where you feel completely safe and calm. It can be real or imagined — a beach, a forest, a cozy room.' },
      { emoji: '🎨', instruction: 'Fill in the details. What colors do you see? What sounds? What does the air smell like? How does it feel?' },
      { emoji: '🚶', instruction: 'Imagine yourself walking through this place slowly. Notice how your body feels as you move through your safe space.' },
      { emoji: '💙', instruction: 'Rest here for a moment. Remember — this place is always available to you. You can return anytime.' },
    ]
  }
];

// ── Breathing animator ─────────────────────────────────────────────────────
const BreathingAnimator = ({ technique, onStop }) => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(technique.phases[0].duration);
  const [cycleCount, setCycleCount] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);
  const phase = technique.phases[phaseIdx];

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          const nextIdx = (phaseIdx + 1) % technique.phases.length;
          setPhaseIdx(nextIdx);
          if (nextIdx === 0) setCycleCount(c => c + 1);
          setSecondsLeft(technique.phases[nextIdx].duration);
          return technique.phases[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phaseIdx, technique]);

  // Circle size animation based on phase
  const isInhale = phase.label === 'Inhale';
  const isHold = phase.label === 'Hold' || phase.label === 'Rest';
  const circleScale = isInhale ? 1 : isHold ? 0.85 : 0.6;
  const progress = 1 - (secondsLeft / phase.duration);

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      {/* Animated circle */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }}>
        {/* Outer ring */}
        <div style={{
          width: 200, height: 200, borderRadius: '50%',
          border: `2px solid ${phase.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Progress ring via conic gradient */}
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: `conic-gradient(${phase.color} ${progress * 360}deg, transparent ${progress * 360}deg)`,
            opacity: 0.6
          }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: BG }} />

          {/* Inner breathing circle */}
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%, ${phase.color}60, ${phase.color}20)`,
            border: `2px solid ${phase.color}60`,
            transform: `scale(${circleScale})`,
            transition: `transform ${phase.duration * 0.8}s ease-in-out`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
            boxShadow: `0 0 30px ${phase.color}40`
          }}>
            <span style={{ fontSize: 36 }}>
              {isInhale ? '🌬' : isHold ? '⏸' : '😮‍💨'}
            </span>
          </div>
        </div>
      </div>

      {/* Phase label */}
      <p style={{ fontSize: 28, fontWeight: 600, color: phase.color, margin: '0 0 8px' }}>
        {phase.label}
      </p>
      <p style={{ fontSize: 48, fontWeight: 700, color: '#E8EDF5', margin: '0 0 8px', fontVariantNumeric: 'tabular-nums' }}>
        {secondsLeft}
      </p>
      <p style={{ fontSize: 14, color: '#7A9BB5', margin: '0 0 24px' }}>
        {phase.instruction}
      </p>
      <p style={{ fontSize: 12, color: '#4A6A8A', margin: '0 0 24px' }}>
        Cycle {cycleCount + 1} · {technique.name}
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => setRunning(v => !v)} style={{
          padding: '10px 24px', borderRadius: 20, border: BORDER,
          background: CARD, color: '#E8EDF5', cursor: 'pointer', fontSize: 14
        }}>
          {running ? '⏸ Pause' : '▶ Resume'}
        </button>
        <button onClick={onStop} style={{
          padding: '10px 24px', borderRadius: 20, border: '1px solid rgba(220,80,80,0.3)',
          background: 'rgba(220,80,80,0.08)', color: '#E05555', cursor: 'pointer', fontSize: 14
        }}>
          ✕ Stop
        </button>
      </div>
    </div>
  );
};

// ── Grounding guide ────────────────────────────────────────────────────────
const GroundingGuide = ({ exercise, onStop }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const step = exercise.steps[stepIdx];
  const isLast = stepIdx === exercise.steps.length - 1;

  const next = () => {
    if (isLast) { setDone(true); }
    else { setStepIdx(i => i + 1); }
  };
  const prev = () => { if (stepIdx > 0) setStepIdx(i => i - 1); setDone(false); };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
      <h3 style={{ fontSize: 20, color: '#E8EDF5', margin: '0 0 12px' }}>Well done</h3>
      <p style={{ fontSize: 14, color: '#7A9BB5', margin: '0 0 24px' }}>
        You completed {exercise.name}. Take a moment to notice how you feel.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => { setStepIdx(0); setDone(false); }} style={{
          padding: '10px 20px', borderRadius: 20, border: BORDER,
          background: CARD, color: '#E8EDF5', cursor: 'pointer', fontSize: 13
        }}>↩ Repeat</button>
        <button onClick={onStop} style={{
          padding: '10px 20px', borderRadius: 20, background: ACCENT,
          border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13
        }}>Done</button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#7A9BB5' }}>Step {stepIdx + 1} of {exercise.steps.length}</span>
          <span style={{ fontSize: 12, color: '#7A9BB5' }}>{exercise.name}</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
          <div style={{
            height: 4, borderRadius: 2, background: ACCENT,
            width: `${((stepIdx + 1) / exercise.steps.length) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Step content */}
      <div style={{ textAlign: 'center', padding: '24px 16px', minHeight: 200 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>{step.emoji}</div>
        {step.count && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {Array.from({ length: step.count }).map((_, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${ACCENT}30`, border: `1px solid ${ACCENT}60`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: '#A5C8D8', fontWeight: 600
              }}>{i + 1}</div>
            ))}
          </div>
        )}
        <p style={{ fontSize: 16, color: '#E8EDF5', lineHeight: 1.7, margin: 0 }}>
          {step.instruction}
        </p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
        <button onClick={prev} disabled={stepIdx === 0} style={{
          padding: '10px 20px', borderRadius: 20, border: BORDER,
          background: CARD, color: stepIdx === 0 ? '#4A6A8A' : '#E8EDF5',
          cursor: stepIdx === 0 ? 'default' : 'pointer', fontSize: 14
        }}>← Back</button>
        <button onClick={next} style={{
          padding: '10px 28px', borderRadius: 20, background: ACCENT,
          border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
        }}>{isLast ? '✓ Finish' : 'Next →'}</button>
        <button onClick={onStop} style={{
          padding: '10px 16px', borderRadius: 20,
          border: '1px solid rgba(220,80,80,0.3)',
          background: 'transparent', color: '#E05555', cursor: 'pointer', fontSize: 13
        }}>✕</button>
      </div>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────
const BreathingExercises = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('breathing'); // 'breathing' | 'grounding'
  const [active, setActive] = useState(null);   // currently running exercise id
  const [activeType, setActiveType] = useState(null); // 'breathing' | 'grounding'

  const startExercise = (id, type) => { setActive(id); setActiveType(type); };
  const stopExercise = () => { setActive(null); setActiveType(null); };

  const activeTechnique = BREATHING_TECHNIQUES.find(t => t.id === active);
  const activeGrounding = GROUNDING_EXERCISES.find(e => e.id === active);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 48px' }}>

        {/* Header */}
        <button onClick={() => navigate('/chat')} style={{
          background: 'transparent', border: 'none', color: '#7A9BB5',
          fontSize: 14, cursor: 'pointer', marginBottom: 20
        }}>← Back to Chat</button>

        <h1 style={{
          fontSize: 28, margin: '0 0 6px',
          background: 'linear-gradient(135deg, #E8EDF5, #A5C8D8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>Breathing & Grounding</h1>
        <p style={{ fontSize: 14, color: '#7A9BB5', marginBottom: 28, lineHeight: 1.6 }}>
          These exercises activate your body's natural calming response.
          Use them anytime you feel overwhelmed, anxious, or disconnected.
        </p>

        {/* Active exercise */}
        {active && (
          <div style={{
            background: CARD, borderRadius: 20, border: BORDER,
            padding: '24px', marginBottom: 28
          }}>
            {activeType === 'breathing' && activeTechnique && (
              <BreathingAnimator technique={activeTechnique} onStop={stopExercise} />
            )}
            {activeType === 'grounding' && activeGrounding && (
              <GroundingGuide exercise={activeGrounding} onStop={stopExercise} />
            )}
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'breathing', label: '🌬 Breathing' },
            { id: 'grounding', label: '🌍 Grounding' }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 20px', borderRadius: 20, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.15s', border: 'none',
              background: tab === t.id ? ACCENT : CARD,
              color: tab === t.id ? '#fff' : '#7A9BB5',
              fontWeight: tab === t.id ? 500 : 400
            }}>{t.label}</button>
          ))}
        </div>

        {/* Breathing techniques */}
        {tab === 'breathing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BREATHING_TECHNIQUES.map(tech => (
              <div key={tech.id} style={{
                background: active === tech.id ? `${ACCENT}15` : CARD,
                borderRadius: 14, border: active === tech.id ? `1px solid ${ACCENT}50` : BORDER,
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16
              }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{tech.emoji}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, color: '#E8EDF5', margin: '0 0 4px', fontWeight: 500 }}>
                    {tech.name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#7A9BB5', margin: '0 0 4px', lineHeight: 1.5 }}>
                    {tech.description}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {tech.phases.map((p, i) => (
                      <span key={i} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                        background: `${p.color}20`, color: p.color,
                        border: `1px solid ${p.color}30`
                      }}>{p.label} {p.duration}s</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => active === tech.id ? stopExercise() : startExercise(tech.id, 'breathing')}
                  style={{
                    padding: '9px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: active === tech.id ? 'rgba(220,80,80,0.15)' : ACCENT,
                    color: active === tech.id ? '#E05555' : '#fff',
                    fontSize: 13, fontWeight: 500, flexShrink: 0
                  }}
                >
                  {active === tech.id ? '⏹ Stop' : '▶ Start'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Grounding exercises */}
        {tab === 'grounding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {GROUNDING_EXERCISES.map(ex => (
              <div key={ex.id} style={{
                background: active === ex.id ? `${ACCENT}15` : CARD,
                borderRadius: 14, border: active === ex.id ? `1px solid ${ACCENT}50` : BORDER,
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16
              }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{ex.emoji}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, color: '#E8EDF5', margin: '0 0 4px', fontWeight: 500 }}>
                    {ex.name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#7A9BB5', margin: '0 0 6px', lineHeight: 1.5 }}>
                    {ex.description}
                  </p>
                  <span style={{ fontSize: 11, color: '#4A6A8A' }}>⏱ {ex.duration}</span>
                </div>
                <button
                  onClick={() => active === ex.id ? stopExercise() : startExercise(ex.id, 'grounding')}
                  style={{
                    padding: '9px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: active === ex.id ? 'rgba(220,80,80,0.15)' : ACCENT,
                    color: active === ex.id ? '#E05555' : '#fff',
                    fontSize: 13, fontWeight: 500, flexShrink: 0
                  }}
                >
                  {active === ex.id ? '⏹ Stop' : '▶ Start'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer tip */}
        <div style={{
          marginTop: 32, padding: '16px 20px', background: CARD,
          borderRadius: 12, border: BORDER, fontSize: 12, color: '#7A9BB5', lineHeight: 1.6
        }}>
          💡 <strong style={{ color: '#A5C8D8' }}>Tip:</strong> These exercises work best when practiced regularly,
          not just during a crisis. Even 3 minutes a day builds your resilience over time.
        </div>
      </div>
    </div>
  );
};

export default BreathingExercises;