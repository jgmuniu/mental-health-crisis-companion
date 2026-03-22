import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Calls backend which calls Groq/AI ─────────────────────────────────────
const generateSummary = async (messages) => {
  const conversation = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`)
    .join('\n\n');

  const prompt = `You are a compassionate mental health companion assistant. 
A support conversation just ended. Analyze it and respond with ONLY valid JSON in this exact format:

{
  "summary": "2-3 sentence summary of what the person shared and the main themes discussed. Be warm and specific.",
  "themes": ["theme1", "theme2", "theme3"],
  "progress": "One sentence noting any positive moment, insight, or step forward — however small.",
  "followUps": [
    "A thoughtful follow-up question related to what they shared",
    "Another question to deepen reflection or explore something they mentioned",
    "A question about next steps or what might help them"
  ],
  "affirmation": "A single short, genuine sentence of encouragement tailored to what they shared."
}

The conversation:
${conversation}

Respond with ONLY the JSON object, no markdown, no explanation.`;

  const response = await fetch(`${API_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
    body: JSON.stringify({
      message: prompt,
      session_id: 'summary_' + Date.now(),
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) throw new Error('Summary request failed');
  const data = await response.json();
  const text = data.response || '';

  // Strip markdown fences if present
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(clean);
};

// ── Hook ──────────────────────────────────────────────────────────────────
export const useSessionSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async (messages) => {
    // Need at least 3 exchanges to summarize
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length < 2) return;

    setLoading(true);
    setError(null);
    try {
      const result = await generateSummary(messages);
      setSummary(result);
    } catch (err) {
      console.warn('Summary generation failed:', err);
      setError('Could not generate summary.');
      // Graceful fallback
      setSummary({
        summary: 'Thank you for sharing today. Your conversation has been saved.',
        themes: [],
        progress: 'You reached out — that takes courage.',
        followUps: [
          'How are you feeling compared to when you started this conversation?',
          'What is one small thing you could do for yourself today?',
          'Is there anything you want to explore further next time?'
        ],
        affirmation: 'You did something meaningful by taking time to check in with yourself.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => { setSummary(null); setError(null); }, []);

  return { summary, loading, error, generate, clear };
};