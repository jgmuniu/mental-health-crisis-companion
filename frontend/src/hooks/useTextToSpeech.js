import { useState, useEffect, useRef, useCallback } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // Priority list: warm, natural-sounding English voices
        const preferred = [
          'Google UK English Female',
          'Google US English',
          'Microsoft Zira',
          'Microsoft Jenny Online (Natural)',
          'Samantha',
          'Karen',
          'Moira',
          'Tessa',
        ];

        let selected = null;
        for (const name of preferred) {
          selected = voices.find(v => v.name === name);
          if (selected) break;
        }

        // Fallback: any female English voice
        if (!selected) {
          selected = voices.find(v =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('female') ||
             v.name.toLowerCase().includes('woman') ||
             v.name.toLowerCase().includes('zira') ||
             v.name.toLowerCase().includes('jenny') ||
             v.name.toLowerCase().includes('samantha') ||
             v.name.toLowerCase().includes('karen'))
          );
        }

        // Fallback: any English voice
        if (!selected) {
          selected = voices.find(v => v.lang.startsWith('en'));
        }

        voiceRef.current = selected || null;
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text) => {
    if (!isSupported || !text) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text — remove emojis and markdown
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[*_#`]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Soothing voice settings
    utterance.rate = 0.88;      // Slightly slower — calm, unhurried
    utterance.pitch = 1.05;     // Slightly warmer pitch
    utterance.volume = 0.95;

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      // Ignore 'interrupted' errors — they happen when speech is cancelled normally
      if (e.error !== 'interrupted') {
        console.warn('Speech error:', e.error);
      }
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop, isSupported };
}