import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Stars } from '../layout/Stars';
import { COLORS } from '../../constants/colors';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.error || 'Login failed');
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
        border: '1px solid rgba(255, 255, 255, 0.08)', // ✅ Fixed
        padding: 32,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            margin: '0 auto 16px',
            background: 'radial-gradient(circle at 35% 35%, #A5C8D8, #4A6A8A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28
          }}>
            🧭
          </div>
          <h2 style={{
            fontSize: 24,
            color: COLORS.text.primary,
            margin: 0
          }}>
            Welcome Back
          </h2>
          <p style={{
            fontSize: 14,
            color: COLORS.text.muted,
            margin: '8px 0 0'
          }}>
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              color: COLORS.text.secondary,
              marginBottom: 6
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)', // ✅ Fixed
                color: COLORS.text.primary,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              color: COLORS.text.secondary,
              marginBottom: 6
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)', // ✅ Fixed
                color: COLORS.text.primary,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: '12px',
              borderRadius: 8,
              background: `${COLORS.risk.high}20`,           // ✅ Fixed: template literal
              border: `1px solid ${COLORS.risk.high}40`,     // ✅ Fixed: template literal
              color: COLORS.risk.high,
              fontSize: 13,
              marginBottom: 20
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.accent.primary}, ${COLORS.accent.secondary || '#4A6A8A'})`, // ✅ Fixed
              border: 'none',
              color: 'white',
              fontSize: 16,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              marginBottom: 16
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/register"
              style={{
                color: COLORS.accent.primary,
                textDecoration: 'none',
                fontSize: 14
              }}
            >
              Don't have an account? Sign up
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link
              to="/"
              style={{
                color: COLORS.text.muted,
                textDecoration: 'none',
                fontSize: 12
              }}
            >
              ← Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;