// Simple base64 encoding for Edge Runtime compatibility
const SECRET_KEY = process.env.PASSWORD_ENCRYPTION_KEY || 'your-32-character-secret-key-here!!';

// Simple XOR encryption (not cryptographically secure, but works in Edge Runtime)
function simpleEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode
}

function simpleDecrypt(encrypted: string, key: string): string {
  const decoded = atob(encrypted); // Base64 decode
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

export function encryptPassword(password: string): string {
  try {
    return simpleEncrypt(password, SECRET_KEY);
  } catch (error) {
    throw new Error('Failed to encrypt password');
  }
}

export function decryptPassword(encryptedPassword: string): string {
  try {
    return simpleDecrypt(encryptedPassword, SECRET_KEY);
  } catch (error) {
    throw new Error('Failed to decrypt password');
  }
}

// For backward compatibility with bcrypt hashes
export function isEncryptedPassword(password: string): boolean {
  // Check if it's base64 encoded (our new format) and not a bcrypt hash
  if (isBcryptHash(password)) {
    return false;
  }
  
  try {
    // Try to decode as base64 - if it succeeds and re-encoding gives the same result, it's our format
    const decoded = atob(password);
    return btoa(decoded) === password && decoded.length > 0;
  } catch {
    return false;
  }
}

export function isBcryptHash(password: string): boolean {
  return password.startsWith('$2b') || password.startsWith('$2a') || password.startsWith('$2y');
}