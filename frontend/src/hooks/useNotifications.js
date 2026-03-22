import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'safeguide_notifications';
const SW_PATH = '/sw.js';

// ── Default schedule config ───────────────────────────────────────────────
export const DEFAULT_SCHEDULE = {
  enabled: false,
  morningCheckin:   { enabled: true,  time: '08:00', label: 'Morning check-in' },
  eveningMood:      { enabled: true,  time: '20:00', label: 'Evening mood log' },
  journalReminder:  { enabled: false, time: '21:00', label: 'Journal reminder' },
  breathingBreak:   { enabled: false, time: '13:00', label: 'Breathing break' },
  weeklyReflection: { enabled: false, day: 0, time: '10:00', label: 'Weekly reflection (Sunday)' },
};

const loadSchedule = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_SCHEDULE, ...JSON.parse(saved) } : { ...DEFAULT_SCHEDULE };
  } catch { return { ...DEFAULT_SCHEDULE }; }
};

const saveSchedule = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

// ── Notification content ──────────────────────────────────────────────────
const MESSAGES = {
  morningCheckin: [
    { title: '☀️ Good morning', body: 'How are you starting your day? Take a moment to check in with yourself.' },
    { title: '🌅 Morning SafeGuide', body: 'A new day begins. How are you feeling right now?' },
    { title: '☀️ Daily check-in', body: 'Take 30 seconds to notice how you feel this morning.' },
  ],
  eveningMood: [
    { title: '🌙 Evening check-in', body: 'How was your day? Log your mood and reflect for a moment.' },
    { title: '🌙 How are you feeling?', body: 'Take a moment before bed to check in with yourself.' },
    { title: '🌙 End of day', body: "You made it through today. How are you feeling?" },
  ],
  journalReminder: [
    { title: '📓 Journal time', body: 'A few minutes of writing can make a big difference. Your journal is waiting.' },
    { title: '✍️ Write it out', body: 'What\'s on your mind today? Your private journal is ready.' },
  ],
  breathingBreak: [
    { title: '🌬 Breathing break', body: 'Take 3 minutes for yourself. A quick breathing exercise can reset your day.' },
    { title: '😮‍💨 Pause & breathe', body: 'Mid-day reset: try box breathing for 2 minutes.' },
  ],
  weeklyReflection: [
    { title: '🪞 Weekly reflection', body: 'How has this week been? Take a moment to look back and check in.' },
  ],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Build fire times for today/this week ──────────────────────────────────
const buildScheduledNotifications = (schedule) => {
  const notifs = [];
  const now = new Date();

  const fireToday = (timeStr, type) => {
    const [h, m] = timeStr.split(':').map(Number);
    const fire = new Date();
    fire.setHours(h, m, 0, 0);
    // If time already passed today, schedule for tomorrow
    if (fire <= now) fire.setDate(fire.getDate() + 1);
    const msg = pick(MESSAGES[type]);
    notifs.push({ ...msg, fireAt: fire.getTime(), url: urlFor(type), type });
  };

  if (schedule.morningCheckin?.enabled)   fireToday(schedule.morningCheckin.time,   'morningCheckin');
  if (schedule.eveningMood?.enabled)      fireToday(schedule.eveningMood.time,       'eveningMood');
  if (schedule.journalReminder?.enabled)  fireToday(schedule.journalReminder.time,   'journalReminder');
  if (schedule.breathingBreak?.enabled)   fireToday(schedule.breathingBreak.time,    'breathingBreak');

  if (schedule.weeklyReflection?.enabled) {
    const target = new Date();
    const dayOfWeek = schedule.weeklyReflection.day ?? 0;
    const [h, m] = (schedule.weeklyReflection.time || '10:00').split(':').map(Number);
    const daysUntil = (dayOfWeek - target.getDay() + 7) % 7 || 7;
    target.setDate(target.getDate() + daysUntil);
    target.setHours(h, m, 0, 0);
    const msg = pick(MESSAGES.weeklyReflection);
    notifs.push({ ...msg, fireAt: target.getTime(), url: '/dashboard', type: 'weeklyReflection' });
  }

  return notifs;
};

const urlFor = (type) => {
  const map = {
    morningCheckin:  '/checkin',
    eveningMood:     '/checkin',
    journalReminder: '/journal',
    breathingBreak:  '/breathing',
  };
  return map[type] || '/';
};

// ── Hook ──────────────────────────────────────────────────────────────────
export const useNotifications = () => {
  const [schedule, setSchedule] = useState(loadSchedule);
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [swReady, setSwReady] = useState(false);
  const [error, setError] = useState(null);

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) { setError('Service workers not supported in this browser.'); return; }
    navigator.serviceWorker.register(SW_PATH)
      .then(reg => { setSwReady(true); console.log('SW registered:', reg.scope); })
      .catch(err => { setError('Could not register service worker: ' + err.message); });
  }, []);

  // Push schedule to SW whenever it changes
  useEffect(() => {
    if (!swReady || !schedule.enabled) return;
    navigator.serviceWorker.ready.then(reg => {
      const notifications = buildScheduledNotifications(schedule);
      reg.active?.postMessage({ type: 'SCHEDULE', notifications });
    });
  }, [schedule, swReady]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) { setError('Notifications not supported.'); return false; }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const enable = useCallback(async () => {
    const granted = permission === 'granted' || await requestPermission();
    if (!granted) return false;
    const updated = { ...schedule, enabled: true };
    setSchedule(updated);
    saveSchedule(updated);
    return true;
  }, [permission, schedule, requestPermission]);

  const disable = useCallback(() => {
    const updated = { ...schedule, enabled: false };
    setSchedule(updated);
    saveSchedule(updated);
    // Tell SW to clear alarms
    navigator.serviceWorker.ready.then(reg => {
      reg.active?.postMessage({ type: 'SCHEDULE', notifications: [] });
    });
  }, [schedule]);

  const updateReminder = useCallback((key, value) => {
    const updated = { ...schedule, [key]: { ...schedule[key], ...value } };
    setSchedule(updated);
    saveSchedule(updated);
  }, [schedule]);

  const sendTestNotification = useCallback(() => {
    if (permission !== 'granted') return;
    new Notification('🧭 SafeGuide test', {
      body: 'Notifications are working! You\'ll receive your scheduled reminders.',
      icon: '/icons/icon-192.png',
    });
  }, [permission]);

  return {
    schedule, permission, swReady, error,
    enable, disable, updateReminder,
    requestPermission, sendTestNotification,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
  };
};