import { useState, useEffect, useCallback } from 'react';

const OFFLINE_QUEUE_KEY = 'safeguide_offline_queue';
const CACHE_KEY = 'safeguide_offline_responses';

// ── Cached responses for common crisis situations ─────────────────────────
// These are shown when the AI is unreachable (offline or API down)
const OFFLINE_RESPONSES = {
  crisis: [
    "I hear you, and I want you to know that what you're feeling matters deeply. Even though I can't connect right now, please reach out to a real person. Call EMKF on 0800 723 253 — it's free and available 24/7. You don't have to face this alone.",
    "Your safety matters more than anything else right now. Please call Niskize on 0900 620 800 or Befrienders Kenya on +254 722 178 177. These counselors are real people who want to help.",
  ],
  anxiety: [
    "It sounds like you're feeling overwhelmed right now. While I'm not connected, try this: breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat 4 times. This box breathing can help calm your nervous system.",
    "Anxiety can feel all-consuming. You're not alone in this. Try grounding yourself by naming 5 things you can see, 4 you can touch, 3 you can hear. I'll be back online soon and ready to listen.",
  ],
  sadness: [
    "I'm sorry you're feeling this way. Even though I can't connect right now, your feelings are valid and you matter. If things feel very dark, please call EMKF on 0800 723 253 — they are there for you.",
    "Feeling low is hard, especially when it seems like no one is there. But people do care about you. When I'm back online I'd love to hear what's on your mind. In the meantime, be gentle with yourself.",
  ],
  general: [
    "I'm currently offline and can't connect to respond properly, but I want you to know I'm here with you in spirit. If you need immediate support, call EMKF on 0800 723 253 (free, 24/7).",
    "It seems I've lost my connection. While I work to restore it, please know that your thoughts are worth being heard. Try the breathing exercises or grounding tools available in the app.",
    "I'm having trouble connecting right now. Your wellbeing matters — if you need to talk to someone, Niskize is available 24/7 on 0900 620 800. I'll be back as soon as the connection is restored.",
  ],
};

const detectMessageType = (text) => {
  const lower = text.toLowerCase();
  if (/suicid|kill myself|end my life|kujiua|nijidhuru|want to die|no reason to live/.test(lower)) return 'crisis';
  if (/anxious|anxiety|panic|scared|wasiwasi|hofu|overwhelm|shaking/.test(lower)) return 'anxiety';
  if (/sad|depress|hopeless|alone|empty|huzuni|peke yangu|worthless|crying/.test(lower)) return 'sadness';
  return 'general';
};

const getOfflineResponse = (messageText) => {
  const type = detectMessageType(messageText);
  const pool = OFFLINE_RESPONSES[type];
  return pool[Math.floor(Math.random() * pool.length)];
};

// ── Queue management ──────────────────────────────────────────────────────
const loadQueue = () => {
  try { return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]'); }
  catch { return []; }
};

const saveQueue = (q) => localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q));

// ── Hook ──────────────────────────────────────────────────────────────────
export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [queue, setQueue] = useState(loadQueue);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };
    const goOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 4000);
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const queueMessage = useCallback((message, sessionId) => {
    const entry = {
      id: Date.now().toString(),
      message,
      sessionId,
      timestamp: new Date().toISOString(),
    };
    const updated = [...loadQueue(), entry];
    setQueue(updated);
    saveQueue(updated);
    return entry.id;
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    saveQueue([]);
  }, []);

  const getOfflineFallback = useCallback((messageText) => {
    return {
      success: true,
      response: getOfflineResponse(messageText),
      offline: true,
    };
  }, []);

  return {
    isOffline,
    wasOffline,
    justReconnected,
    queue,
    queueMessage,
    clearQueue,
    getOfflineFallback,
  };
};

export { getOfflineResponse, detectMessageType };