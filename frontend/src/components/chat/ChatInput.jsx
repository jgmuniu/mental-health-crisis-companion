import React, { useRef, useEffect } from 'react';
import { COLORS } from '../../constants/colors';
import { QUICK_REPLIES } from '../../constants/moods';

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  isLoading,
  isListening,
  onStartListening,
  onStopListening,
  speechSupported,
  placeholder = "Share what's on your mind... (Shift+Enter for new line)",
  disabled = false,
  maxHeight = 120,
  showQuickReplies = true,
  inputRef = null
}) {
  const internalRef = useRef(null);
  const textareaRef = inputRef || internalRef;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = 
        Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
    }
  }, [value, maxHeight]);

  // Add pulse animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      @keyframes listeningPulse {
        0% { box-shadow: 0 0 0 0 ${COLORS.risk.high}80; }
        70% { box-shadow: 0 0 0 10px ${COLORS.risk.high}00; }
        100% { box-shadow: 0 0 0 0 ${COLORS.risk.high}00; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSend = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSend();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = COLORS.accent.primary;
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = COLORS.border.light;
  };

  const isInputDisabled = isLoading || isListening || disabled;

  return (
    <div style={{ width: '100%' }}>
      {/* Quick replies */}
      {showQuickReplies && QUICK_REPLIES && QUICK_REPLIES.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          flexWrap: 'wrap'
        }}>
          {QUICK_REPLIES.map((reply, index) => (
            <button
              key={index}
              onClick={() => onChange(reply)}
              disabled={isInputDisabled}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 12,
                cursor: isInputDisabled ? 'default' : 'pointer',
                background: 'rgba(170, 200, 220, 0.07)',
                color: isInputDisabled ? COLORS.text.muted : COLORS.text.secondary,
                border: `1px solid ${COLORS.border.light}`,
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                opacity: isInputDisabled ? 0.5 : 1,
                ':hover': !isInputDisabled ? {
                  background: 'rgba(170, 200, 220, 0.15)',
                  borderColor: COLORS.border.medium
                } : {}
              }}
              onMouseEnter={(e) => {
                if (!isInputDisabled) {
                  e.target.style.background = 'rgba(170, 200, 220, 0.15)';
                  e.target.style.borderColor = COLORS.border.medium;
                }
              }}
              onMouseLeave={(e) => {
                if (!isInputDisabled) {
                  e.target.style.background = 'rgba(170, 200, 220, 0.07)';
                  e.target.style.borderColor = COLORS.border.light;
                }
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
          padding: '10px 18px',
          borderRadius: 30,
          background: `linear-gradient(135deg, ${COLORS.accent.primary}15, ${COLORS.accent.secondary}15)`,
          border: `1px solid ${COLORS.border.medium}`,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: COLORS.risk.high,
            animation: 'pulse 1s ease infinite'
          }} />
          <span style={{ 
            fontSize: 13, 
            color: COLORS.text.primary,
            fontWeight: 500
          }}>
            Listening... Speak now
          </span>
          <button
            onClick={onStopListening}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: `1px solid ${COLORS.border.light}`,
              borderRadius: 16,
              padding: '4px 12px',
              color: COLORS.text.primary,
              cursor: 'pointer',
              fontSize: 12,
              transition: 'all 0.2s ease',
              ':hover': {
                background: COLORS.risk.high + '20',
                borderColor: COLORS.risk.high
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.background = COLORS.risk.high + '20';
              e.target.style.borderColor = COLORS.risk.high;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = COLORS.border.light;
            }}
          >
            Stop ✕
          </button>
        </div>
      )}

      {/* Input area */}
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-end',
        background: `linear-gradient(135deg, ${COLORS.background.light}80, ${COLORS.background.medium}80)`,
        border: `1px solid ${COLORS.border.medium}`,
        borderRadius: 30,
        padding: '8px 16px 8px 20px',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(8px)',
        opacity: disabled ? 0.6 : 1
      }}>
        {/* Microphone button */}
        {speechSupported && (
          <button
            onClick={isListening ? onStopListening : onStartListening}
            disabled={disabled}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              flexShrink: 0,
              border: 'none',
              background: isListening 
                ? `linear-gradient(135deg, ${COLORS.risk.high}, ${COLORS.risk.crisis || COLORS.risk.high})`
                : `linear-gradient(135deg, ${COLORS.accent.primary}, ${COLORS.accent.secondary})`,
              color: '#fff',
              cursor: disabled ? 'default' : 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.5 : 1,
              boxShadow: isListening ? `0 0 15px ${COLORS.risk.high}` : 'none',
              animation: isListening ? 'listeningPulse 1.5s infinite' : 'none',
              transition: 'all 0.2s ease',
              transform: isListening ? 'scale(1.05)' : 'scale(1)'
            }}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>
        )}

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isListening ? 'Listening...' : placeholder}
          rows={1}
          disabled={isInputDisabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: COLORS.text.primary,
            fontSize: 15,
            lineHeight: 1.5,
            fontFamily: 'inherit',
            maxHeight: maxHeight,
            overflowY: 'auto',
            outline: 'none',
            resize: 'none',
            caretColor: COLORS.accent.primary,
            padding: '10px 0',
            '::placeholder': {
              color: COLORS.text.muted,
              opacity: 0.7
            }
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isInputDisabled || !value.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            flexShrink: 0,
            background: value.trim() && !isInputDisabled
              ? `linear-gradient(135deg, ${COLORS.accent.primary}, ${COLORS.accent.secondary})`
              : `linear-gradient(135deg, ${COLORS.background.light}, ${COLORS.background.medium})`,
            border: `1px solid ${value.trim() && !isInputDisabled ? COLORS.accent.primary : COLORS.border.light}`,
            cursor: value.trim() && !isInputDisabled ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            transition: 'all 0.2s ease',
            boxShadow: value.trim() && !isInputDisabled
              ? `0 0 16px ${COLORS.accent.primary}80`
              : 'none',
            color: value.trim() && !isInputDisabled ? '#fff' : COLORS.text.muted,
            opacity: isInputDisabled ? 0.5 : 1
          }}
          title="Send message"
        >
          📤
        </button>
      </div>

      {/* Character count (optional) */}
      {value.length > 0 && (
        <div style={{
          textAlign: 'right',
          fontSize: 11,
          color: COLORS.text.muted,
          marginTop: 6,
          paddingRight: 8
        }}>
          {value.length} characters
        </div>
      )}
    </div>
  );
}

// Default props
ChatInput.defaultProps = {
  placeholder: "Share what's on your mind... (Shift+Enter for new line)",
  maxHeight: 120,
  showQuickReplies: true,
  disabled: false
};