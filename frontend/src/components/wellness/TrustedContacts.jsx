import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrustedContacts, buildAlertMessage, sendAlert } from '../../hooks/useTrustedContacts';
import { useAuth } from '../../contexts/AuthContext';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';

const METHODS = [
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬', color: '#25D366' },
  { id: 'sms',      label: 'SMS',      emoji: '📱', color: '#A5C8D8' },
  { id: 'email',    label: 'Email',    emoji: '✉️', color: '#4A8FA8' },
];

const EMPTY_CONTACT = { name: '', phone: '', email: '', relationship: '', preferredMethod: 'whatsapp' };

// ── Contact form ──────────────────────────────────────────────────────────
const ContactForm = ({ initial = EMPTY_CONTACT, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...EMPTY_CONTACT, ...initial });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() && !form.email.trim()) e.contact = 'Phone or email is required';
    if (form.preferredMethod === 'whatsapp' && !form.phone.trim()) e.contact = 'WhatsApp requires a phone number';
    if (form.preferredMethod === 'sms' && !form.phone.trim()) e.contact = 'SMS requires a phone number';
    if (form.preferredMethod === 'email' && !form.email.trim()) e.contact = 'Email method requires an email address';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(form);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#E8EDF5', outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ fontSize: 11, color: '#A5C8D8', display: 'block', marginBottom: 5 }}>Name *</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="e.g. Amina Wanjiku" style={inputStyle} />
        {errors.name && <p style={{ fontSize: 11, color: '#E05555', margin: '4px 0 0' }}>{errors.name}</p>}
      </div>

      <div>
        <label style={{ fontSize: 11, color: '#A5C8D8', display: 'block', marginBottom: 5 }}>Relationship</label>
        <input type="text" value={form.relationship} onChange={e => set('relationship', e.target.value)}
          placeholder="e.g. Sister, Friend, Therapist" style={inputStyle} />
      </div>

      <div>
        <label style={{ fontSize: 11, color: '#A5C8D8', display: 'block', marginBottom: 5 }}>Phone number</label>
        <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
          placeholder="+254 7XX XXX XXX" style={inputStyle} />
      </div>

      <div>
        <label style={{ fontSize: 11, color: '#A5C8D8', display: 'block', marginBottom: 5 }}>Email address</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="friend@example.com" style={inputStyle} />
      </div>

      {errors.contact && <p style={{ fontSize: 11, color: '#E05555', margin: '-4px 0 0' }}>{errors.contact}</p>}

      <div>
        <label style={{ fontSize: 11, color: '#A5C8D8', display: 'block', marginBottom: 8 }}>Preferred alert method</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={() => set('preferredMethod', m.id)} style={{
              flex: 1, padding: '8px 6px', borderRadius: 10, cursor: 'pointer',
              background: form.preferredMethod === m.id ? `${m.color}20` : 'rgba(255,255,255,0.04)',
              border: form.preferredMethod === m.id ? `1px solid ${m.color}60` : BORDER,
              color: form.preferredMethod === m.id ? m.color : '#7A9BB5',
              fontSize: 12, transition: 'all 0.15s', textAlign: 'center'
            }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{m.emoji}</div>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={handleSave} style={{
          flex: 1, padding: '10px', background: ACCENT, border: 'none',
          borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
        }}>Save Contact</button>
        <button onClick={onCancel} style={{
          padding: '10px 16px', background: CARD, border: BORDER,
          borderRadius: 8, color: '#7A9BB5', cursor: 'pointer', fontSize: 14
        }}>Cancel</button>
      </div>
    </div>
  );
};

