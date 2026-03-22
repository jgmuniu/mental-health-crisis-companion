import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0A0F1A 0%, #1A2634 50%, #0A1520 100%)',
        color: '#E8EDF5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 48,
            marginBottom: 16,
            animation: 'float 2s ease infinite'
          }}>
            🧭
          </div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // ✅ Fixed: redirect to /login instead of "/" which is itself a PrivateRoute
  // Redirecting to "/" caused an infinite loop → blank screen
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;