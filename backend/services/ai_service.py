from groq import Groq
from flask import current_app
import json


class AIService:
    """Handles all AI interactions using Groq (free tier)"""

    # Default system prompt — used when no language-specific prompt is sent from frontend
    DEFAULT_SYSTEM_PROMPT = """You are Rafiki (Swahili for "Friend"), a compassionate AI mental health support companion designed for Kenyans experiencing depression, suicidal ideation and acute mental health crises.

IDENTITY & CONTEXT:
- You understand the Kenyan cultural context: stigma around mental health, economic barriers to care, rural isolation, the weight of community expectations, and the particular pressures Kenyan youth face.
- You know Kenya has very few psychiatrists (approximately 1 per 500,000 people), that most are in Nairobi/Mombasa/Kisumu, and that cost and stigma are massive barriers.
- You know Befrienders Kenya is a key local crisis resource (0800 723 253 - free).
- You are a BRIDGE to professional care, not a replacement.

CORE PRINCIPLES:
1. LISTEN FIRST. Reflect back. Never rush to solutions.
2. VALIDATE always: "That sounds incredibly hard." "It makes complete sense you feel that way."
3. NEVER minimize: Do not say "others have it worse" or "you have so much to live for."
4. ONE question at a time. Never overwhelm someone in distress.
5. Keep responses SHORT and warm - 2-4 sentences maximum.
6. ALWAYS respond directly and specifically to what the person just said.

CRISIS PROTOCOL:
- If someone expresses immediate danger, respond with warmth and urgency: "I hear you, and your safety is the most important thing right now. Please reach out to Befrienders Kenya immediately - 0800 723 253 - it is completely free and confidential."

TONE: Warm, gentle, unhurried. Like a trusted friend sitting with you, fully present, fully listening."""

    # Swahili system prompt — used when frontend detects Swahili input
    SWAHILI_SYSTEM_PROMPT = """Wewe ni Rafiki, msaidizi wa afya ya akili wa Kenya anayetoa msaada wa kihisia kwa huruma na bila kuhukumu.

MUKTADHA WA KENYA:
- Unaelewa hali ya Kenya: unyanyapaa wa afya ya akili, vikwazo vya kiuchumi, upweke wa vijijini, na mzigo wa matarajio ya jamii.
- Unajua rasilimali za msaada: Befrienders Kenya (0800 723 253 - bure), Niskize (0900 620 800), EMKF (0800 723 253).
- Wewe ni DARAJA kwa huduma za kitaalamu, si mbadala.

KANUNI ZA MSINGI:
1. SIKILIZA KWANZA. Rudia ulichosikia. Usikimbilie kutoa suluhu.
2. THIBITISHA daima: "Hiyo inasikika vigumu sana." "Inaeleweka kabisa kuhisi hivyo."
3. Jibu kwa KISWAHILI safi na cha kawaida — lugha ya mazungumzo, si rasmi sana.
4. SWALI MOJA kwa wakati. Usimfurishie mtu aliye katika msongo.
5. Majibu MAFUPI na ya joto — sentensi 2-4 tu.
6. Jibu moja kwa moja kwa kile mtu alichosema.

ITIFAKI YA DHARURA:
- Ikiwa mtu anaonyesha hatari ya papo hapo: "Ninakusikia, na usalama wako ndio muhimu zaidi sasa hivi. Tafadhali wasiliana na Befrienders Kenya mara moja - 0800 723 253 - ni bure kabisa na siri."

SAUTI: Ya joto, pole, isiyo na haraka. Kama rafiki wa kuamini anayekaa nawe, akisikiliza kwa makini."""

    def __init__(self, app=None):
        self.client = None
        if app:
            self.init_app(app)

    def init_app(self, app):
        api_key = app.config.get('GROQ_API_KEY')
        if api_key:
            self.client = Groq(api_key=api_key)
            print('Groq client initialized successfully')
        else:
            print('WARNING: GROQ_API_KEY not found in config')
        self.app = app

    def generate_response(self, messages, user_context=None, system_prompt=None):
        """
        Generate AI response.
        
        Args:
            messages: list of {role, content} dicts
            user_context: optional dict with name, has_history
            system_prompt: optional override — sent from frontend when
                           language detection switches to Swahili/English
        """
        try:
            if not self.client:
                if current_app:
                    self.init_app(current_app._get_current_object())
                if not self.client:
                    print('GROQ CLIENT IS NONE - API key missing')
                    return {
                        'success': True,
                        'response': self._get_fallback_response(messages),
                        'usage': {}
                    }

            # Priority: frontend-provided prompt → default English prompt
            # The frontend sends the correct language prompt automatically
            active_prompt = system_prompt if system_prompt else self.DEFAULT_SYSTEM_PROMPT

            # Append user context if available
            if user_context:
                active_prompt += f"\n\nUser context: {json.dumps(user_context)}"

            formatted_messages = [{"role": "system", "content": active_prompt}]
            for msg in messages:
                formatted_messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })

            print(f'Calling Groq API with {len(messages)} messages...')

            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                max_tokens=300,
                temperature=0.7,
                messages=formatted_messages
            )

            response_text = response.choices[0].message.content
            print('Groq response received successfully')

            return {
                'success': True,
                'response': response_text,
                'usage': {
                    'input_tokens': response.usage.prompt_tokens,
                    'output_tokens': response.usage.completion_tokens
                }
            }

        except Exception as e:
            print(f'GROQ API ERROR: {type(e).__name__}: {e}')
            return {
                'success': True,
                'response': self._get_fallback_response(messages),
                'usage': {},
                'error': str(e)
            }

    def _get_fallback_response(self, messages):
        """Keyword-based fallback when Groq is unavailable."""
        last_message = ""
        for msg in reversed(messages):
            if msg.get('role') == 'user':
                last_message = msg.get('content', '')
                break

        if not last_message:
            return "I'm here to listen. How are you feeling today?"

        msg_lower = last_message.lower()

        # Swahili crisis keywords
        if any(w in msg_lower for w in ['kujiua', 'nijidhuru', 'sina matumaini', 'sitaki kuishi']):
            return "Ninakusikia, na usalama wako ndio muhimu zaidi sasa hivi. Tafadhali wasiliana na Befrienders Kenya - 0800 723 253 - ni bure kabisa."

        # English crisis keywords
        if any(w in msg_lower for w in ['suicide', 'kill myself', 'end my life', 'want to die']):
            return "I'm very concerned about what you're sharing. Please reach out to Befrienders Kenya immediately at 0800 723 253 — it's free and confidential."

        # Swahili distress
        if any(w in msg_lower for w in ['huzuni', 'wasiwasi', 'naogopa', 'nimechoka', 'peke yangu']):
            return "Ninakusikia. Asante kwa kunieleza hilo. Je, unaweza kunieleza zaidi kuhusu unachopitia?"

        # English distress
        if any(w in msg_lower for w in ['anxious', 'anxiety', 'worry', 'stressed']):
            return "It sounds like you're feeling anxious. That's completely understandable. Would you like to talk more about what's causing these feelings?"

        if any(w in msg_lower for w in ['sad', 'depressed', 'down', 'hopeless']):
            return "I hear that you're feeling really low right now. Thank you for sharing that with me. Can you tell me more about what's been happening?"

        return "Thank you for sharing that. I'm here to listen and support you. Would you like to tell me more?"

    def analyze_sentiment(self, text):
        positive_words = ['good', 'great', 'happy', 'glad', 'better', 'hope', 'grateful']
        negative_words = ['sad', 'bad', 'terrible', 'awful', 'hopeless', 'worthless', 'alone']
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        return 'neutral'

    def extract_crisis_indicators(self, text):
        text_lower = text.lower()
        return {
            'self_harm':     any(w in text_lower for w in ['hurt myself', 'cut', 'self harm', 'nijidhuru']),
            'suicidal':      any(w in text_lower for w in ['kill myself', 'suicide', 'end my life', 'kujiua']),
            'hopelessness':  any(w in text_lower for w in ['no hope', 'hopeless', 'pointless', 'sina matumaini']),
            'worthlessness': any(w in text_lower for w in ['worthless', 'burden', 'useless', 'sina thamani']),
            'isolation':     any(w in text_lower for w in ['alone', 'nobody', 'no one', 'peke yangu']),
            'anxiety':       any(w in text_lower for w in ['anxious', 'panic', 'scared', 'fear', 'wasiwasi'])
        }