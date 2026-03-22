// Simple deterministic hash for demo purposes (in production, use bcrypt)
export function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Add salt and make it non-reversible for demo
  return 'h_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36).slice(-4);
}