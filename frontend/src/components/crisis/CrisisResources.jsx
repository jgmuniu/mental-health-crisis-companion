import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import { useNavigate } from 'react-router-dom';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';

const resources = {
  immediate: [
    {
      name: 'Befrienders Kenya',
      phone: '+254 722 178 177',
      description: 'Emotional support for distress and suicidal thoughts. Also available via WhatsApp and SMS.',
      hours: 'Mon–Fri, 7 AM–7 PM',
      languages: ['English', 'Swahili'],
      website: 'https://www.befrienderskenya.org'
    },
    {
      name: 'Niskize — "Listen to me"',
      phone: '0900 620 800',
      phoneAlt: '+254 718 227 440',
      description: '24/7 counseling for people in distress, trauma, depression, anxiety, and substance abuse.',
      hours: '24/7',
      languages: ['English', 'Swahili']
    },
    {
      name: 'EMKF Crisis Hotline',
      phone: '0800 723 253',
      description: 'Nationwide suicide prevention and crisis helpline staffed by professionals. Free nationwide.',
      hours: '24/7',
      languages: ['English', 'Swahili'],
      note: 'Free nationwide call'
    }
  ],
  warmlines: [
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: 'Treatment referral and information service (USA)',
      hours: '24/7',
      languages: ['English', 'Spanish']
    },
    {
      name: 'NAMI Helpline',
      phone: '1-800-950-6264',
      description: 'NAMI HelpLine for mental health questions (USA)',
      website: 'https://nami.org/help',
      hours: 'Mon–Fri, 10am–10pm ET'
    }
  ],
  specialized: [
    {
      name: 'Veterans Crisis Line',
      phone: '988 then press 1',
      description: 'Support for veterans and their families',
      website: 'https://www.veteranscrisisline.net',
      hours: '24/7'
    },
    {
      name: 'LGBTQ+ Trevor Project',
      phone: '1-866-488-7386',
      description: 'Crisis intervention for LGBTQ+ youth',
      website: 'https://www.thetrevorproject.org',
      hours: '24/7'
    }
  ],
  international: [
    { country: 'Kenya', name: 'EMKF Crisis Hotline', phone: '0800 723 253', description: '24/7 free nationwide' },
    { country: 'Kenya', name: 'Niskize', phone: '0900 620 800', description: '24/7 counseling' },
    { country: 'UK', name: 'Samaritans', phone: '116 123', description: '24/7 free support' },
    { country: 'Canada', name: 'Talk Suicide Canada', phone: '1-833-456-4566', description: '24/7 crisis support' },
    { country: 'Australia', name: 'Lifeline Australia', phone: '13 11 14', description: '24/7 crisis support' },
    { country: 'USA', name: '988 Lifeline', phone: '988', description: '24/7 crisis support' }
  ]
};

