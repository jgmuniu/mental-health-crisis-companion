import React from 'react';
import { Stars } from './Stars';
import { Header } from './Header'; // ✅ Fixed: named import to match "export const Header" in Header.jsx

export const Layout = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: 'linear-gradient(160deg, #0A0F1A 0%, #1A2634 50%, #0A1520 100%)',
      color: '#E8EDF5'
    }}>
      <Stars />
      <Header />
      <main style={{
        paddingTop: '80px',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;