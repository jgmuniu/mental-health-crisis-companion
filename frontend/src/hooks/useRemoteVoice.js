// src/hooks/useRemoteVoice.js
// Polls backend every 5s for voice state changes from another device

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const POLL_INTERVAL = 5000; // 5 seconds

export const useRemoteVoice = (localVoiceEnabled, onRemoteChange) => {
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [remoteSource, setRemoteSource] = useState('default');
  const pollRef = useRef(null);
  const tokenRef = useRef(localStorage.getItem('token'));

  const fetchState = useCallback(async () => {
    // Only poll if logged in — anonymous users can't have remote control
    tokenRef.current = localStorage.getItem('token');
    if (!tokenRef.current) return;

    try {
      const response = await axios.get(`${API_URL}/voice/state`);
      const { voice_enabled, updated_at, source } = response.data;

      setRemoteSource(source);

      // Only apply if this is a NEW remote change (has updated_at and it's newer)
      if (source === 'remote' && updated_at && updated_at !== lastUpdatedAt) {
        setLastUpdatedAt(updated_at);
        // Tell ChatApp to update its voice state
        if (typeof voice_enabled === 'boolean' && voice_enabled !== localVoiceEnabled) {
          onRemoteChange(voice_enabled);
        }
      }
    } catch (err) {
      // Silently ignore — network errors, offline, etc.
    }
  }, [lastUpdatedAt, localVoiceEnabled, onRemoteChange]);

  // Start polling when component mounts
  useEffect(() => {
    fetchState(); // immediate first check
    pollRef.current = setInterval(fetchState, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchState]);

  // Push local change to backend so other devices see it
  const pushState = useCallback(async (enabled) => {
    if (!localStorage.getItem('token')) return;
    try {
      await axios.post(`${API_URL}/voice/state`, { voice_enabled: enabled });
    } catch {}
  }, []);

  return { pushState, remoteSource };
};