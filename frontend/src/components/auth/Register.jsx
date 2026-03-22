import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Stars } from '../layout/Stars';
import { COLORS } from '../../constants/colors';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // ✅ Fixed: backend requires minimum 8 characters (was 6)
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);

    try {
      // ✅ Fixed: pass username (not name) to match backend requirement
      const result = await register(username.trim(), email, password);
      if (result.success) {
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #0A0F1A 0%, #1A2634 50%, #0A1520 100%)',
      padding: 20,
      position: 'relative'
    }}>
      <Stars />

      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: 32,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            margin: '0 auto 16px',
            background: 'radial-gradient(circle at 35% 35%, #A5C8D8, #4A6A8A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
          }}>🧭</div>
          <h2 style={{ fontSize: 24, color: COLORS.text.primary, margin: 0 }}>
            Create Account
          </h2>
          <p style={{ fontSize: 14, color: COLORS.text.muted, margin: '8px 0 0' }}>
            Join our community for personalized support
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: COLORS.text.secondary, marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: COLORS.text.primary, fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
              placeholder="Choose a username"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: COLORS.text.secondary, marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: COLORS.text.primary, fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: COLORS.text.secondary, marginBottom: 6 }}>
              Password <span style={{ color: COLORS.text.muted }}>(min. 8 characters)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: COLORS.text.primary, fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: COLORS.text.secondary, marginBottom: 6 }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: COLORS.text.primary, fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              padding: '12px', borderRadius: 8,
              background: `${COLORS.risk.high}20`,
              border: `1px solid ${COLORS.risk.high}40`,
              color: COLORS.risk.high, fontSize: 13, marginBottom: 20
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.accent.primary}, ${COLORS.accent.secondary || '#4A6A8A'})`,
              border: 'none', color: 'white', fontSize: 16, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s', marginBottom: 16
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: COLORS.accent.primary, textDecoration: 'none', fontSize: 14 }}>
              Already have an account? Sign in
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ color: COLORS.text.muted, textDecoration: 'none', fontSize: 12 }}>
              ← Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;