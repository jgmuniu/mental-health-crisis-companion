import React from 'react';
import { COLORS } from '../../constants/colors';

export function CrisisBanner({ riskLevel, onClose, onShowMap }) {
  if (riskLevel < 2) return null;

  const getBannerStyle = () => {
    switch(riskLevel) {
      case 3:
        return {
          background: COLORS.risk.high + '30',
          border: `1px solid ${COLORS.risk.high}60`,
          color: COLORS.risk.high
        };
      case 2:
        return {
          background: COLORS.risk.elevated + '30',
          border: `1px solid ${COLORS.risk.elevated}60`,
          color: COLORS.risk.elevated
        };
      default:
        return {
          background: COLORS.risk.moderate + '30',
          border: `1px solid ${COLORS.risk.moderate}60`,
          color: COLORS.risk.moderate
        };
    }
  };

  const bannerStyle = getBannerStyle();

  return (
    <div style={{
      padding: '12px 20px',
      background: bannerStyle.background,
      borderBottom: bannerStyle.border,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      zIndex: 10,
      flexShrink: 0,
      animation: 'slideDown 0.3s ease'
    }}>
      <span style={{ fontSize: 16 }}>
        {riskLevel === 3 ? '🚨' : '💛'}
      </span>
      
      <span style={{
        fontSize: 13,
        color: COLORS.text.primary,
        flex: 1,
        lineHeight: 1.5
      }}>
        {riskLevel === 3 ? (
          <>
            <strong>We're deeply concerned about you.</strong> Please reach out immediately:
            <a href="tel:988" style={{
              color: COLORS.risk.high,
              fontWeight: 600,
              marginLeft: 4,
              marginRight: 4
            }}>
              Call or Text 988
            </a>
            (Suicide & Crisis Lifeline) - Free, confidential, 24/7
          </>
        ) : (
          <>
            <strong>We hear you.</strong> Support is available:
            <a href="tel:988" style={{
              color: COLORS.risk.elevated,
              fontWeight: 600,
              marginLeft: 4,
              marginRight: 4
            }}>
              Call 988
            </a>
            or text HOME to 741741
          </>
        )}
      </span>

      <div style={{ display: 'flex', gap: 8 }}>
        {riskLevel === 3 && (
          <button
            onClick={onShowMap}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 11,
              cursor: 'pointer',
              background: COLORS.risk.high + '40',
              color: COLORS.text.primary,
              border: `1px solid ${COLORS.risk.high}80`,
              fontWeight: 500
            }}
          >
            🗺️ Open Facility Map
          </button>
        )}
        
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.text.muted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '0 4px'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}