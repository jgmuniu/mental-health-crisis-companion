import { useState, useEffect } from 'react';

const DEFAULTS = {
  // Appearance
  theme: 'dark',               // 'dark' | 'light' | 'highContrast'
  fontSize: 'medium',          // 'small' | 'medium' | 'large'
  bubbleStyle: 'rounded',      // 'rounded' | 'sharp' | 'minimal'
  bgColor: 'navy',             // 'navy' | 'midnight' | 'forest' | 'slate'
  messageSpacing: 'comfortable', // 'compact' | 'comfortable'
  reducedMotion: false,

  // Voice / functional
  voiceEnabled: true,
  voiceSpeed: 0.9,             // 0.5 – 2.0
  voiceName: '',               // empty = auto-pick warm voice
  autoSendVoice: true,
  language: 'en',
};

const STORAGE_KEY = 'safeguide_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    // Apply font-size to root so whole app scales
    const sizes = { small: '13px', medium: '15px', large: '17px' };
    document.documentElement.style.setProperty('--app-font-size', sizes[settings.fontSize] || '15px');

    // Reduced motion
    document.documentElement.style.setProperty(
      '--transition-speed', settings.reducedMotion ? '0s' : '0.2s'
    );
  }, [settings]);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const reset = () => setSettings(DEFAULTS);

  return { settings, update, reset };
};

export const BG_COLORS = {
  navy:     '#0D1B2A',
  midnight: '#0A0A1A',
  forest:   '#0D1F18',
  slate:    '#141820',
};

export const FONT_SIZES = { small: 13, medium: 15, large: 17 };