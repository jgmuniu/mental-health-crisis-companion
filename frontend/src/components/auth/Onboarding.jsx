import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';
const ONBOARDING_KEY = 'safeguide_onboarding_done';

// ── Check if user has seen onboarding ────────────────────────────────────
export const hasSeenOnboarding = () => !!localStorage.getItem(ONBOARDING_KEY);
export const markOnboardingDone = () => localStorage.setItem(ONBOARDING_KEY, '1');

// ── Step definitions ──────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'welcome',
    emoji: '🕊️',
    title: 'Welcome to SafeGuide',
    subtitle: 'Your safe space to be heard',
    content: null, // custom render
  },
  {
    id: 'what',
    emoji: '🤝',
    title: 'What SafeGuide does',
    subtitle: 'A companion, not a replacement',
    content: [
      { emoji: '💬', text: 'Listens without judgment, 24 hours a day' },
      { emoji: '🌡', text: 'Tracks your mood over time so you can see patterns' },
      { emoji: '🛡', text: 'Helps you build a personal safety plan' },
      { emoji: '🌬', text: 'Guides you through breathing and grounding exercises' },
      { emoji: '🇰🇪', text: 'Connects you to free Kenya crisis lines when needed' },
    ],
    note: 'SafeGuide is a supportive tool, not a substitute for professional care.',
  },
  {
    id: 'privacy',
    emoji: '🔒',
    title: 'Your privacy',
    subtitle: 'What stays on your device',
    content: [
      { emoji: '📓', text: 'Journal entries — stored only on this device, never uploaded' },
      { emoji: '🌡', text: 'Mood log — stays local, never shared' },
      { emoji: '🛡', text: 'Safety plan — private to you, printable when you need it' },
      { emoji: '👥', text: 'Trusted contacts — saved locally, alerts go directly from your device' },
    ],
    note: 'Chat sessions are saved to your account so you can review them later. Anonymous users\' chats are never saved.',
  },
  {
    id: 'crisis',
    emoji: '🚨',
    title: 'If you\'re in crisis',
    subtitle: 'Real people are available right now',
    content: null, // custom render
  },
  {
    id: 'contact',
    emoji: '👥',
    title: 'Add a trusted contact',
    subtitle: 'Someone who can help in a difficult moment',
    content: null, // custom render — contact form
  },
  {
    id: 'checkin',
    emoji: '✅',
    title: 'Daily check-ins',
    subtitle: 'Two minutes a day makes a difference',
    content: [
      { emoji: '☀️', text: 'A quick morning or evening check-in takes about 2 minutes' },
      { emoji: '🌡', text: 'Log your mood and answer one reflection question' },
      { emoji: '📈', text: 'See your mood trends on your dashboard over time' },
      { emoji: '🔔', text: 'Optional reminders to help you build the habit' },
    ],
    note: null,
  },
  {
    id: 'ready',
    emoji: '💙',
    title: 'You\'re all set',
    subtitle: 'SafeGuide is ready when you need it',
    content: null, // custom render
  },
];

// ── Progress dots ─────────────────────────────────────────────────────────
const ProgressDots = ({ current, total }) => (
  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        width: i === current ? 20 : 7, height: 7, borderRadius: 4,
        background: i === current ? ACCENT : i < current ? '#4A6A8A' : 'rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease'
      }} />
    ))}
  </div>
);

// ── Feature list ──────────────────────────────────────────────────────────
const FeatureList = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {items.map((item, i) => (
      <div key={i} style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '12px 16px', background: CARD, borderRadius: 12, border: BORDER
      }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
        <p style={{ margin: 0, fontSize: 14, color: '#D0D8E4', lineHeight: 1.6 }}>{item.text}</p>
      </div>
    ))}
  </div>
);

