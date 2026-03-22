import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';
const STORAGE_KEY = 'safeguide_safety_plan';

// ── Default plan structure ────────────────────────────────────────────────
const DEFAULT_PLAN = {
  lastUpdated: null,
  warningSigns: ['', '', ''],
  copingStrategies: ['', '', ''],
  distractions: ['', '', ''],
  supportPeople: [
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
  ],
  professionals: [
    { name: '', phone: '', organization: '' },
    { name: '', phone: '', organization: '' },
  ],
  crisisLines: [
    { name: 'EMKF Crisis Hotline', phone: '0800 723 253' },
    { name: 'Niskize', phone: '0900 620 800' },
    { name: 'Befrienders Kenya', phone: '+254 722 178 177' },
  ],
  safeEnvironment: ['', '', ''],
  reasonsToLive: ['', '', ''],
  emergencyPlan: '',
};

const loadPlan = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_PLAN, ...JSON.parse(saved) } : { ...DEFAULT_PLAN };
  } catch { return { ...DEFAULT_PLAN }; }
};

const savePlan = (plan) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...plan, lastUpdated: new Date().toISOString()
  }));
};

// ── Reusable components ───────────────────────────────────────────────────
const SectionHeader = ({ step, total, emoji, title, subtitle }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: `${ACCENT}30`, border: `1px solid ${ACCENT}60`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: '#A5C8D8', fontWeight: 600, flexShrink: 0
      }}>{step}</div>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <h2 style={{ fontSize: 18, color: '#E8EDF5', margin: 0, fontWeight: 600 }}>{title}</h2>
    </div>
    <p style={{ fontSize: 13, color: '#7A9BB5', margin: '0 0 0 42px', lineHeight: 1.6 }}>{subtitle}</p>
  </div>
);

const TextList = ({ items, onChange, placeholder, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {hint && <p style={{ fontSize: 11, color: '#4A6A8A', margin: '0 0 4px' }}>{hint}</p>}
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: item.trim() ? `${ACCENT}30` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${item.trim() ? ACCENT : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#7A9BB5', transition: 'all 0.2s'
        }}>{i + 1}</span>
        <input
          type="text"
          value={item}
          onChange={e => {
            const updated = [...items];
            updated[i] = e.target.value;
            onChange(updated);
          }}
          placeholder={typeof placeholder === 'function' ? placeholder(i) : placeholder}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: item.trim() ? `1px solid ${ACCENT}40` : '1px solid rgba(255,255,255,0.1)',
            color: '#E8EDF5', fontSize: 14, outline: 'none',
            transition: 'border-color 0.2s'
          }}
        />
      </div>
    ))}
    <button
      onClick={() => onChange([...items, ''])}
      style={{
        background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)',
        borderRadius: 10, color: '#4A6A8A', cursor: 'pointer',
        padding: '8px', fontSize: 12, marginTop: 2
      }}
    >+ Add another</button>
  </div>
);

const PersonCard = ({ person, onChange, fields }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', borderRadius: 12,
    border: BORDER, padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 8
  }}>
    {fields.map(({ key, label, placeholder, type = 'text' }) => (
      <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: '#4A6A8A', width: 90, flexShrink: 0 }}>{label}</label>
        <input
          type={type}
          value={person[key] || ''}
          onChange={e => onChange({ ...person, [key]: e.target.value })}
          placeholder={placeholder}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: person[key]?.trim() ? `1px solid ${ACCENT}40` : '1px solid rgba(255,255,255,0.1)',
            color: '#E8EDF5', fontSize: 13, outline: 'none'
          }}
        />
        {type === 'tel' && person[key]?.trim() && (
          <a href={`tel:${person[key].replace(/\s/g, '')}`} style={{
            padding: '7px 12px', background: `${ACCENT}20`,
            border: `1px solid ${ACCENT}40`, borderRadius: 8,
            color: '#A5C8D8', textDecoration: 'none', fontSize: 12, flexShrink: 0
          }}>📞</a>
        )}
      </div>
    ))}
  </div>
);

