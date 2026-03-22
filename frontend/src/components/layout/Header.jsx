import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SettingsPanel } from './SettingsPanel';

export const Header = ({
  isSpeaking = false,
  voiceEnabled = true,
  onToggleVoice,
  onReplayLast,
  onShowMap,
  onLogout: propsOnLogout,
  showCrisisButton = true,
  showVoiceControls = true,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    if (propsOnLogout) propsOnLogout();
  };

  const handleShowMap = () => {
    if (onShowMap) onShowMap();
    else navigate('/map');
  };

  // Voice button label & class
  const voiceClass = [
    'voice-toggle',
    isSpeaking ? 'speaking' : '',
    !voiceEnabled ? 'muted' : '',
  ].filter(Boolean).join(' ');

  const VoiceLabel = () => {
    if (isSpeaking && voiceEnabled) return (
      <><div className="speaking-bars">
        <div className="bar"/><div className="bar"/><div className="bar"/>
        <div className="bar"/><div className="bar"/>
      </div>Speaking…</>
    );
    if (voiceEnabled)  return <>🔊 Voice On</>;
    return <>🔇 Muted</>;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        .header-root { font-family: 'DM Sans', sans-serif; }

        .header-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #A5C8D8; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .header-btn:hover {
          background: rgba(165,200,216,0.12);
          border-color: rgba(165,200,216,0.3);
          color: #E8EEF4; transform: translateY(-1px);
        }
        .header-btn.crisis {
          border-color: rgba(224,85,85,0.4);
          background: rgba(224,85,85,0.08); color: #FF8080;
        }
        .header-btn.crisis:hover {
          background: rgba(224,85,85,0.18);
          border-color: rgba(224,85,85,0.6); color: #FFB0B0;
          box-shadow: 0 0 16px rgba(224,85,85,0.25);
        }
        .header-btn.settings-btn { padding: 7px 10px; font-size: 16px; }
        .header-btn.settings-btn.active {
          background: rgba(74,143,168,0.2);
          border-color: rgba(74,143,168,0.5); color: #A5C8D8;
        }

        /* Voice toggle — three visual states */
        .voice-toggle {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: all 0.2s ease;
          /* default: on */
          border: 1px solid rgba(165,200,216,0.25);
          background: rgba(165,200,216,0.07); color: #A5C8D8;
        }
        .voice-toggle:hover {
          background: rgba(165,200,216,0.14);
          border-color: rgba(165,200,216,0.4);
        }
        /* speaking */
        .voice-toggle.speaking {
          border-color: rgba(165,200,216,0.55);
          background: rgba(165,200,216,0.12);
          box-shadow: 0 0 18px rgba(165,200,216,0.18);
          animation: speakPulse 1.5s ease-in-out infinite;
        }
        /* muted — clearly different so user knows it's off */
        .voice-toggle.muted {
          border: 1px solid rgba(224,85,85,0.3);
          background: rgba(224,85,85,0.06);
          color: #E07070;
        }
        .voice-toggle.muted:hover {
          background: rgba(224,85,85,0.12);
          border-color: rgba(224,85,85,0.5);
          color: #FF9090;
        }

        @keyframes speakPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(165,200,216,0.15); }
          50%       { box-shadow: 0 0 24px rgba(165,200,216,0.35); }
        }

        .speaking-bars { display: flex; align-items: center; gap: 2px; height: 14px; }
        .bar { width: 2px; background: #A5C8D8; border-radius: 2px; animation: barAnim 0.8s ease-in-out infinite; }
        .bar:nth-child(1) { height: 4px;  animation-delay: 0s;    }
        .bar:nth-child(2) { height: 10px; animation-delay: 0.15s; }
        .bar:nth-child(3) { height: 14px; animation-delay: 0.3s;  }
        .bar:nth-child(4) { height: 8px;  animation-delay: 0.45s; }
        .bar:nth-child(5) { height: 4px;  animation-delay: 0.6s;  }
        @keyframes barAnim {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50%       { transform: scaleY(1);   opacity: 1;   }
        }

        .user-chip { display: flex; align-items: center; gap: 8px; padding: 5px 10px 5px 5px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
        .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #4A6A8A, #A5C8D8); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #fff; flex-shrink: 0; }
        .user-name { font-size: 12px; color: #8A9BAE; font-weight: 500; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .divider { width: 1px; height: 20px; background: rgba(255,255,255,0.08); flex-shrink: 0; }

        .logo-mark { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #2A3F58 0%, #4A6A8A 50%, #A5C8D8 100%); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; box-shadow: 0 2px 12px rgba(74,106,138,0.4); transition: transform 0.2s ease; }
        .logo-wrap:hover .logo-mark { transform: scale(1.05); }
        .logo-title { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; color: #E8EEF4; letter-spacing: -0.3px; }
        .logo-sub { font-size: 10px; color: #5A7A8A; font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 1px; }

        .mobile-menu-btn { display: none; flex-direction: column; gap: 4px; padding: 8px; background: transparent; border: none; cursor: pointer; }
        .mobile-menu-btn span { display: block; width: 20px; height: 2px; background: #8A9BAE; border-radius: 2px; transition: all 0.2s ease; }
        .mobile-nav { display: none; position: fixed; top: 61px; left: 0; right: 0; background: rgba(10,15,26,0.98); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 12px 16px 16px; flex-direction: column; gap: 8px; z-index: 49; backdrop-filter: blur(16px); }
        .mobile-nav.open { display: flex; }
        .mobile-nav .header-btn, .mobile-nav .voice-toggle { justify-content: center; width: 100%; }

        @media (max-width: 768px) {
          .desktop-controls { display: none !important; }
          .mobile-menu-btn { display: flex; }
        }
      `}</style>

      <header className="header-root" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '0 20px', height: 61,
        background: scrolled ? 'rgba(8,12,22,0.97)' : 'rgba(10,15,26,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : '0 2px 16px rgba(0,0,0,0.3)',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}>

        {/* Logo */}
        <div className="logo-wrap" onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
          <div className="logo-mark">🧭</div>
          <div>
            <div className="logo-title">SafeGuide</div>
            <div className="logo-sub">Crisis Support</div>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="desktop-controls" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showVoiceControls && (
            <>
              <button
                className={voiceClass}
                onClick={onToggleVoice}
                title={voiceEnabled ? 'Click to mute voice' : 'Click to unmute voice'}
              >
                <VoiceLabel />
              </button>

              {onReplayLast && voiceEnabled && (
                <button className="header-btn" onClick={onReplayLast} title="Replay last message">
                  ↩ Replay
                </button>
              )}
              <div className="divider" />
            </>
          )}

          <button className="header-btn" onClick={handleShowMap}>🗺 Map</button>
          <button className="header-btn" onClick={() => navigate('/breathing')}>🌬 Breathe</button>
          <button className="header-btn" onClick={() => navigate('/safety-plan')}>🛡 Safety Plan</button>
          <button className="header-btn" onClick={() => navigate('/journal')}>📓 Journal</button>
          <button className="header-btn" onClick={() => navigate('/checkin')}>✅ Check-in</button>
          <button className="header-btn" onClick={() => navigate('/trusted-contacts')}>👥 Contacts</button>
          <button className="header-btn" onClick={() => navigate('/notifications')}>🔔 Reminders</button>

          {showCrisisButton && (
            <button className="header-btn crisis" onClick={() => navigate('/resources')}>
              🚨 Crisis Help
            </button>
          )}

          <div className="divider" />

          {user && (
            <div className="user-chip">
              <div className="user-avatar">
                {(user.username || user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.username || user.name || 'User'}</span>
            </div>
          )}

          <button
            className={`header-btn settings-btn ${settingsOpen ? 'active' : ''}`}
            onClick={() => setSettingsOpen(v => !v)}
            title="Settings"
          >⚙</button>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
          <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
        </button>
      </header>

      {/* Mobile nav */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        {showVoiceControls && (
          <>
            <button className={voiceClass} onClick={() => { onToggleVoice?.(); setMenuOpen(false); }}>
              {voiceEnabled ? '🔊 Voice On — tap to mute' : '🔇 Muted — tap to unmute'}
            </button>
            {onReplayLast && voiceEnabled && (
              <button className="header-btn" onClick={() => { onReplayLast(); setMenuOpen(false); }}>
                ↩ Replay Last
              </button>
            )}
          </>
        )}
        <button className="header-btn" onClick={() => { handleShowMap(); setMenuOpen(false); }}>🗺 Map</button>
        <button className="header-btn" onClick={() => { navigate('/breathing'); setMenuOpen(false); }}>🌬 Breathe</button>
        <button className="header-btn" onClick={() => { navigate('/checkin'); setMenuOpen(false); }}>✅ Check-in</button>
        <button className="header-btn" onClick={() => { navigate('/trusted-contacts'); setMenuOpen(false); }}>👥 Contacts</button>
        <button className="header-btn" onClick={() => { navigate('/notifications'); setMenuOpen(false); }}>🔔 Reminders</button>
        {showCrisisButton && (
          <button className="header-btn crisis" onClick={() => { navigate('/resources'); setMenuOpen(false); }}>
            🚨 Crisis Help
          </button>
        )}
        <button className="header-btn settings-btn" onClick={() => { setSettingsOpen(true); setMenuOpen(false); }}>
          ⚙ Settings
        </button>
      </nav>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Header;