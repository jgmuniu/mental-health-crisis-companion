import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../layout/Header';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { MoodSelector } from './MoodSelector';
import { CrisisBanner } from '../crisis/CrisisBanner';
import { CrisisMap } from '../crisis/CrisisMap';
import { SessionSummary } from './SessionSummary';
import { LanguageBadge, LanguageIndicator } from './LanguageBadge';
import { ShareButton } from './ShareSession';
import { useRiskDetection } from '../../hooks/useRiskDetection';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useSettings, BG_COLORS } from '../../hooks/useSettings';
import { useSessionSummary } from '../../hooks/useSessionSummary';
import { useLanguageDetection } from '../../hooks/useLanguageDetection';
import { sendMessageToAI } from '../../services/aiService';
import { saveSession } from '../../services/sessionService';
import { COLORS } from '../../constants/colors';
import { useOffline } from '../../hooks/useOffline';
import { OfflineBanner } from './OfflineBanner';
import { useRemoteVoice } from '../../hooks/useRemoteVoice';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hello. I'm here to listen — without judgment, without rushing.\n\nWhatever brought you here, you don't have to face it alone.\n\nHow are you feeling right now? You can tell me as much or as little as you'd like.",
  timestamp: new Date()
};

const SUMMARY_THRESHOLD = 4;

