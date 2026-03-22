import { useState, useCallback } from 'react';

const STORAGE_KEY = 'safeguide_trusted_contacts';

export const loadContacts = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

const saveContacts = (contacts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
};

// ── Alert message builders ────────────────────────────────────────────────
export const buildAlertMessage = (contact, userName, language = 'en') => {
  const name = userName || 'Someone you care about';
  if (language === 'sw') {
    return `Habari ${contact.name},\n\n${name} anatumia programu ya SafeGuide na amechagua kukuarifu kwa sababu wanakupenda na wanakuamini.\n\nWanaweza kuhitaji msaada wako sasa hivi. Tafadhali wasiliana nao mara moja.\n\n📞 Nambari za dharura:\n• EMKF: 0800 723 253 (bure)\n• Niskize: 0900 620 800\n• Befrienders Kenya: +254 722 178 177\n\nAsante kwa kuwa msaada wao.`;
  }
  return `Hi ${contact.name},\n\n${name} is using the SafeGuide mental health app and has chosen to reach out to you because they trust you.\n\nThey may need your support right now. Please check in with them as soon as you can.\n\n📞 Crisis lines if needed:\n• EMKF Crisis Hotline: 0800 723 253 (free)\n• Niskize: 0900 620 800\n• Befrienders Kenya: +254 722 178 177\n\nThank you for being someone they can count on.`;
};

// ── Share via platform ────────────────────────────────────────────────────
export const sendAlert = (contact, message) => {
  const encoded = encodeURIComponent(message);
  const phone = contact.phone?.replace(/[\s\-()]/g, '') || '';

  switch (contact.preferredMethod) {
    case 'whatsapp':
      window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
      break;
    case 'sms':
      window.location.href = `sms:${phone}?body=${encoded}`;
      break;
    case 'email':
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent('SafeGuide — Checking In')}&body=${encoded}`;
      break;
    default:
      // Fallback: try WhatsApp if phone, email if not
      if (phone) window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
      else if (contact.email) window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent('SafeGuide — Checking In')}&body=${encoded}`;
  }
};

// ── Hook ──────────────────────────────────────────────────────────────────
export const useTrustedContacts = () => {
  const [contacts, setContacts] = useState(loadContacts);

  const saveContact = useCallback((contact, index = null) => {
    setContacts(prev => {
      let updated;
      if (index !== null) {
        updated = prev.map((c, i) => i === index ? { ...c, ...contact } : c);
      } else {
        if (prev.length >= 3) return prev; // max 3
        updated = [...prev, { id: Date.now().toString(), ...contact }];
      }
      saveContacts(updated);
      return updated;
    });
  }, []);

  const removeContact = useCallback((id) => {
    setContacts(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveContacts(updated);
      return updated;
    });
  }, []);

  const alertContact = useCallback((contact, userName, language = 'en') => {
    const message = buildAlertMessage(contact, userName, language);
    sendAlert(contact, message);
  }, []);

  const alertAll = useCallback((userName, language = 'en') => {
    const contacts = loadContacts();
    contacts.forEach((contact, i) => {
      // Stagger opens slightly so browser doesn't block them
      setTimeout(() => alertContact(contact, userName, language), i * 400);
    });
  }, [alertContact]);

  return { contacts, saveContact, removeContact, alertContact, alertAll };
};