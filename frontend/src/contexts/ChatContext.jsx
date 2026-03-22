import React, { createContext, useState, useContext } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [riskLevel, setRiskLevel] = useState(0)
  const { isAuthenticated } = useAuth()

  const sendMessage = async (content) => {
    try {
      setLoading(true)

      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, userMessage])

      // ✅ Fixed: backticks so env var is actually interpolated
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/chat/message`, {
        message: content,
        session_id: sessionId,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })

      const data = response.data

      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id)
      }

      if (data.risk_level !== undefined) {
        setRiskLevel(data.risk_level)
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiMessage])

      return {
        success: true,
        crisisResources: data.crisis_resources,
        riskLevel: data.risk_level
      }
    } catch (error) {
      console.error('Failed to send message:', error)

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])

      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send message'
      }
    } finally {
      setLoading(false)
    }
  }

  const loadSession = async (sessionId) => {
    if (!isAuthenticated) return

    try {
      // ✅ Fixed: backticks so env var is actually interpolated
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/sessions/`)
      const session = response.data.session

      if (session && session.messages) {
        setMessages(session.messages)
        setSessionId(session.session_id)
        setRiskLevel(session.max_risk_level || 0)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const clearChat = () => {
    setMessages([])
    setSessionId(null)
    setRiskLevel(0)
  }

  const value = {
    messages,
    loading,
    sessionId,
    riskLevel,
    sendMessage,
    loadSession,
    clearChat
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}