import { useState, useCallback, useMemo } from 'react';
import { 
  RISK_LEVELS, 
  HIGH_RISK_KEYWORDS, 
  ELEVATED_RISK_KEYWORDS, 
  MODERATE_RISK_KEYWORDS,
  CRISIS_KEYWORDS,
  RISK_LEVEL_ORDER
} from '../constants/crisisKeywords';

export function useRiskDetection(initialText = '') {
  const [riskLevel, setRiskLevel] = useState(0);
  const [riskIndicators, setRiskIndicators] = useState({});
  const [lastAnalyzedText, setLastAnalyzedText] = useState(initialText);
  const [riskHistory, setRiskHistory] = useState([]);

  // Risk level mappings for consistent reference
  const RISK_SCORES = {
    CRISIS: 3,
    HIGH: 2,
    ELEVATED: 1,
    MODERATE: 1,
    LOW: 0
  };

  // Reverse mapping for level to enum
  const getRiskLevelEnum = useCallback((score) => {
    switch(score) {
      case 3: return RISK_LEVELS.CRISIS;
      case 2: return RISK_LEVELS.HIGH;
      case 1: return RISK_LEVELS.ELEVATED; // Could also be MODERATE
      default: return RISK_LEVELS.LOW;
    }
  }, []);

  const detectRiskLevel = useCallback((text) => {
    if (!text || typeof text !== 'string') {
      setRiskLevel(0);
      setRiskIndicators({});
      return 0;
    }
    
    const lowerText = text.toLowerCase();
    const detectedIndicators = {};
    let detectedLevel = 0;

    // Check crisis/immediate danger level first (highest priority)
    for (const keyword of CRISIS_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        detectedLevel = 3;
        detectedIndicators.crisis = true;
        detectedIndicators.matchedKeyword = keyword;
        break;
      }
    }
    
    // Then high risk
    if (detectedLevel === 0) {
      for (const keyword of HIGH_RISK_KEYWORDS) {
        if (lowerText.includes(keyword)) {
          detectedLevel = 2;
          detectedIndicators.highRisk = true;
          detectedIndicators.matchedKeyword = keyword;
          break;
        }
      }
    }
    
    // Then elevated risk
    if (detectedLevel === 0) {
      for (const keyword of ELEVATED_RISK_KEYWORDS) {
        if (lowerText.includes(keyword)) {
          detectedLevel = 1;
          detectedIndicators.elevatedRisk = true;
          detectedIndicators.matchedKeyword = keyword;
          break;
        }
      }
    }
    
    // Then moderate risk
    if (detectedLevel === 0) {
      for (const keyword of MODERATE_RISK_KEYWORDS) {
        if (lowerText.includes(keyword)) {
          detectedLevel = 1;
          detectedIndicators.moderateRisk = true;
          detectedIndicators.matchedKeyword = keyword;
          break;
        }
      }
    }

    // Update state
    setRiskLevel(detectedLevel);
    setRiskIndicators(detectedIndicators);
    setLastAnalyzedText(text);

    // Add to history if risk detected
    if (detectedLevel > 0) {
      setRiskHistory(prev => [
        ...prev.slice(-9), // Keep last 10 entries
        {
          timestamp: new Date().toISOString(),
          level: detectedLevel,
          indicators: detectedIndicators,
          textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
        }
      ]);
    }

    return detectedLevel;
  }, []);

  const getRiskLevelDescription = useCallback((level) => {
    const score = typeof level === 'number' ? level : RISK_SCORES[level] || 0;
    
    switch(score) {
      case 3:
        return {
          title: 'CRISIS - Immediate Danger',
          description: 'Immediate danger detected. Please seek emergency support immediately.',
          color: '#A13D3D',
          action: 'URGENT: Call emergency services or a crisis hotline now.',
          resources: ['988 Suicide & Crisis Lifeline', 'Crisis Text Line: HOME to 741741']
        };
      case 2:
        return {
          title: 'HIGH RISK - Urgent Concern',
          description: 'Self-harm indicators present. Please reach out for support.',
          color: '#D96C6C',
          action: 'Contact a crisis counselor or trusted person immediately.',
          resources: ['988 Lifeline', 'Crisis Text Line']
        };
      case 1:
        return {
          title: 'ELEVATED RISK - Significant Distress',
          description: 'Significant distress detected. Support is available.',
          color: '#E6A56C',
          action: 'Consider talking to a counselor or using coping strategies.',
          resources: ['Warm lines', 'Support groups', 'Self-care resources']
        };
      default:
        return {
          title: 'LOW RISK - Stable',
          description: 'No crisis indicators detected. Continue self-care.',
          color: '#4A908A',
          action: 'Maintain healthy habits and reach out if things change.',
          resources: ['Wellness resources', 'Self-care tips']
        };
    }
  }, []);

  const getRiskScore = useCallback((text) => {
    if (!text || typeof text !== 'string') return 0;
    
    const lowerText = text.toLowerCase();
    
    // Crisis level (3)
    if (CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
      return 3;
    }
    
    // High risk (2)
    if (HIGH_RISK_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
      return 2;
    }
    
    // Medium risk (1)
    if (ELEVATED_RISK_KEYWORDS.some(keyword => lowerText.includes(keyword)) || 
        MODERATE_RISK_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
      return 1;
    }
    
    return 0;
  }, []);

  const getMatchedKeywords = useCallback((text) => {
    if (!text || typeof text !== 'string') return [];
    
    const lowerText = text.toLowerCase();
    const matches = [];
    
    const checkKeywords = (keywords, level) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          matches.push({ keyword, level });
        }
      });
    };
    
    checkKeywords(CRISIS_KEYWORDS, 3);
    checkKeywords(HIGH_RISK_KEYWORDS, 2);
    checkKeywords(ELEVATED_RISK_KEYWORDS, 1);
    checkKeywords(MODERATE_RISK_KEYWORDS, 1);
    
    return matches;
  }, []);

  const resetRisk = useCallback(() => {
    setRiskLevel(0);
    setRiskIndicators({});
    setLastAnalyzedText('');
  }, []);

  const clearHistory = useCallback(() => {
    setRiskHistory([]);
  }, []);

  // Memoized risk level enum
  const riskLevelEnum = useMemo(() => {
    return getRiskLevelEnum(riskLevel);
  }, [riskLevel, getRiskLevelEnum]);

  // Memoized risk description
  const riskDescription = useMemo(() => {
    return getRiskLevelDescription(riskLevel);
  }, [riskLevel, getRiskLevelDescription]);

  return {
    // State
    riskLevel,
    riskLevelEnum,
    riskIndicators,
    riskDescription,
    riskHistory,
    lastAnalyzedText,
    
    // Methods
    detectRiskLevel,
    getRiskLevelDescription,
    getRiskScore,
    getMatchedKeywords,
    resetRisk,
    clearHistory,
    
    // Constants
    RISK_LEVELS,
    RISK_SCORES,
    RISK_LEVEL_ORDER,
    
    // Utilities
    hasRisk: riskLevel > 0,
    isCrisis: riskLevel === 3,
    isHighRisk: riskLevel === 2,
    isElevatedRisk: riskLevel === 1,
    isLowRisk: riskLevel === 0
  };
}

// Alternative simple version for basic use cases
export const useSimpleRiskDetection = () => {
  const detectRiskLevel = useCallback((text) => {
    if (!text) return 0;
    
    const textLower = text.toLowerCase();
    
    // Crisis level
    if (CRISIS_KEYWORDS.some(keyword => textLower.includes(keyword))) {
      return 3;
    }
    if (HIGH_RISK_KEYWORDS.some(keyword => textLower.includes(keyword))) {
      return 2;
    }
    if (ELEVATED_RISK_KEYWORDS.some(keyword => textLower.includes(keyword)) || 
        MODERATE_RISK_KEYWORDS.some(keyword => textLower.includes(keyword))) {
      return 1;
    }
    return 0;
  }, []);

  return { detectRiskLevel };
};

export default useRiskDetection;