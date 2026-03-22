import React, { useState, useEffect } from 'react';
import { loadContacts, buildAlertMessage, sendAlert } from '../../hooks/useTrustedContacts';

// Shown inside chat when riskLevel >= 2 and trusted contacts exist
export const TrustedContactAlert = ({ riskLevel, userName, language = 'en' }) => {
  const [contacts, setContacts] = useState([]);
  const [sent, setSent] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setContacts(loadContacts());
  }, []);

  // Only show for high/crisis risk and if contacts exist
  if (contacts.length === 0 || dismissed || riskLevel < 2) return null;

  const isCrisis = riskLevel >= 3;

  const handleAlert = (contact) => {
    const message = buildAlertMessage(contact, userName, language);
    sendAlert(contact, message);
    setSent(prev => ({ ...prev, [contact.id]: true }));
  };

  return (
    <div style={{
      margin: '8px 20px',
      background: isCrisis ? 'rgba(220,80,80,0.12)' : 'rgba(212,160,23,0.08)',
      border: isCrisis ? '1px solid rgba(220,80,80,0.35)' : '1px solid rgba(212,160,23,0.3)',
      borderRadius: 14,
      overflow: 'hidden',
      animation: 'alertSlideIn 0.3s ease'
    }}>
      <style>{`@keyframes alertSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header row */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{isCrisis ? '🚨' : '💛'}</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#E8EDF5' }}>
              {isCrisis ? 'Would you like to alert someone you trust?' : 'Your trusted contacts are here for you'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7A9BB5' }}>
              {contacts.length} trusted contact{contacts.length > 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setExpanded(v => !v)} style={{
            padding: '5px 12px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
            color: '#E8EDF5', cursor: 'pointer', fontSize: 12
          }}>
            {expanded ? 'Hide' : 'Alert someone'}
          </button>
          <button onClick={() => setDismissed(true)} style={{
            background: 'transparent', border: 'none',
            color: '#4A6A8A', cursor: 'pointer', fontSize: 16, padding: '0 4px'
          }}>✕</button>
        </div>
      </div>

      {/* Expanded contact list */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: 11, color: '#7A9BB5', margin: '12px 0 10px' }}>
            Tap a name to send them a message letting them know you need support.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contacts.map(contact => (
              <div key={contact.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #4A6A8A, #A5C8D8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, color: '#fff', fontWeight: 600
                }}>{contact.name.charAt(0).toUpperCase()}</div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#E8EDF5', fontWeight: 500 }}>{contact.name}</p>
                  {contact.relationship && (
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#7A9BB5' }}>{contact.relationship}</p>
                  )}
                </div>

                <button onClick={() => handleAlert(contact)} style={{
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 12, fontWeight: 500, flexShrink: 0, transition: 'all 0.2s',
                  background: sent[contact.id] ? 'rgba(122,204,160,0.15)' : 'rgba(220,80,80,0.15)',
                  border: sent[contact.id] ? '1px solid rgba(122,204,160,0.4)' : '1px solid rgba(220,80,80,0.35)',
                  color: sent[contact.id] ? '#7ACCA0' : '#E05555'
                }}>
                  {sent[contact.id] ? '✓ Sent' : '🚨 Alert'}
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#4A6A8A', margin: '10px 0 0', lineHeight: 1.5 }}>
            This will open WhatsApp/SMS/email with a pre-written message. You confirm before it sends.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrustedContactAlert;