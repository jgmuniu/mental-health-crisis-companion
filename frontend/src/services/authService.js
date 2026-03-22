import { hashPassword } from '../utils/hashPassword';

const STORAGE_PREFIX = 'mhc_user_';

export async function createUser(email, password, name) {
  try {
    const userKey = STORAGE_PREFIX + email.toLowerCase().trim();
    
    // Check if user already exists
    const existing = await window.storage?.get(userKey);
    if (existing) {
      throw new Error('User already exists');
    }

    const userData = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      sessions: 0,
      isAnonymous: false
    };

    // Store user data
    if (window.storage) {
      await window.storage.set(userKey, JSON.stringify(userData));
      
      // Log registration for research purposes (anonymized)
      await window.storage.set(`mhc_registry_${Date.now()}`, JSON.stringify({
        timestamp: userData.createdAt,
        userId: userData.id
      }), true);
    } else {
      // Fallback to localStorage
      localStorage.setItem(userKey, JSON.stringify(userData));
    }

    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    const userKey = STORAGE_PREFIX + email.toLowerCase().trim();
    let userData;

    if (window.storage) {
      const result = await window.storage.get(userKey);
      userData = JSON.parse(result.value);
    } else {
      const stored = localStorage.getItem(userKey);
      if (!stored) throw new Error('User not found');
      userData = JSON.parse(stored);
    }

    // Verify password
    if (userData.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid password');
    }

    // Update login metadata
    userData.sessions = (userData.sessions || 0) + 1;
    userData.lastLogin = new Date().toISOString();

    // Save updated data
    if (window.storage) {
      await window.storage.set(userKey, JSON.stringify(userData));
    } else {
      localStorage.setItem(userKey, JSON.stringify(userData));
    }

    // Remove sensitive data before returning
    const { passwordHash, ...safeUserData } = userData;
    return { success: true, user: safeUserData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function createAnonymousUser() {
  return {
    id: 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: 'Anonymous User',
    email: null,
    createdAt: new Date().toISOString(),
    isAnonymous: true
  };
}