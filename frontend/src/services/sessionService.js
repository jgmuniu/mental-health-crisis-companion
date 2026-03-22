import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const saveSession = async (sessionData) => {
  try {
    const response = await axios.post(`${API_URL}/chat/sessions`, sessionData); // ✅ Fixed
    return response.data;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
};

export const getSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/chat/sessions`); // ✅ Fixed
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const getSession = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}/chat/sessions/${sessionId}`); // ✅ Fixed: added sessionId
    return response.data;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};

export const deleteSession = async (sessionId) => {
  try {
    const response = await axios.delete(`${API_URL}/chat/sessions/${sessionId}`); // ✅ Fixed: added sessionId
    return response.data;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

export const exportSessions = async () => {
  try {
    const response = await axios.post(`${API_URL}/chat/export`); // ✅ Fixed
    return response.data;
  } catch (error) {
    console.error('Error exporting sessions:', error);
    throw error;
  }
};