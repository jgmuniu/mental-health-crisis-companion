import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const recognitionRef = useRef(null);
  const onFinalRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      setNetworkError(false);
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) setTranscript(interim);

      if (final) {
        setTranscript(final);
        if (onFinalRef.current) {
          setTimeout(() => onFinalRef.current(final.trim()), 300);
        }
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event) => {
      // 'network' error = browser can't reach Google speech API
      // This happens on slow connections or certain networks — not a crash
      if (event.error === 'network') {
        console.warn('Speech recognition: network unavailable. Voice input disabled.');
        setNetworkError(true);
        setIsSupported(false); // hide mic button gracefully
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback((onFinalCallback) => {
    if (!recognitionRef.current || isListening || networkError) return;
    onFinalRef.current = onFinalCallback || null;
    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      // Already started or other transient error — safe to ignore
      console.warn('Could not start speech recognition:', e.message);
    }
  }, [isListening, networkError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, startListening, stopListening, isSupported };
}