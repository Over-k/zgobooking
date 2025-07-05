import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class PasswordManager {
  private static readonly SALT_LENGTH = 32;
  private static readonly KEY_LENGTH = 64;

  /**
   * Hash a password with a random salt
   */
  static async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = randomBytes(this.SALT_LENGTH).toString('hex');
    const hash = (await scryptAsync(password, salt, this.KEY_LENGTH)) as Buffer;
    return {
      hash: hash.toString('hex'),
      salt,
    };
  }

  /**
   * Verify a password against a stored hash and salt
   */
  static async verifyPassword(
    password: string,
    storedHash: string,
    storedSalt: string
  ): Promise<boolean> {
    try {
      const hash = (await scryptAsync(password, storedSalt, this.KEY_LENGTH)) as Buffer;
      const storedHashBuffer = Buffer.from(storedHash, 'hex');
      
      // Check if the stored hash has the correct length
      if (storedHashBuffer.length !== this.KEY_LENGTH) {
        throw new Error('Stored hash has invalid length');
      }

      return timingSafeEqual(storedHashBuffer, hash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Generate a secure random token
   */
  static generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
} 