export function ChatApp({ user, onLogout }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState(0);
  const [showCrisisMap, setShowCrisisMap] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(true);
  const [newMessageIndex, setNewMessageIndex] = useState(null);
  const [sessionId, setSessionId] = useState(() => 'session_' + Date.now());
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  // ── Hooks ──────────────────────────────────────────────────────────────
  const { settings, update: updateSetting, reset: resetSettings } = useSettings();
  const { detectRiskLevel } = useRiskDetection();
  const { isListening, transcript, startListening, stopListening, isSupported: speechSupported } = useSpeechRecognition();
  const { isSpeaking, speak, stop: stopSpeaking, isSupported: ttsSupported } = useTextToSpeech();
  const { summary, loading: summaryLoading, generate: generateSummary, clear: clearSummary } = useSessionSummary();
  const { language, detect, forceLanguage, strings, systemPrompt, detectedFrom } = useLanguageDetection(
    settings.language === 'sw' ? 'sw' : 'en'
  );
  const { isOffline, justReconnected, queue, getOfflineFallback } = useOffline();

  // Remote voice control — polls backend every 5s for changes from other devices
  const handleRemoteVoiceChange = useCallback((enabled) => {
    if (!enabled && isSpeaking) stopSpeaking();
    updateSetting('voiceEnabled', enabled);
    setVoiceEnabled(enabled);
  }, [isSpeaking, stopSpeaking, updateSetting]);

  const { pushState: pushVoiceState } = useRemoteVoice(
    settings.voiceEnabled,
    handleRemoteVoiceChange
  );

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setVoiceEnabled(settings.voiceEnabled); }, [settings.voiceEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, showSummary, summaryLoading]);

  useEffect(() => {
    if (!isLoading && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isLoading]);

  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === 'user') setRiskLevel(detectRiskLevel(last.content));
  }, [messages, detectRiskLevel]);

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (textOverride) => {
    const messageText = (textOverride || input).trim();
    if (!messageText || isLoading) return;

    if (showSummary) setShowSummary(false);
    stopSpeaking();

    // Detect language from user message
    detect(messageText);

    const userMessage = { role: 'user', content: messageText, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setNewMessageIndex(updatedMessages.length - 1);
    setShowMoodSelector(false);

    try {
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));

      // Pass system prompt (language-aware) to AI
      const aiResult = await sendMessageToAI(
        messageText, sessionId, apiMessages, systemPrompt
      );
      const aiResponse = aiResult.response || aiResult;

      const responseRisk = detectRiskLevel(aiResponse);
      if (responseRisk > riskLevel) setRiskLevel(responseRisk);

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        critical: responseRisk >= 3
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      setNewMessageIndex(finalMessages.length - 1);

      if (ttsSupported && settings.voiceEnabled && responseRisk < 3) {
        speak(aiResponse, { rate: settings.voiceSpeed, voiceName: settings.voiceName || undefined });
      }

      if (user && !user.isAnonymous && user.id) {
        try {
          await saveSession(user.id, sessionId, finalMessages, Math.max(riskLevel, responseRisk));
        } catch (e) { console.warn('Session save failed:', e); }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Error message in detected language
      const errorMsg = language === 'sw'
        ? 'Bado niko hapa nawe. Kulikuwa na tatizo dogo la kiufundi, lakini ninakusikiliza. Tafadhali endelea.'
        : "I'm still here with you. There was a small technical issue, but I'm listening. Please continue sharing.";
      setMessages(prev => [...prev, {
        role: 'assistant', content: errorMsg, timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, riskLevel, user, sessionId, language,
      detectRiskLevel, detect, systemPrompt, speak, stopSpeaking,
      ttsSupported, settings, showSummary]);

  // ── Summary ─────────────────────────────────────────────────────────────
  const requestSummary = useCallback(async () => {
    if (summaryLoading || summaryGenerated) return;
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    if (userMsgCount < SUMMARY_THRESHOLD) return;
    setSummaryGenerated(true);
    setShowSummary(true);
    await generateSummary(messages);
  }, [messages, summaryLoading, summaryGenerated, generateSummary]);

  // ── New session ─────────────────────────────────────────────────────────
  const handleNewSession = useCallback(() => {
    setMessages([{
      ...INITIAL_MESSAGE,
      content: language === 'sw'
        ? 'Habari. Niko hapa kukusikia — bila kuhukumu, bila haraka.\n\nLolote lililokupeleka hapa, huhitaji kukabiliana nazo peke yako.\n\nUnajisikiaje sasa hivi?'
        : INITIAL_MESSAGE.content
    }]);
    setInput('');
    setRiskLevel(0);
    setShowMoodSelector(true);
    setShowSummary(false);
    setSummaryGenerated(false);
    clearSummary();
    setSessionId('session_' + Date.now());
    stopSpeaking();
  }, [clearSummary, stopSpeaking, language]);

  const handleFollowUp = useCallback((question) => {
    setShowSummary(false);
    sendMessage(question);
  }, [sendMessage]);

  // ── Voice ───────────────────────────────────────────────────────────────
  const handleStartListening = useCallback(() => {
    startListening((finalText) => {
      if (finalText) {
        setInput(finalText);
        if (settings.autoSendVoice) sendMessage(finalText);
      }
    });
  }, [startListening, sendMessage, settings.autoSendVoice]);

  const handleReplayLast = () => {
    const last = [...messages].reverse().find(m => m.role === 'assistant');
    if (last && ttsSupported) { stopSpeaking(); speak(last.content); }
  };

  const handleToggleVoice = () => {
    if (isSpeaking) stopSpeaking();
    const next = !settings.voiceEnabled;
    updateSetting('voiceEnabled', next);
    setVoiceEnabled(next);
    // Push to backend so other devices see the change within 5s
    pushVoiceState(next);
  };

  // ── Derived styles ──────────────────────────────────────────────────────
  const bgColor = BG_COLORS[settings.bgColor] || '#0D1B2A';
  const msgPadding = settings.messageSpacing === 'compact' ? '10px 20px 8px' : '20px 20px 16px';
  const isHighContrast = settings.theme === 'highContrast';
  const isLight = settings.theme === 'light';
  const inputBarBg = isLight ? '#e8edf5' : isHighContrast ? '#000' : '#111927';
  const textColor = isLight ? '#0D1B2A' : isHighContrast ? '#fff' : COLORS.text.primary;
  const fontSizeMap = { small: 13, medium: 15, large: 17 };
  const fontSize = fontSizeMap[settings.fontSize] || 15;
  const userMsgCount = messages.filter(m => m.role === 'user').length;
  const canSummarize = userMsgCount >= SUMMARY_THRESHOLD && !summaryLoading;

  return (
    <div style={{
      minHeight: '100vh', maxHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      background: isLight ? '#f0f4f8' : isHighContrast ? '#000' : bgColor,
      color: textColor, fontSize, overflow: 'hidden', position: 'relative',
      transition: settings.reducedMotion ? 'none' : 'background 0.3s ease'
    }}>
      {showCrisisMap && (
        <CrisisMap onClose={() => setShowCrisisMap(false)} riskLevel={riskLevel} />
      )}

      {/* Language detection toast */}
      <LanguageBadge
        language={language}
        detectedFrom={detectedFrom}
        onForce={forceLanguage}
      />

      <Header
        user={user}
        isSpeaking={isSpeaking}
        voiceEnabled={settings.voiceEnabled}
        onToggleVoice={handleToggleVoice}
        onReplayLast={ttsSupported ? handleReplayLast : null}
        onShowMap={() => setShowCrisisMap(true)}
        onLogout={onLogout}
      />

      <CrisisBanner
        riskLevel={riskLevel}
        onClose={() => setRiskLevel(0)}
        onShowMap={() => setShowCrisisMap(true)}
      />

      {showMoodSelector && messages.length === 1 && (
        <MoodSelector onMoodSelect={(msg) => sendMessage(msg)} />
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: msgPadding, position: 'relative', zIndex: 1 }}>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            isNew={index === newMessageIndex}
            isSpeaking={isSpeaking && index === messages.length - 1 && message.role === 'assistant'}
            bubbleStyle={settings.bubbleStyle}
            fontSize={fontSize}
            reducedMotion={settings.reducedMotion}
            theme={settings.theme}
          />
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #A5C8D8, #4A6A8A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0
            }}>🤝</div>
            <TypingIndicator reducedMotion={settings.reducedMotion} />
          </div>
        )}

        {(showSummary || summaryLoading) && (
          <SessionSummary
            summary={summary}
            loading={summaryLoading}
            onFollowUp={handleFollowUp}
            onClose={() => setShowSummary(false)}
            onNewSession={handleNewSession}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '12px 20px 16px',
        borderTop: isHighContrast ? '1px solid #fff' : '1px solid rgba(255,255,255,0.08)',
        background: inputBarBg, position: 'relative', zIndex: 10, flexShrink: 0
      }}>
        <ChatInput
          inputRef={inputRef}
          value={input}
          onChange={(value) => setInput(value)}
          onSend={() => sendMessage()}
          isLoading={isLoading}
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={stopListening}
          speechSupported={speechSupported}
          fontSize={fontSize}
          theme={settings.theme}
          placeholder={strings.placeholder}
        />

        {/* Footer strip */}
        <div style={{
          fontSize: 10, color: isLight ? '#6A8AA0' : COLORS.text.muted,
          textAlign: 'center', marginTop: 6, lineHeight: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, flexWrap: 'wrap'
        }}>
          <span>
            {user?.isAnonymous ? strings.anonymousMode : `${strings.sessionSaved} · ${user?.username || user?.name || 'User'}`}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <a href={language === 'sw' ? 'tel:0800723253' : 'tel:988'}
            style={{ color: COLORS.risk.high, textDecoration: 'none' }}>
            {strings.crisisCall}
          </a>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <button onClick={() => setShowCrisisMap(true)} style={{
            background: 'transparent', border: 'none',
            color: COLORS.accent.primary, cursor: 'pointer',
            fontSize: 10, textDecoration: 'underline', padding: 0
          }}>{strings.findFacilities}</button>

          {canSummarize && !showSummary && !summaryLoading && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <button onClick={requestSummary} style={{
                background: 'transparent', border: 'none',
                color: '#A5C8D8', cursor: 'pointer',
                fontSize: 10, textDecoration: 'underline', padding: 0
              }}>{strings.summarise}</button>
            </>
          )}

          {/* Share button */}
          {userMsgCount >= 1 && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <ShareButton messages={messages} sessionId={sessionId} />
            </>
          )}

          {/* Language indicator */}
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <LanguageIndicator language={language} onForce={forceLanguage} />
        </div>
      </div>
    </div>
  );
}