const CrisisResources = () => {
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  const ResourceCard = ({ resource, index, category }) => {
    const key = `${category}-${index}`;
    const isOpen = expanded === key;

    return (
      <div style={{ background: CARD, borderRadius: 12, border: BORDER, marginBottom: 10, overflow: 'hidden' }}>
        <div onClick={() => setExpanded(isOpen ? null : key)} style={{
          padding: '14px 18px', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: '0 0 3px', color: '#E8EDF5', fontSize: 15, fontWeight: 500 }}>
              {resource.name}
            </h3>
            <p style={{ margin: 0, color: '#7A9BB5', fontSize: 13 }}>
              {resource.phone || resource.contact}
              {resource.phoneAlt && <span style={{ color: '#4A6A8A' }}> · {resource.phoneAlt}</span>}
            </p>
          </div>
          <span style={{
            color: '#7A9BB5', fontSize: 14,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s', marginLeft: 12
          }}>▼</span>
        </div>

        {isOpen && (
          <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ margin: '12px 0 10px', color: '#A5C8D8', fontSize: 13, lineHeight: 1.6 }}>
              {resource.description}
            </p>

            {resource.hours && (
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#7A9BB5' }}>
                🕐 Hours: <span style={{ color: '#E8EDF5' }}>{resource.hours}</span>
              </p>
            )}
            {resource.languages && (
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#7A9BB5' }}>
                🌐 Languages: <span style={{ color: '#E8EDF5' }}>{resource.languages.join(', ')}</span>
              </p>
            )}
            {resource.note && (
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#7ACCA0' }}>
                ✓ {resource.note}
              </p>
            )}
            {resource.country && (
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#7A9BB5' }}>
                📍 Country: <span style={{ color: '#E8EDF5' }}>{resource.country}</span>
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {resource.phone && (
                <a href={`tel:${resource.phone.replace(/\s/g, '')}`} style={{
                  padding: '8px 18px', background: '#4A8FA8', color: '#fff',
                  textDecoration: 'none', borderRadius: 20, fontSize: 13, fontWeight: 500
                }}>📞 Call Now</a>
              )}
              {resource.phoneAlt && (
                <a href={`tel:${resource.phoneAlt.replace(/\s/g, '')}`} style={{
                  padding: '8px 18px', background: 'rgba(74,143,168,0.2)',
                  border: '1px solid rgba(74,143,168,0.4)',
                  color: '#A5C8D8', textDecoration: 'none', borderRadius: 20, fontSize: 13
                }}>📱 Alt Number</a>
              )}
              {resource.website && (
                <a href={resource.website} target="_blank" rel="noopener noreferrer" style={{
                  padding: '8px 18px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#E8EDF5', textDecoration: 'none', borderRadius: 20, fontSize: 13
                }}>🌐 Website</a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, color, items, category }) => (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontSize: 18, margin: '0 0 14px', color,
        borderBottom: `1px solid ${color}30`, paddingBottom: 8
      }}>{title}</h2>
      {items.map((r, i) => (
        <ResourceCard key={i} resource={r} index={i} category={category} />
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '100px 24px 48px' }}>

        <button onClick={() => navigate('/chat')} style={{
          background: 'transparent', border: 'none', color: '#7A9BB5',
          fontSize: 14, cursor: 'pointer', marginBottom: 20
        }}>← Back to Chat</button>

        <h1 style={{
          fontSize: 30, margin: '0 0 8px',
          background: 'linear-gradient(135deg, #E8EDF5, #A5C8D8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>Crisis Resources</h1>
        <p style={{ fontSize: 14, color: '#7A9BB5', marginBottom: 36, lineHeight: 1.6 }}>
          If you or someone you know is struggling with suicidal thoughts or depression,
          free and confidential support is available. You are not alone.
        </p>

        {/* Kenya emergency banner */}
        <div style={{
          padding: '16px 20px', marginBottom: 32,
          background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.3)',
          borderRadius: 14
        }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#E8EDF5', fontWeight: 500 }}>
            🇰🇪 Kenya — Immediate Help
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'EMKF: 0800 723 253', tel: '0800723253' },
              { label: 'Niskize: 0900 620 800', tel: '0900620800' },
              { label: 'Befrienders: +254 722 178 177', tel: '+254722178177' }
            ].map(({ label, tel }) => (
              <a key={tel} href={`tel:${tel}`} style={{
                padding: '8px 16px', background: 'rgba(220,80,80,0.15)',
                border: '1px solid rgba(220,80,80,0.4)',
                borderRadius: 20, color: '#FFB0B0',
                textDecoration: 'none', fontSize: 13, fontWeight: 500
              }}>📞 {label}</a>
            ))}
          </div>
        </div>

        <Section title="🚨 Immediate Crisis Support — Kenya" color="#E05555" items={resources.immediate} category="immediate" />
        <Section title="💛 Warmlines & Support Lines" color="#D4A017" items={resources.warmlines} category="warmlines" />
        <Section title="🤝 Specialized Support" color="#A5C8D8" items={resources.specialized} category="specialized" />
        <Section title="🌍 International Resources" color="#7A9BB5" items={resources.international} category="international" />

        <div style={{
          padding: '18px 20px', background: CARD, borderRadius: 12, border: BORDER,
          textAlign: 'center', fontSize: 12, color: '#7A9BB5', lineHeight: 1.6
        }}>
          These resources are provided for informational purposes. If you are experiencing
          a medical emergency, call <strong style={{ color: '#E8EDF5' }}>999</strong> (Kenya) immediately.
        </div>
      </div>
    </div>
  );
};

export default CrisisResources;