// ── Main Onboarding component ─────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relationship: '' });
  const [contactSaved, setContactSaved] = useState(false);
  const [notifChoice, setNotifChoice] = useState(null); // 'yes' | 'no' | null
  const [direction, setDirection] = useState('forward');

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const goNext = () => {
    setDirection('forward');
    if (isLast) {
      markOnboardingDone();
      navigate('/chat');
    } else {
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection('back');
    setStep(s => s - 1);
  };

  const skip = () => {
    markOnboardingDone();
    navigate('/chat');
  };

  const saveContact = () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('safeguide_trusted_contacts') || '[]');
      const updated = [...existing, { id: Date.now().toString(), ...contactForm, preferredMethod: 'whatsapp' }];
      localStorage.setItem('safeguide_trusted_contacts', JSON.stringify(updated));
      setContactSaved(true);
    } catch {}
  };

  const enableNotifications = async () => {
    try {
      const result = await Notification.requestPermission();
      setNotifChoice(result === 'granted' ? 'yes' : 'no');
      if (result === 'granted') {
        // Save default schedule
        const schedule = {
          enabled: true,
          morningCheckin:  { enabled: true,  time: '08:00' },
          eveningMood:     { enabled: true,  time: '20:00' },
          journalReminder: { enabled: false, time: '21:00' },
          breathingBreak:  { enabled: false, time: '13:00' },
          weeklyReflection:{ enabled: false, day: 0, time: '10:00' },
        };
        localStorage.setItem('safeguide_notifications', JSON.stringify(schedule));
      }
    } catch { setNotifChoice('no'); }
  };

  // ── Custom step renders ───────────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep.id) {

      case 'welcome': return (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#A5C8D8', margin: '0 0 20px', lineHeight: 1.8 }}>
            Hello{user?.username ? `, ${user.username}` : ''}. We're glad you're here.
          </p>
          <p style={{ fontSize: 14, color: '#7A9BB5', margin: '0 0 28px', lineHeight: 1.8 }}>
            SafeGuide is a mental health companion built for Kenya.
            It's a safe, private place to be heard — any time of day or night.
          </p>
          <div style={{
            padding: '14px 18px', background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}30`, borderRadius: 12, marginBottom: 8
          }}>
            <p style={{ margin: 0, fontSize: 13, color: '#A5C8D8', lineHeight: 1.7 }}>
              This short introduction will take about <strong style={{ color: '#E8EDF5' }}>2 minutes</strong>.
              You can skip it at any time.
            </p>
          </div>
        </div>
      );

      case 'crisis': return (
        <div>
          <p style={{ fontSize: 14, color: '#7A9BB5', margin: '0 0 20px', lineHeight: 1.7 }}>
            If you or someone you know is in immediate danger, please reach out to one of these free services right now.
          </p>
          {[
            { name: 'EMKF Crisis Hotline', phone: '0800 723 253', tel: '0800723253', note: 'Free · 24/7 · Nationwide' },
            { name: 'Niskize', phone: '0900 620 800', tel: '0900620800', note: '24/7 · Depression, anxiety, trauma' },
            { name: 'Befrienders Kenya', phone: '+254 722 178 177', tel: '+254722178177', note: 'Mon–Fri, 7AM–7PM' },
            { name: 'Emergency Services', phone: '999', tel: '999', note: 'Immediate danger' },
          ].map(({ name, phone, tel, note }) => (
            <div key={tel} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', marginBottom: 8,
              background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.2)',
              borderRadius: 12, gap: 12
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: '#E8EDF5', fontWeight: 500 }}>{name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7A9BB5' }}>{note}</p>
              </div>
              <a href={`tel:${tel}`} style={{
                padding: '8px 16px', background: 'rgba(220,80,80,0.15)',
                border: '1px solid rgba(220,80,80,0.35)', borderRadius: 8,
                color: '#E05555', textDecoration: 'none', fontSize: 13, fontWeight: 600, flexShrink: 0
              }}>📞 {phone}</a>
            </div>
          ))}
          <p style={{ fontSize: 12, color: '#4A6A8A', marginTop: 12, lineHeight: 1.6 }}>
            These numbers are saved in the Crisis Resources section of the app so you can always find them quickly.
          </p>
        </div>
      );

      case 'contact': return (
        <div>
          <p style={{ fontSize: 14, color: '#7A9BB5', margin: '0 0 18px', lineHeight: 1.7 }}>
            A trusted contact is someone SafeGuide can help you alert in a crisis — a friend, family member, or counsellor.
          </p>
          {contactSaved ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, color: '#7ACCA0', margin: '0 0 6px', fontWeight: 500 }}>
                {contactForm.name} saved!
              </p>
              <p style={{ fontSize: 13, color: '#7A9BB5', margin: 0 }}>
                You can add more contacts anytime from the Trusted Contacts page.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'name', label: 'Their name', placeholder: 'e.g. Amina Wanjiku', type: 'text' },
                { key: 'relationship', label: 'Relationship', placeholder: 'e.g. Sister, Friend, Therapist', type: 'text' },
                { key: 'phone', label: 'Phone number', placeholder: '+254 7XX XXX XXX', type: 'tel' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: '#A5C8D8', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input
                    type={type}
                    value={contactForm[key]}
                    onChange={e => setContactForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#E8EDF5', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
              <button
                onClick={saveContact}
                disabled={!contactForm.name.trim() || !contactForm.phone.trim()}
                style={{
                  padding: '11px', borderRadius: 10,
                  background: contactForm.name.trim() && contactForm.phone.trim() ? ACCENT : 'rgba(74,143,168,0.2)',
                  border: 'none', color: contactForm.name.trim() && contactForm.phone.trim() ? '#fff' : '#4A6A8A',
                  cursor: contactForm.name.trim() && contactForm.phone.trim() ? 'pointer' : 'default',
                  fontSize: 14, fontWeight: 500, marginTop: 4
                }}
              >Save Contact</button>
              <button onClick={goNext} style={{
                background: 'transparent', border: 'none', color: '#4A6A8A',
                cursor: 'pointer', fontSize: 13, padding: '4px 0', textAlign: 'center'
              }}>Skip for now — I'll add contacts later</button>
            </div>
          )}
        </div>
      );

      case 'checkin': return (
        <div>
          <FeatureList items={STEPS.find(s => s.id === 'checkin').content} />
          <div style={{ marginTop: 20 }}>
            {notifChoice === null ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#7A9BB5', margin: '0 0 14px' }}>
                  Would you like daily reminders for your check-in?
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button onClick={enableNotifications} style={{
                    padding: '10px 22px', background: ACCENT, border: 'none',
                    borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
                  }}>🔔 Yes, remind me</button>
                  <button onClick={() => setNotifChoice('no')} style={{
                    padding: '10px 22px', background: CARD, border: BORDER,
                    borderRadius: 10, color: '#7A9BB5', cursor: 'pointer', fontSize: 14
                  }}>Not now</button>
                </div>
              </div>
            ) : notifChoice === 'yes' ? (
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <span style={{ fontSize: 32 }}>✅</span>
                <p style={{ fontSize: 14, color: '#7ACCA0', margin: '8px 0 0' }}>
                  Reminders enabled! You can adjust times in Settings → Reminders.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <p style={{ fontSize: 13, color: '#4A6A8A', margin: 0 }}>
                  No problem — you can enable reminders anytime from Settings.
                </p>
              </div>
            )}
          </div>
        </div>
      );

      case 'ready': return (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#A5C8D8', margin: '0 0 20px', lineHeight: 1.8 }}>
            SafeGuide is ready. Rafiki is listening.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { emoji: '💬', label: 'Talk to Rafiki', desc: 'Your AI companion, available 24/7' },
              { emoji: '✅', label: 'Daily check-in', desc: 'Track how you feel each day' },
              { emoji: '🛡', label: 'Safety plan', desc: 'Build your personal crisis plan' },
              { emoji: '📚', label: 'Crisis resources', desc: 'Kenya crisis lines, always accessible' },
            ].map(({ emoji, label, desc }) => (
              <div key={label} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '10px 14px', background: CARD, borderRadius: 10, border: BORDER
              }}>
                <span style={{ fontSize: 20 }}>{emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#E8EDF5', fontWeight: 500 }}>{label}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: '#7A9BB5' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#4A6A8A', lineHeight: 1.6 }}>
            Remember — you are not alone. SafeGuide is here whenever you need it.
          </p>
        </div>
      );

      default:
        return currentStep.content ? <FeatureList items={currentStep.content} /> : null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: BG, color: '#E8EDF5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <ProgressDots current={step} total={STEPS.length} />

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: BORDER,
          padding: '28px 28px 24px', marginBottom: 16,
          animation: 'onboardFade 0.3s ease'
        }}>
          <style>{`@keyframes onboardFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

          {/* Step header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{currentStep.emoji}</div>
            <h2 style={{ fontSize: 22, color: '#E8EDF5', margin: '0 0 6px', fontWeight: 400 }}>
              {currentStep.title}
            </h2>
            <p style={{ fontSize: 13, color: '#7A9BB5', margin: 0 }}>{currentStep.subtitle}</p>
          </div>

          {renderStepContent()}

          {/* Note */}
          {currentStep.note && (
            <div style={{
              marginTop: 16, padding: '10px 14px',
              background: 'rgba(74,143,168,0.08)', border: `1px solid ${ACCENT}25`,
              borderRadius: 8, fontSize: 12, color: '#7A9BB5', lineHeight: 1.6
            }}>
              ℹ️ {currentStep.note}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {step > 0 && (
            <button onClick={goBack} style={{
              padding: '12px 18px', background: CARD, border: BORDER,
              borderRadius: 10, color: '#7A9BB5', cursor: 'pointer', fontSize: 14
            }}>←</button>
          )}
          <button onClick={goNext} style={{
            flex: 1, padding: '13px', background: ACCENT, border: 'none',
            borderRadius: 10, color: '#fff', cursor: 'pointer',
            fontSize: 15, fontWeight: 500, transition: 'all 0.2s'
          }}>
            {isLast ? 'Start using SafeGuide →' : step === 0 ? 'Get started →' : 'Next →'}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button onClick={skip} style={{
            display: 'block', width: '100%', marginTop: 10,
            background: 'transparent', border: 'none',
            color: '#4A6A8A', cursor: 'pointer', fontSize: 12, textAlign: 'center'
          }}>Skip introduction</button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;