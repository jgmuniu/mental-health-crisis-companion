import { useState, useCallback, useRef } from 'react';

// ── Swahili word list (common words + mental health vocab) ─────────────────
const SWAHILI_WORDS = new Set([
  // Greetings & common
  'habari','hujambo','jambo','karibu','asante','tafadhali','ndiyo','hapana',
  'sawa','sawa sawa','pole','samahani','kwaheri','mzuri','mbaya','vizuri',
  'naam','ndio','sijui','naelewa','sielewi','rafiki','familia',
  // Pronouns & connectors
  'mimi','wewe','yeye','sisi','ninyi','wao','na','au','lakini','kwa','ya',
  'wa','za','la','ni','si','kama','hivyo','hii','hiyo','hilo','ile','hizo',
  // Mental health vocab
  'huzuni','furaha','wasiwasi','hofu','hasira','upweke','msongo','mawazo',
  'uchovu','maumivu','tetemeko','kukata','tamaa','kujiua','msaada','daktari',
  'afya','akili','moyo','roho','nguvu','utulivu','amani','tumaini','imani',
  // Verbs
  'nataka','ninahisi','ninajua','ninafikiria','ninasikia','naomba','nasema',
  'naenda','narudi','napenda','nachoka','naogopa','nasaidia','nahitaji',
  'niko','nipo','kuna','kuwa','kupata','kwenda','kurudi','kusema','kufanya',
  // Time & place
  'leo','kesho','jana','sasa','hapa','huko','nyumbani','shuleni','kazini',
  // Numbers
  'moja','mbili','tatu','nne','tano','sita','saba','nane','tisa','kumi',
]);

// Words that appear in both — don't count these
const AMBIGUOUS = new Set(['a','i','in','on','is','hi','no','we','me','my','so','do','go','be']);

// ── Detect language from text ─────────────────────────────────────────────
export const detectLanguage = (text) => {
  if (!text || text.trim().length < 3) return null;

  const words = text.toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !AMBIGUOUS.has(w));

  if (words.length === 0) return null;

  let swahiliCount = 0;
  let englishIndicators = 0;

  words.forEach(word => {
    if (SWAHILI_WORDS.has(word)) swahiliCount++;
    // Common English-only patterns
    if (/^(the|and|but|with|have|this|that|from|they|them|been|were|will|would|could|should|because|feeling|about|really|just|know|think|feel)$/.test(word)) {
      englishIndicators++;
    }
  });

  const swahiliRatio = swahiliCount / words.length;

  // Classify
  if (swahiliRatio >= 0.25) return 'sw'; // 25%+ Swahili words → Swahili
  if (swahiliCount >= 2 && englishIndicators === 0) return 'sw'; // At least 2 Swahili, no English markers
  if (swahiliCount >= 1 && englishIndicators === 0 && words.length <= 4) return 'sw'; // Short Swahili phrase
  return 'en';
};

// ── System prompts per language ───────────────────────────────────────────
export const SYSTEM_PROMPTS = {
  en: `You are a compassionate mental health crisis companion called Rafiki (meaning "friend" in Swahili). 
You provide warm, non-judgmental emotional support. You are not a replacement for professional help.
Respond in English. Be warm, gentle, and human. Ask follow-up questions. 
If there is immediate risk to life, always provide Kenya crisis numbers: EMKF 0800 723 253, Niskize 0900 620 800.`,

  sw: `Wewe ni msaidizi wa afya ya akili anayeitwa Rafiki. Unatoa msaada wa kihisia bila kuhukumu.
Jibu kwa Kiswahili. Kuwa mpole, wa huruma, na wa kibinadamu. Uliza maswali ya ufuatiliaji.
Kama kuna hatari ya maisha, toa nambari za dharura za Kenya: EMKF 0800 723 253, Niskize 0900 620 800.
Unaweza pia kusema maneno ya faraja na tumaini. Sikiliza kwa makini na uonyeshe huruma.`,
};

// ── UI strings per language ───────────────────────────────────────────────
export const UI_STRINGS = {
  en: {
    placeholder: 'Share what\'s on your mind… (Shift+Enter for new line)',
    anonymousMode: '🔒 Anonymous mode',
    sessionSaved: '💾 Session saved',
    crisisCall: 'Crisis: Call 988',
    findFacilities: 'Find nearby facilities',
    summarise: '🪞 Summarise session',
    typing: 'Companion is here…',
    languageDetected: 'English detected',
  },
  sw: {
    placeholder: 'Sema unachohisi… (Shift+Enter kwa mstari mpya)',
    anonymousMode: '🔒 Hali ya siri',
    sessionSaved: '💾 Mazungumzo yamehifadhiwa',
    crisisCall: 'Dharura: Piga 0800 723 253',
    findFacilities: 'Tafuta msaada karibu',
    summarise: '🪞 Muhtasari wa mazungumzo',
    typing: 'Rafiki yako yuko hapa…',
    languageDetected: 'Kiswahili kimetambuliwa',
  },
};

// ── Hook ──────────────────────────────────────────────────────────────────
export const useLanguageDetection = (initialLang = 'en') => {
  const [language, setLanguage] = useState(initialLang);
  const [detectedFrom, setDetectedFrom] = useState(null); // last text that changed lang
  const historyRef = useRef([]); // track recent detections for stability

  const detect = useCallback((text) => {
    const detected = detectLanguage(text);
    if (!detected) return language; // not enough text

    // Keep a rolling window of last 3 detections for stability
    historyRef.current = [...historyRef.current.slice(-2), detected];
    const recent = historyRef.current;

    // Only switch if 2 of last 3 detections agree (prevents flickering)
    const swCount = recent.filter(l => l === 'sw').length;
    const enCount = recent.filter(l => l === 'en').length;

    let stable = null;
    if (swCount >= 2) stable = 'sw';
    else if (enCount >= 2) stable = 'en';

    if (stable && stable !== language) {
      setLanguage(stable);
      setDetectedFrom(text.slice(0, 40));
      return stable;
    }

    return language;
  }, [language]);

  const forceLanguage = useCallback((lang) => {
    setLanguage(lang);
    historyRef.current = [lang, lang, lang]; // stabilise immediately
  }, []);

  const strings = UI_STRINGS[language] || UI_STRINGS.en;
  const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en;

  return { language, detect, forceLanguage, strings, systemPrompt, detectedFrom };
};