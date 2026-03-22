import spacy
import re
from transformers import pipeline
import numpy as np

class RiskDetector:
    """Advanced NLP-based risk detection using spaCy and transformers"""
    
    def __init__(self):
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            # Download if not available
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
        
        # Load sentiment analysis pipeline
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
        
        # Crisis patterns
        self.crisis_patterns = {
            'self_harm': [
                r'\b(hurt|harm|cut|burn) (myself|me)\b',
                r'\b(self[-\s]?harm)\b',
                r'\bcutting\b'
            ],
            'suicidal': [
                r'\b(kill|end|take) (myself|my life)\b',
                r'\bsuicide\b',
                r'\b(no reason|nothing) to live\b',
                r'\bbetter off dead\b'
            ],
            'hopelessness': [
                r'\b(no hope|hopeless)\b',
                r'\b(can\'?t|cannot) (go on|continue)\b',
                r'\b(pointless|meaningless)\b'
            ],
            'worthlessness': [
                r'\b(worthless|burden|useless)\b',
                r'\b(no one|nobody) (cares|needs|wants) me\b'
            ],
            'isolation': [
                r'\b(alone|lonely)\b',
                r'\bno (one|body) (to talk to|understands)\b',
                r'\bisolation\b'
            ]
        }
    
    def analyze_text(self, text):
        """Comprehensive text analysis"""
        doc = self.nlp(text)
        
        # Basic metrics
        metrics = {
            'word_count': len([token for token in doc if not token.is_punct]),
            'sentence_count': len(list(doc.sents)),
            'avg_word_length': np.mean([len(token.text) for token in doc if not token.is_punct]) if doc else 0
        }
        
        # Sentiment analysis
        sentiment = self.sentiment_analyzer(text[:512])[0]  # Limit to 512 chars
        
        # Extract entities
        entities = [
            {
                'text': ent.text,
                'label': ent.label_,
                'start': ent.start_char,
                'end': ent.end_char
            }
            for ent in doc.ents
        ]
        
        # Crisis pattern detection
        crisis_indicators = self.detect_crisis_patterns(text)
        
        # POS tagging for emotional indicators
        emotional_words = []
        for token in doc:
            if token.pos_ in ['ADJ', 'VERB'] and token.text.lower() in [
                'sad', 'angry', 'scared', 'afraid', 'worried', 'anxious',
                'hopeless', 'worthless', 'alone', 'lonely', 'tired', 'exhausted'
            ]:
                emotional_words.append({
                    'word': token.text,
                    'pos': token.pos_,
                    'sentiment': 'negative'
                })
        
        # Calculate risk score (0-1)
        risk_score = self.calculate_risk_score(
            sentiment, crisis_indicators, emotional_words
        )
        
        # Determine risk level (0-3)
        if risk_score > 0.8:
            risk_level = 3
        elif risk_score > 0.5:
            risk_level = 2
        elif risk_score > 0.2:
            risk_level = 1
        else:
            risk_level = 0
        
        return {
            'risk_level': risk_level,
            'risk_score': risk_score,
            'sentiment': {
                'label': sentiment['label'],
                'score': sentiment['score']
            },
            'crisis_indicators': crisis_indicators,
            'emotional_words': emotional_words,
            'entities': entities,
            'metrics': metrics
        }
    
    def detect_crisis_patterns(self, text):
        """Detect crisis-related patterns using regex"""
        text_lower = text.lower()
        indicators = {}
        
        for category, patterns in self.crisis_patterns.items():
            matches = []
            for pattern in patterns:
                found = re.findall(pattern, text_lower, re.IGNORECASE)
                if found:
                    matches.extend(found)
            
            indicators[category] = {
                'detected': len(matches) > 0,
                'matches': matches,
                'count': len(matches)
            }
        
        return indicators
    
    def calculate_risk_score(self, sentiment, crisis_indicators, emotional_words):
        """Calculate risk score based on multiple factors"""
        score = 0.0
        weights = {
            'sentiment': 0.3,
            'crisis_indicators': 0.5,
            'emotional_words': 0.2
        }
        
        # Sentiment contribution
        if sentiment['label'] == 'NEGATIVE':
            score += weights['sentiment'] * sentiment['score']
        
        # Crisis indicators contribution
        crisis_score = 0
        total_indicators = len(crisis_indicators)
        if total_indicators > 0:
            detected_count = sum(1 for v in crisis_indicators.values() if v['detected'])
            crisis_score = detected_count / total_indicators
        score += weights['crisis_indicators'] * crisis_score
        
        # Emotional words contribution
        if emotional_words:
            emotional_score = min(len(emotional_words) / 10, 1.0)  # Cap at 10 words
            score += weights['emotional_words'] * emotional_score
        
        return min(score, 1.0)  # Ensure score doesn't exceed 1

    def extract_risk_factors(self, text):
        """Extract specific risk factors for clinical relevance"""
        factors = []
        
        # Check for specific risk factors
        if re.search(r'\b(plan|method|how to|going to)\b.*\b(kill|hurt|die)\b', text, re.IGNORECASE):
            factors.append('has_plan')
        
        if re.search(r'\b(today|tonight|right now|immediately)\b.*\b(kill|hurt|die)\b', text, re.IGNORECASE):
            factors.append('imminent_risk')
        
        if re.search(r'\b(means|pills|weapon|gun|rope)\b', text, re.IGNORECASE):
            factors.append('has_means')
        
        if re.search(r'\b(goodbye|farewell|last time)\b', text, re.IGNORECASE):
            factors.append('saying_goodbye')
        
        if re.search(r'\b(gave away|donated|giving away)\b.*\b(belongings|possessions)\b', text, re.IGNORECASE):
            factors.append('giving_away_possessions')
        
        return factors
    
    def get_safety_plan_suggestions(self, risk_level, risk_factors):
        """Generate personalized safety plan suggestions"""
        suggestions = []
        
        if risk_level >= 2:
            suggestions.append({
                'step': 1,
                'action': 'Contact crisis support immediately',
                'resources': [
                    {'type': 'call', 'number': '988'},
                    {'type': 'text', 'number': '741741', 'message': 'HOME'}
                ]
            })
            
            suggestions.append({
                'step': 2,
                'action': 'Remove access to means of harm',
                'details': 'If you have access to weapons or pills, ask someone to remove them or move away from them'
            })
        
        if risk_level >= 1:
            suggestions.append({
                'step': 3,
                'action': 'Reach out to a trusted person',
                'details': 'Contact a friend, family member, or someone you trust'
            })
            
            suggestions.append({
                'step': 4,
                'action': 'Use grounding techniques',
                'techniques': [
                    '5-4-3-2-1 technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
                    'Deep breathing: Inhale for 4, hold for 4, exhale for 6',
                    'Focus on your immediate environment'
                ]
            })
        
        return suggestions