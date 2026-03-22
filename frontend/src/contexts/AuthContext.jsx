import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken]     = useState(localStorage.getItem('token'))

  useEffect(() => {
    // Anonymous session takes priority
    const savedAnon = localStorage.getItem('anonymous_user')
    if (savedAnon) {
      try { setUser(JSON.parse(savedAnon)) } catch {}
      setLoading(false)
      return
    }

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    // If offline, keep token but don't crash — user will re-auth when back online
    if (!navigator.onLine) {
      setLoading(false)
      return
    }
    try {
      const response = await axios.get(`${API}/auth/me`)
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // 401/403 = stale token → logout. Network errors → keep token, try again later
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout()
      } else {
        // Network error — don't log out, just stop loading
        setLoading(false)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Anonymous ─────────────────────────────────────────────────────────
  const loginAnonymous = () => {
    const anonUser = { id: null, username: 'Anonymous', isAnonymous: true }
    localStorage.setItem('anonymous_user', JSON.stringify(anonUser))
    setUser(anonUser)
  }

  // ── Login ─────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password })
      const { access_token, user: userData } = response.data
      if (!access_token) return { success: false, error: 'No token received from server' }
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      setToken(access_token)
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  // ── Register ──────────────────────────────────────────────────────────
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { username, email, password })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' }
    }
  }

  // ── Change password ───────────────────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post(`${API}/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
      })
      return { success: true, message: response.data.message || 'Password updated.' }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Could not update password.' }
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('anonymous_user')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    loginAnonymous,
    register,
    changePassword,
    logout,
    isAuthenticated: !!user,
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0D1B2A',
        color: '#A5C8D8', fontSize: 16, fontFamily: 'sans-serif'
      }}>
        Loading...
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}