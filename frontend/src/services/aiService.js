import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const sendMessageToAI = async (message, sessionId, messages, systemPrompt = null) => {
  try {
    const response = await axios.post(`${API_URL}/chat/message`, {
      message,
      session_id: sessionId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      system_prompt: systemPrompt,
    });

    // SW returns { offline: true } with status 503 when no network
    // axios throws on non-2xx, but SW returns 503 so we check here
    if (response.data?.offline) {
      throw new Error('offline');
    }

    return response.data;
  } catch (error) {
    // Re-throw so ChatApp can catch and use getOfflineFallback()
    console.error('Error sending message to AI:', error);
    throw error;
  }
};

export const analyzeText = async (text, location = null) => {
  try {
    const response = await axios.post(`${API_URL}/chat/analyze`, {
      text,
      location,
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};