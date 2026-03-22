import React from 'react';
import { COLORS } from '../../constants/colors';
import { formatTime } from '../../utils/formatters';

export function MessageBubble({ message, isNew, isSpeaking }) {
  const isUser = message.role === 'user';
  const isCritical = message.critical;

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 18,
      animation: isNew ? 'slideIn 0.35s ease forwards' : 'none'
    }}>
      {!isUser && (
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #A5C8D8, #4A6A8A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
          marginRight: 10,
          marginTop: 2,
          boxShadow: isSpeaking 
            ? `0 0 22px ${COLORS.accent.primary}cc` 
            : `0 0 12px ${COLORS.accent.primary}66`,
          transition: 'box-shadow 0.3s ease'
        }}>
          🕊️
        </div>
      )}

      <div style={{ maxWidth: '76%' }}>
        {!isUser && (
          <div style={{
            fontSize: 11,
            color: COLORS.text.secondary,
            marginBottom: 4,
            paddingLeft: 2
          }}>
            Companion
          </div>
        )}

        <div style={{
          padding: '13px 18px',
          borderRadius: isUser
            ? '20px 20px 6px 20px'
            : '6px 20px 20px 20px',
          background: isUser
            ? `linear-gradient(135deg, ${COLORS.accent.primary}40, ${COLORS.accent.secondary}30)`
            : isCritical
              ? COLORS.risk.high + '20'
              : 'rgba(255, 255, 255, 0.04)',
          border: isUser
            ? `1px solid ${COLORS.border.medium}`
            : isCritical
              ? `1px solid ${COLORS.risk.high}40`
              : `1px solid ${COLORS.border.light}`,
          color: isUser ? COLORS.text.primary : COLORS.text.primary,
          fontSize: 15,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {message.content}
          
          {message.critical && (
            <div style={{
              marginTop: 10,
              padding: '8px 12px',
              borderRadius: 8,
              background: COLORS.risk.high + '30',
              border: `1px solid ${COLORS.risk.high}50`,
              fontSize: 12,
              color: COLORS.text.primary
            }}>
              🚨 A map of nearby mental health facilities has been opened for you.
              Please call 988 immediately for immediate support.
            </div>
          )}
        </div>

        <div style={{
          fontSize: 10,
          color: COLORS.text.muted,
          marginTop: 4,
          textAlign: isUser ? 'right' : 'left',
          paddingLeft: 2
        }}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}