// ── Contact card ──────────────────────────────────────────────────────────
const ContactCard = ({ contact, onEdit, onRemove, onAlert, userName }) => {
  const [previewing, setPreviewing] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const method = METHODS.find(m => m.id === contact.preferredMethod) || METHODS[0];
  const previewMsg = buildAlertMessage(contact, userName, 'en');

  const handleAlert = () => {
    onAlert(contact);
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 4000);
  };

  return (
    <div style={{ background: CARD, borderRadius: 14, border: BORDER, padding: '16px 18px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #4A6A8A, #A5C8D8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 600, color: '#fff'
        }}>
          {contact.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 15, color: '#E8EDF5', fontWeight: 500 }}>{contact.name}</p>
          {contact.relationship && (
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#7A9BB5' }}>{contact.relationship}</p>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {contact.phone && (
              <span style={{ fontSize: 11, color: '#4A6A8A' }}>📞 {contact.phone}</span>
            )}
            {contact.email && (
              <span style={{ fontSize: 11, color: '#4A6A8A' }}>✉️ {contact.email}</span>
            )}
          </div>
          <div style={{ marginTop: 6 }}>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: `${method.color}15`, color: method.color,
              border: `1px solid ${method.color}30`
            }}>
              {method.emoji} via {method.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onEdit} style={{
            padding: '5px 10px', background: CARD, border: BORDER,
            borderRadius: 6, color: '#7A9BB5', cursor: 'pointer', fontSize: 11
          }}>Edit</button>
          <button onClick={onRemove} style={{
            padding: '5px 10px', background: 'transparent',
            border: '1px solid rgba(220,80,80,0.3)',
            borderRadius: 6, color: '#E05555', cursor: 'pointer', fontSize: 11
          }}>Remove</button>
        </div>
      </div>

      {/* Alert button + preview */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleAlert} style={{
            padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: alertSent ? 'rgba(122,204,160,0.1)' : 'rgba(220,80,80,0.1)',
            border: alertSent ? '1px solid rgba(122,204,160,0.4)' : '1px solid rgba(220,80,80,0.3)',
            color: alertSent ? '#7ACCA0' : '#E05555',
            transition: 'all 0.2s'
          }}>
            {alertSent ? '✓ Alert sent!' : `🚨 Send Alert to ${contact.name.split(' ')[0]}`}
          </button>
          <button onClick={() => setPreviewing(v => !v)} style={{
            padding: '8px 12px', background: 'transparent', border: BORDER,
            borderRadius: 8, color: '#4A6A8A', cursor: 'pointer', fontSize: 12
          }}>
            {previewing ? 'Hide preview' : 'Preview message'}
          </button>
        </div>

        {previewing && (
          <div style={{
            marginTop: 10, padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)', border: BORDER, borderRadius: 8,
            fontSize: 12, color: '#7A9BB5', lineHeight: 1.7,
            whiteSpace: 'pre-wrap', maxHeight: 180, overflowY: 'auto'
          }}>
            {previewMsg}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────
const TrustedContacts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contacts, saveContact, removeContact, alertContact, alertAll } = useTrustedContacts();
  const [editing, setEditing] = useState(null);   // null | 'new' | index
  const [alertingAll, setAlertingAll] = useState(false);
  const [allAlertSent, setAllAlertSent] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null);

  const userName = user?.username || user?.name || 'Someone you care about';

  const handleSave = (form) => {
    if (editing === 'new') {
      saveContact(form);
    } else {
      saveContact(form, editing);
    }
    setEditing(null);
  };

  const handleAlertAll = () => {
    setAlertingAll(true);
    contacts.forEach((contact, i) => {
      setTimeout(() => {
        const message = buildAlertMessage(contact, userName, 'en');
        sendAlert(contact, message);
      }, i * 500);
    });
    setAllAlertSent(true);
    setTimeout(() => { setAllAlertSent(false); setAlertingAll(false); }, 5000);
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 24px 48px' }}>

        {/* Header */}
        <button onClick={() => navigate('/chat')} style={{
          background: 'transparent', border: 'none', color: '#7A9BB5',
          fontSize: 14, cursor: 'pointer', marginBottom: 20
        }}>← Back to Chat</button>

        <h1 style={{
          fontSize: 28, margin: '0 0 6px',
          background: 'linear-gradient(135deg, #E8EDF5, #A5C8D8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>Trusted Contacts</h1>
        <p style={{ fontSize: 14, color: '#7A9BB5', marginBottom: 28, lineHeight: 1.6 }}>
          Save up to 3 people you trust. In a crisis, you can alert them instantly
          with a pre-written message via WhatsApp, SMS, or email.
        </p>

        {/* Alert all banner — shown when contacts exist */}
        {contacts.length > 0 && (
          <div style={{
            padding: '16px 20px', marginBottom: 24,
            background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)',
            borderRadius: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
          }}>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 14, color: '#E8EDF5', fontWeight: 500 }}>
                🚨 Alert all contacts
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#7A9BB5' }}>
                Send an alert to all {contacts.length} trusted contact{contacts.length > 1 ? 's' : ''} at once
              </p>
            </div>
            <button onClick={handleAlertAll} disabled={alertingAll} style={{
              padding: '10px 20px', borderRadius: 10, cursor: alertingAll ? 'default' : 'pointer',
              background: allAlertSent ? 'rgba(122,204,160,0.15)' : 'rgba(220,80,80,0.15)',
              border: allAlertSent ? '1px solid rgba(122,204,160,0.4)' : '1px solid rgba(220,80,80,0.4)',
              color: allAlertSent ? '#7ACCA0' : '#E05555',
              fontSize: 14, fontWeight: 500, transition: 'all 0.2s', flexShrink: 0
            }}>
              {allAlertSent ? '✓ All alerted!' : '🚨 Alert All Now'}
            </button>
          </div>
        )}

        {/* Contact list */}
        {contacts.map((contact, i) => (
          <div key={contact.id || i}>
            {editing === i ? (
              <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${ACCENT}40`, padding: '18px', marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: '#A5C8D8', margin: '0 0 14px', fontWeight: 500 }}>
                  ✏️ Editing {contact.name}
                </p>
                <ContactForm
                  initial={contact}
                  onSave={handleSave}
                  onCancel={() => setEditing(null)}
                />
              </div>
            ) : (
              <div>
                <ContactCard
                  contact={contact}
                  userName={userName}
                  onEdit={() => setEditing(i)}
                  onRemove={() => setRemoveConfirm(contact.id)}
                  onAlert={(c) => {
                    const message = buildAlertMessage(c, userName, 'en');
                    sendAlert(c, message);
                  }}
                />
                {removeConfirm === contact.id && (
                  <div style={{
                    padding: '10px 14px', background: 'rgba(220,80,80,0.08)',
                    border: '1px solid rgba(220,80,80,0.2)', borderRadius: 8, marginBottom: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
                  }}>
                    <span style={{ fontSize: 13, color: '#E8EDF5' }}>Remove {contact.name}?</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { removeContact(contact.id); setRemoveConfirm(null); }} style={{
                        padding: '5px 14px', background: '#E05555', border: 'none',
                        borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12
                      }}>Remove</button>
                      <button onClick={() => setRemoveConfirm(null)} style={{
                        padding: '5px 14px', background: CARD, border: BORDER,
                        borderRadius: 6, color: '#E8EDF5', cursor: 'pointer', fontSize: 12
                      }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add new contact */}
        {editing === 'new' ? (
          <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${ACCENT}40`, padding: '18px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#A5C8D8', margin: '0 0 14px', fontWeight: 500 }}>
              ➕ New Trusted Contact
            </p>
            <ContactForm onSave={handleSave} onCancel={() => setEditing(null)} />
          </div>
        ) : contacts.length < 3 ? (
          <button onClick={() => setEditing('new')} style={{
            width: '100%', padding: '14px', marginBottom: 20,
            background: 'transparent', border: '1px dashed rgba(74,143,168,0.4)',
            borderRadius: 14, color: ACCENT, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            ➕ Add Trusted Contact
            <span style={{ fontSize: 11, color: '#4A6A8A' }}>({3 - contacts.length} remaining)</span>
          </button>
        ) : (
          <div style={{ padding: '12px 16px', background: CARD, borderRadius: 10, border: BORDER, marginBottom: 20, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#7A9BB5' }}>
              Maximum 3 contacts saved. Remove one to add another.
            </p>
          </div>
        )}

        {/* Empty state */}
        {contacts.length === 0 && editing !== 'new' && (
          <div style={{ textAlign: 'center', padding: '32px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>👥</div>
            <p style={{ fontSize: 15, color: '#E8EDF5', margin: '0 0 8px' }}>No trusted contacts yet</p>
            <p style={{ fontSize: 13, color: '#7A9BB5', margin: '0 0 20px', lineHeight: 1.6 }}>
              Add someone you trust — a friend, family member, or therapist.
              In a difficult moment, one tap will send them a message letting them know you need support.
            </p>
          </div>
        )}

        {/* How it works */}
        <div style={{ padding: '16px 18px', background: CARD, borderRadius: 12, border: BORDER, fontSize: 13, color: '#7A9BB5', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 8px', color: '#A5C8D8', fontWeight: 500 }}>ℹ️ How trusted contact alerts work</p>
          <p style={{ margin: 0 }}>
            When you tap "Send Alert", the app opens WhatsApp (or SMS/email) with a pre-written message
            to your contact. The message explains you may need support and includes crisis line numbers.
            You can preview the message before sending. No data is sent automatically — you always
            confirm before it goes out.
          </p>
        </div>

        {/* Link to safety plan */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#A5C8D8' }}>
            Your trusted contacts can also be added to your Safety Plan
          </p>
          <button onClick={() => navigate('/safety-plan')} style={{
            padding: '7px 18px', background: ACCENT, border: 'none',
            borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13
          }}>Open Safety Plan →</button>
        </div>
      </div>
    </div>
  );
};

export default TrustedContacts;