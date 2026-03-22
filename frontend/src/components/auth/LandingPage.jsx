import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';

const INPUT = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#E8EDF5', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const LABEL = { fontSize: 11, color: '#A5C8D8', display: 'block', marginBottom: 5 };

export function LandingPage({ onAnonymous, onLogin, onRegister }) {
  const [mode, setMode] = useState('landing');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAuth = async () => {
    setError('');

    // Validation
    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.'); return;
    }
    if (mode === 'register') {
      if (!form.username.trim()) { setError('Username is required.'); return; }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await login(form.email, form.password);
        if (result.success) {
          if (onLogin) onLogin();
          navigate('/chat');
        } else {
          setError(result.error || 'Login failed. Check your email and password.');
        }
      } else {
        // Register
        const result = await register(form.username.trim(), form.email, form.password);
        if (result.success) {
          // Auto-login after successful registration
          const loginResult = await login(form.email, form.password);
          if (loginResult.success) {
            // onRegister lets App.jsx decide: onboarding (new) or /chat (returning)
            if (onRegister) onRegister();
            else { if (onLogin) onLogin(); navigate('/chat'); }
          } else {
            setMode('login');
            setError('Account created! Please sign in.');
          }
        } else {
          setError(result.error || 'Registration failed. Try a different email.');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit on Enter from any field
  const onKey = (e) => { if (e.key === 'Enter' && !loading) handleAuth(); };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setForm({ username: '', email: '', password: '', confirm: '' });
  };

  // ── Landing ───────────────────────────────────────────────────────────
  if (mode === 'landing') return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: BG,
      fontFamily: "'Georgia', 'Times New Roman', serif", padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 500 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: 'radial-gradient(circle at 35% 35%, #A5C8D8, #4A6A8A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, boxShadow: '0 0 24px rgba(165,200,216,0.3)'
          }}>🕊️</div>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: '#E8EDF5', margin: '0 0 8px', letterSpacing: '0.01em' }}>
            SafeGuide
          </h1>
          <p style={{ fontSize: 13, color: '#7A9BB5', margin: '0 0 4px' }}>Mental Health Crisis Companion</p>
          <p style={{ fontSize: 11, color: '#4A6A8A', margin: 0 }}>Research Project · University of Technology</p>
        </div>

        {/* Entry options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              emoji: '🙈', title: 'Continue Anonymously',
              desc: 'No account needed. No data saved. Complete privacy.',
              action: onAnonymous
            },
            {
              emoji: '🔑', title: 'Sign In',
              desc: 'Access your conversation history and saved sessions.',
              action: () => setMode('login')
            },
            {
              emoji: '✨', title: 'Create Account',
              desc: 'Free account for mood tracking, journal & saved sessions.',
              action: () => setMode('register')
            },
            {
              emoji: '✅', title: 'Daily Check-in',
              desc: 'Quick 2-minute mood check-in — no account needed.',
              action: () => navigate('/checkin')
            },
          ].map(({ emoji, title, desc, action }) => (
            <div key={title} onClick={action} style={{
              padding: '18px 22px', borderRadius: 14, background: CARD,
              border: BORDER, cursor: 'pointer', transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', gap: 16
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(165,200,216,0.1)'; e.currentTarget.style.borderColor = 'rgba(165,200,216,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = CARD; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>{emoji}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, color: '#E8EDF5', margin: '0 0 3px', fontWeight: 500 }}>{title}</h3>
                <p style={{ fontSize: 12, color: '#7A9BB5', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
              <span style={{ color: '#4A6A8A', fontSize: 16, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        {/* Kenya crisis lines */}
        <div style={{
          marginTop: 22, padding: '14px 16px', borderRadius: 12,
          background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.25)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 12, color: '#E8EDF5', margin: '0 0 6px', fontWeight: 500 }}>
            🆘 In immediate danger? Call now — it's free
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:0800723253" style={{ color: '#E05555', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>EMKF: 0800 723 253</a>
            <span style={{ color: '#4A6A8A' }}>·</span>
            <a href="tel:0900620800" style={{ color: '#E05555', fontSize: 12, textDecoration: 'none' }}>Niskize: 0900 620 800</a>
            <span style={{ color: '#4A6A8A' }}>·</span>
            <a href="tel:+254722178177" style={{ color: '#E05555', fontSize: 12, textDecoration: 'none' }}>Befrienders: +254 722 178 177</a>
          </div>
        </div>

        <p style={{ fontSize: 10, color: '#4A6A8A', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
          Research project prototype. Not a substitute for professional medical care.
        </p>
      </div>
    </div>
  );

  // ── Auth form (login / register) ──────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: BG, padding: 20
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 20, border: BORDER, padding: '32px 28px'
      }}>
        <button onClick={() => { setMode('landing'); setError(''); }} style={{
          background: 'transparent', border: 'none', color: '#7A9BB5',
          cursor: 'pointer', fontSize: 13, marginBottom: 20
        }}>← Back</button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px',
            background: 'radial-gradient(circle at 35% 35%, #A5C8D8, #4A6A8A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
          }}>🧭</div>
          <h2 style={{ fontSize: 21, color: '#E8EDF5', margin: 0, fontWeight: 400 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ fontSize: 13, color: '#7A9BB5', margin: '6px 0 0' }}>
            {mode === 'login' ? 'Sign in to continue your journey' : 'Join for personalized support'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Username — register only */}
          {mode === 'register' && (
            <div>
              <label style={LABEL}>Username</label>
              <input type="text" value={form.username}
                onChange={e => set('username', e.target.value)} onKeyDown={onKey}
                placeholder="Choose a username" style={INPUT}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={LABEL}>Email</label>
            <input type="email" value={form.email}
              onChange={e => set('email', e.target.value)} onKeyDown={onKey}
              placeholder="you@example.com" style={INPUT}
              onFocus={e => e.target.style.borderColor = ACCENT}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
          </div>

          {/* Password */}
          <div>
            <label style={LABEL}>
              Password{mode === 'register' && <span style={{ color: '#4A6A8A' }}> (min. 8 characters)</span>}
            </label>
            <input type="password" value={form.password}
              onChange={e => set('password', e.target.value)} onKeyDown={onKey}
              placeholder="••••••••" style={INPUT}
              onFocus={e => e.target.style.borderColor = ACCENT}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
          </div>

          {/* Confirm password — register only */}
          {mode === 'register' && (
            <div>
              <label style={LABEL}>Confirm Password</label>
              <input type="password" value={form.confirm}
                onChange={e => set('confirm', e.target.value)} onKeyDown={onKey}
                placeholder="••••••••" style={INPUT}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
            </div>
          )}

          {/* Error / success message */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: error.includes('created') ? 'rgba(122,204,160,0.12)' : 'rgba(220,80,80,0.12)',
              border: error.includes('created') ? '1px solid rgba(122,204,160,0.3)' : '1px solid rgba(220,80,80,0.3)',
              fontSize: 13, color: error.includes('created') ? '#7ACCA0' : '#E05555', lineHeight: 1.5
            }}>{error}</div>
          )}

          {/* Submit */}
          <button onClick={handleAuth} disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 10,
            background: loading ? 'rgba(74,143,168,0.3)' : ACCENT,
            border: 'none', color: loading ? '#7A9BB5' : '#fff',
            fontSize: 15, cursor: loading ? 'default' : 'pointer',
            marginTop: 4, opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s', fontWeight: 500
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Switch mode */}
          <p style={{ fontSize: 12, color: '#7A9BB5', textAlign: 'center', margin: '4px 0 0' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} style={{
              background: 'transparent', border: 'none', color: '#A5C8D8',
              cursor: 'pointer', fontSize: 12, textDecoration: 'underline', padding: 0
            }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}