// ── Steps config ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 'warning',     emoji: '⚠️',  title: 'Warning Signs' },
  { id: 'coping',      emoji: '🛡',  title: 'Coping Strategies' },
  { id: 'distraction', emoji: '🎯',  title: 'Distractions' },
  { id: 'support',     emoji: '👥',  title: 'Support People' },
  { id: 'professional',emoji: '🏥',  title: 'Professionals' },
  { id: 'environment', emoji: '🏠',  title: 'Safe Environment' },
  { id: 'reasons',     emoji: '💙',  title: 'Reasons to Live' },
  { id: 'emergency',   emoji: '🚨',  title: 'Emergency Action' },
];

// ── Main component ────────────────────────────────────────────────────────
const SafetyPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(loadPlan);
  const [step, setStep] = useState(0); // 0 = overview, 1-8 = sections, 9 = complete
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState(false); // view full plan
  const printRef = useRef(null);

  const totalSteps = STEPS.length;
  const isOverview = step === 0;
  const isComplete = step > totalSteps;

  const update = (key, value) => {
    const updated = { ...plan, [key]: value };
    setPlan(updated);
    savePlan(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const completionPct = () => {
    let filled = 0, total = 0;
    const countList = (arr) => { arr.forEach(i => { total++; if (String(i).trim()) filled++; }); };
    countList(plan.warningSigns);
    countList(plan.copingStrategies);
    countList(plan.distractions);
    countList(plan.safeEnvironment);
    countList(plan.reasonsToLive);
    plan.supportPeople.forEach(p => { total++; if (p.name?.trim()) filled++; });
    plan.professionals.forEach(p => { total++; if (p.name?.trim()) filled++; });
    total++; if (plan.emergencyPlan?.trim()) filled++;
    return Math.round((filled / total) * 100);
  };

  const pct = completionPct();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>My Safety Plan — SafeGuide</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #1a1a2e; }
        h1 { color: #1a1a2e; } h2 { color: #2a4a6a; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
        ul { padding-left: 20px; } li { margin-bottom: 6px; }
        .person { background: #f5f5f5; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
        .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
        @media print { body { margin: 20px; } }
      </style></head><body>${content}</body></html>
    `);
    w.document.close();
    w.print();
  };

  const handleWhatsApp = () => {
    const lines = [
      '🛡 *My Safety Plan — SafeGuide*\n',
      '*⚠️ Warning Signs:*',
      ...plan.warningSigns.filter(Boolean).map(s => `• ${s}`),
      '\n*🛡 Coping Strategies:*',
      ...plan.copingStrategies.filter(Boolean).map(s => `• ${s}`),
      '\n*👥 People I can call:*',
      ...plan.supportPeople.filter(p => p.name).map(p => `• ${p.name}: ${p.phone}`),
      '\n*🚨 Crisis Lines:*',
      ...plan.crisisLines.map(c => `• ${c.name}: ${c.phone}`),
      '\n*💙 Reasons to live:*',
      ...plan.reasonsToLive.filter(Boolean).map(r => `• ${r}`),
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // ── Overview ─────────────────────────────────────────────────────────────
  if (isOverview && !viewMode) return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 48px' }}>
        <button onClick={() => navigate('/chat')} style={{
          background: 'transparent', border: 'none', color: '#7A9BB5',
          fontSize: 14, cursor: 'pointer', marginBottom: 20
        }}>← Back to Chat</button>

        <h1 style={{
          fontSize: 28, margin: '0 0 8px',
          background: 'linear-gradient(135deg, #E8EDF5, #A5C8D8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>My Safety Plan</h1>
        <p style={{ fontSize: 14, color: '#7A9BB5', marginBottom: 28, lineHeight: 1.6 }}>
          A personal crisis plan you build in advance — so when things get hard,
          you have a clear path forward. Takes about 10 minutes to complete.
        </p>

        {/* Progress */}
        <div style={{ background: CARD, borderRadius: 16, border: BORDER, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: '#E8EDF5', fontWeight: 500 }}>Plan Completion</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: pct >= 70 ? '#7ACCA0' : pct >= 40 ? '#D4A017' : '#E05555' }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 12 }}>
            <div style={{
              height: 8, borderRadius: 4, transition: 'width 0.4s ease',
              width: `${pct}%`,
              background: pct >= 70
                ? 'linear-gradient(90deg, #4A8FA8, #7ACCA0)'
                : pct >= 40
                ? 'linear-gradient(90deg, #D4A017, #E07A55)'
                : 'linear-gradient(90deg, #E05555, #E07A55)'
            }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setStep(i + 1)} style={{
                padding: '8px 4px', borderRadius: 10, border: BORDER,
                background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
                fontSize: 11, color: '#7A9BB5', textAlign: 'center',
                transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}20`; e.currentTarget.style.borderColor = `${ACCENT}50`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.emoji}</div>
                {s.title}
              </button>
            ))}
          </div>
          {plan.lastUpdated && (
            <p style={{ fontSize: 11, color: '#4A6A8A', margin: '12px 0 0', textAlign: 'right' }}>
              Last saved: {new Date(plan.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={() => setStep(1)} style={{
            flex: 1, minWidth: 140, padding: '13px', background: ACCENT, border: 'none',
            borderRadius: 10, color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 500
          }}>
            {pct === 0 ? '✏️ Start Building' : '✏️ Continue Editing'}
          </button>
          {pct > 0 && (
            <button onClick={() => setViewMode(true)} style={{
              flex: 1, minWidth: 140, padding: '13px', background: CARD, border: BORDER,
              borderRadius: 10, color: '#E8EDF5', fontSize: 14, cursor: 'pointer'
            }}>👁 View Full Plan</button>
          )}
        </div>

        {pct > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handlePrint} style={{
              padding: '9px 18px', background: CARD, border: BORDER,
              borderRadius: 8, color: '#A5C8D8', cursor: 'pointer', fontSize: 13
            }}>🖨 Print / Save PDF</button>
            <button onClick={handleWhatsApp} style={{
              padding: '9px 18px', background: 'rgba(37,211,102,0.1)',
              border: '1px solid rgba(37,211,102,0.3)',
              borderRadius: 8, color: '#25D366', cursor: 'pointer', fontSize: 13
            }}>💬 Share via WhatsApp</button>
          </div>
        )}

        {/* What is a safety plan */}
        <div style={{ marginTop: 28, padding: '18px 20px', background: CARD, borderRadius: 12, border: BORDER }}>
          <p style={{ fontSize: 13, color: '#A5C8D8', margin: '0 0 8px', fontWeight: 500 }}>What is a safety plan?</p>
          <p style={{ fontSize: 13, color: '#7A9BB5', margin: 0, lineHeight: 1.7 }}>
            A safety plan is a prioritized written list of coping strategies and support resources.
            Research shows that people who have a written safety plan are significantly less likely
            to act on suicidal thoughts during a crisis. Your plan is stored privately on your device.
          </p>
        </div>
      </div>
    </div>
  );

  // ── View mode (full plan read-only) ───────────────────────────────────────
  if (viewMode) return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 48px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => setViewMode(false)} style={{
            background: 'transparent', border: 'none', color: '#7A9BB5', fontSize: 14, cursor: 'pointer'
          }}>← Back</button>
          <button onClick={handlePrint} style={{
            padding: '8px 16px', background: CARD, border: BORDER,
            borderRadius: 8, color: '#A5C8D8', cursor: 'pointer', fontSize: 13
          }}>🖨 Print</button>
          <button onClick={handleWhatsApp} style={{
            padding: '8px 16px', background: 'rgba(37,211,102,0.1)',
            border: '1px solid rgba(37,211,102,0.3)',
            borderRadius: 8, color: '#25D366', cursor: 'pointer', fontSize: 13
          }}>💬 WhatsApp</button>
        </div>

        <div ref={printRef}>
          <h1 style={{ fontSize: 26, margin: '0 0 6px', color: '#E8EDF5' }}>🛡 My Safety Plan</h1>
          <p style={{ fontSize: 12, color: '#4A6A8A', marginBottom: 28 }}>
            Created with SafeGuide · {plan.lastUpdated ? new Date(plan.lastUpdated).toLocaleDateString() : 'Not saved yet'}
          </p>

          {[
            { emoji: '⚠️', title: 'Warning Signs', items: plan.warningSigns },
            { emoji: '🛡', title: 'Coping Strategies', items: plan.copingStrategies },
            { emoji: '🎯', title: 'Distractions & Activities', items: plan.distractions },
            { emoji: '🏠', title: 'Safe Environment', items: plan.safeEnvironment },
            { emoji: '💙', title: 'Reasons to Live', items: plan.reasonsToLive },
          ].map(section => section.items.filter(Boolean).length > 0 && (
            <div key={section.title} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, color: '#A5C8D8', margin: '0 0 10px', display: 'flex', gap: 8 }}>
                <span>{section.emoji}</span>{section.title}
              </h2>
              {section.items.filter(Boolean).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: ACCENT, fontSize: 13 }}>•</span>
                  <span style={{ fontSize: 14, color: '#E8EDF5' }}>{item}</span>
                </div>
              ))}
            </div>
          ))}

          {plan.supportPeople.filter(p => p.name).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, color: '#A5C8D8', margin: '0 0 10px' }}>👥 Support People</h2>
              {plan.supportPeople.filter(p => p.name).map((p, i) => (
                <div key={i} style={{ padding: '10px 14px', background: CARD, borderRadius: 10, border: BORDER, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#E8EDF5', fontWeight: 500 }}>{p.name} {p.relationship && `(${p.relationship})`}</p>
                  {p.phone && <a href={`tel:${p.phone}`} style={{ fontSize: 13, color: ACCENT, textDecoration: 'none' }}>📞 {p.phone}</a>}
                </div>
              ))}
            </div>
          )}

          {plan.professionals.filter(p => p.name).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, color: '#A5C8D8', margin: '0 0 10px' }}>🏥 Professionals</h2>
              {plan.professionals.filter(p => p.name).map((p, i) => (
                <div key={i} style={{ padding: '10px 14px', background: CARD, borderRadius: 10, border: BORDER, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#E8EDF5', fontWeight: 500 }}>{p.name} {p.organization && `— ${p.organization}`}</p>
                  {p.phone && <a href={`tel:${p.phone}`} style={{ fontSize: 13, color: ACCENT, textDecoration: 'none' }}>📞 {p.phone}</a>}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, color: '#E05555', margin: '0 0 10px' }}>🚨 Crisis Lines</h2>
            {plan.crisisLines.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: 'rgba(220,80,80,0.08)', borderRadius: 10, border: '1px solid rgba(220,80,80,0.2)', marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: '#E8EDF5' }}>{c.name}</span>
                <a href={`tel:${c.phone.replace(/\s/g, '')}`} style={{ fontSize: 14, color: '#E05555', textDecoration: 'none', fontWeight: 500 }}>{c.phone}</a>
              </div>
            ))}
          </div>

          {plan.emergencyPlan?.trim() && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, color: '#A5C8D8', margin: '0 0 10px' }}>🚨 Emergency Action Plan</h2>
              <p style={{ fontSize: 14, color: '#E8EDF5', lineHeight: 1.7, margin: 0 }}>{plan.emergencyPlan}</p>
            </div>
          )}

          <div style={{ fontSize: 11, color: '#4A6A8A', marginTop: 32, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            This safety plan was created using SafeGuide. Keep a copy somewhere accessible.
            If you are in immediate danger, call 999 or go to your nearest emergency room.
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step editor ───────────────────────────────────────────────────────────
  const currentStep = STEPS[step - 1];

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'warning': return (
        <>
          <SectionHeader step={step} total={totalSteps} emoji="⚠️" title="Warning Signs"
            subtitle="What thoughts, feelings, images, moods, situations, or behaviors indicate a crisis may be developing?" />
          <TextList items={plan.warningSigns} onChange={v => update('warningSigns', v)}
            placeholder={i => ['e.g. I start withdrawing from everyone', 'e.g. I feel hopeless about the future', 'e.g. I stop eating or sleeping'][i] || 'Add a warning sign...'}
            hint="Think about what happened the last time you were in crisis — what were the early signs?" />
        </>
      );
      case 'coping': return (
        <>
          <SectionHeader step={step} total={totalSteps} emoji="🛡" title="Coping Strategies"
            subtitle="Things you can do on your own to help you cope with difficult thoughts and feelings." />
          <TextList items={plan.copingStrategies} onChange={v => update('copingStrategies', v)}
            placeholder={i => ['e.g. Go for a walk outside', 'e.g. Write in my journal', 'e.g. Do the breathing exercises'][i] || 'Add a coping strategy...'}
            hint="Include both physical activities and mental strategies." />
        </>
      );
      case 'distraction': return (
        <>
          <SectionHeader step={step} total={totalSteps} emoji="🎯" title="Distractions & Activities"
            subtitle="People and social settings that provide distraction from the crisis — places or activities that make it difficult to dwell on distressing thoughts." />
          <TextList items={plan.distractions} onChange={v => update('distractions', v)}
            placeholder={i => ['e.g. Call my friend Amina and talk about anything', 'e.g. Go to a coffee shop or library', 'e.g. Watch a favourite series'][i] || 'Add a distraction...'}
            hint="Think of people, places, or activities — not necessarily about the crisis itself." />
        </>
      );
      case 'support': return (
        <>
          <SectionHeader step={step} total={totalSteps} emoji="👥" title="People I Can Ask for Help"
            subtitle="People you trust who can provide support during a crisis. Include their phone numbers so you can contact them quickly." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {plan.supportPeople.map((person, i) => (
              <div key={i}>
                <p style={{ fontSize: 12, color: '#4A6A8A', margin: '0 0 6px' }}>Person {i + 1}</p>
                <PersonCard person={person}
                  onChange={updated => {
                    const arr = [...plan.supportPeople];
                    arr[i] = updated;
                    update('supportPeople', arr);
                  }}
                  fields={[
                    { key: 'name', label: 'Name', placeholder: 'Full name' },
                    { key: 'relationship', label: 'Relationship', placeholder: 'e.g. Friend, Sister' },
                    { key: 'phone', label: 'Phone', placeholder: '+254 7XX XXX XXX', type: 'tel' },
                  ]}
                />
              </div>
            ))}
            <button onClick={() => update('supportPeople', [...plan.supportPeople, { name: '', phone: '', relationship: '' }])} style={{
              background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)',
              borderRadius: 10, color: '#4A6A8A', cursor: 'pointer', padding: '9px', fontSize: 12
            }}>+ Add person</button>
          </div>
        </>
      );
      case 'professional': return (
        <>
          <SectionHeader step={step} total={totalSteps} emoji="🏥" title="Professionals & Agencies"
            subtitle="Mental health professionals, doctors, or services you can contact during a crisis." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {plan.professionals.map((prof, i) => (
              <div key={i}>
                <p style={{ fontSize: 12, color: '#4A6A8A', margin: '0 0 6px' }}>Professional {i + 1}</p>
                <PersonCard person={prof}
                  onChange={updated => {
                    const arr = [...plan.professionals];
                    arr[i] = updated;
                    update('professionals', arr);
                  }}
                  fields={[
                    { key: 'name', label: 'Name', placeholder: 'Dr. / Counsellor name' },
                    { key: 'organization', label: 'Organisation', placeholder: 'Hospital / clinic name' },
                    { key: 'phone', label: 'Phone', placeholder: '+254 7XX XXX XXX', type: 'tel' },
                  ]}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: '#A5C8D8', margin: '0 0 10px', fontWeight: 500 }}>Crisis Lines (pre-filled)</p>
          {plan.crisisLines.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <input value={line.name} onChange={e => {
                const arr = [...plan.crisisLines]; arr[i] = { ...arr[i], name: e.target.value }; update('crisisLines', arr);
              }} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8EDF5', fontSize: 13, outline: 'none' }} />
              <input value={line.phone} onChange={e => {
                const arr = [...plan.crisisLines]; arr[i] = { ...arr[i], phone: e.target.value }; update('crisisLines', arr);
              }} style={{ width: 160, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8EDF5', fontSize: 13, outline: 'none' }} />
              <a href={`tel:${line.phone.replace(/\s/g, '')}`} style={{ padding: '8px 12px', background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: 8, color: '#A5C8D8', textDecoration: 'none', fontSize: 12 }}>📞</a>
            </div>
          ))}
        </>
      );
      case 'environment': return (
        <>
          <SectionHeader step={step} total={totalSteps} emoji="🏠" title="Making the Environment Safe"
            subtitle="Things you can do to make your environment safer during a crisis." />
          <TextList items={plan.safeEnvironment} onChange={v => update('safeEnvironment', v)}
            placeholder={i => ['e.g. Ask someone to hold my medication', 'e.g. Go to a safe place away from home', 'e.g. Remove items that could be used for self-harm'][i] || 'Add a safety step...'}
            hint="Think practically — what specific steps can reduce immediate risk in your environment?" />
        </>
      );
      case 'reasons': return (
        <>
          <SectionHeader step={step} total={totalSteps} emoji="💙" title="Reasons to Live"
            subtitle="The most important reasons you have for living. These are personal and powerful — write them in your own words." />
          <TextList items={plan.reasonsToLive} onChange={v => update('reasonsToLive', v)}
            placeholder={i => ['e.g. My family needs me', 'e.g. I want to see who I become', 'e.g. My dog depends on me'][i] || 'Add a reason...'}
            hint="Research shows that writing down your reasons to live makes them more powerful during a crisis." />
        </>
      );
      case 'emergency': return (
        <>
          <SectionHeader step={step} total={totalSteps} emoji="🚨" title="Emergency Action Plan"
            subtitle="If everything else fails — what specific steps will you take? Be as concrete as possible." />
          <textarea
            value={plan.emergencyPlan}
            onChange={e => update('emergencyPlan', e.target.value)}
            placeholder="e.g. If I feel I cannot keep myself safe, I will immediately call my sister Amina on +254 7XX XXX XXX. If I cannot reach her, I will call 0800 723 253 (EMKF). If I am in immediate danger I will go to Kenyatta National Hospital A&E or call 999."
            rows={6}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: plan.emergencyPlan?.trim() ? `1px solid ${ACCENT}40` : '1px solid rgba(255,255,255,0.1)',
              color: '#E8EDF5', fontSize: 14, outline: 'none',
              resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box'
            }}
          />
          <p style={{ fontSize: 12, color: '#4A6A8A', marginTop: 8 }}>
            Include names, phone numbers, and locations. The more specific, the better.
          </p>
        </>
      );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 48px' }}>

        {/* Top nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={() => setStep(0)} style={{
            background: 'transparent', border: 'none', color: '#7A9BB5', fontSize: 14, cursor: 'pointer'
          }}>← Overview</button>
          {saved && <span style={{ fontSize: 12, color: '#7ACCA0' }}>✓ Saved</span>}
        </div>

        {/* Step progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#7A9BB5' }}>Step {step} of {totalSteps}</span>
            <span style={{ fontSize: 12, color: '#7A9BB5' }}>{currentStep.emoji} {currentStep.title}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{
              height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${ACCENT}, #7ACCA0)`,
              width: `${(step / totalSteps) * 100}%`, transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Step content */}
        <div style={{ background: CARD, borderRadius: 16, border: BORDER, padding: '24px', marginBottom: 20 }}>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} style={{
            padding: '11px 24px', borderRadius: 10, border: BORDER,
            background: CARD, color: step === 1 ? '#4A6A8A' : '#E8EDF5',
            cursor: step === 1 ? 'default' : 'pointer', fontSize: 14
          }}>← Previous</button>

          {step < totalSteps ? (
            <button onClick={() => setStep(s => s + 1)} style={{
              padding: '11px 32px', borderRadius: 10, background: ACCENT,
              border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
            }}>Next →</button>
          ) : (
            <button onClick={() => { savePlan(plan); setStep(0); setViewMode(true); }} style={{
              padding: '11px 32px', borderRadius: 10, background: '#7ACCA0',
              border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
            }}>✓ Complete Plan</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyPlan;