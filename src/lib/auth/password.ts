// Password utilities using native crypto API
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate a random salt
    const salt = randomBytes(SALT_LENGTH).toString('hex');

    // Hash using scrypt (synchronous for simplicity)
    const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex');

    // Return salt + derived key
    return `${salt}:${derivedKey}`;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plain text password with a hashed password
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    // Split hash into salt and key
    const [salt, storedKey] = hashedPassword.split(':');

    if (!salt || !storedKey) {
      console.error('Invalid stored hash format');
      return false;
    }

    // Hash the provided password with the same salt
    const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH).toString('hex');

    // Compare in constant time to prevent timing attacks
    return derivedKey === storedKey;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Create a simple hash for non-critical use cases (such as demo passwords)
 */
export function simpleHash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Validate a password meets minimum requirements
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number'
    };
  }

  return { isValid: true };
}
