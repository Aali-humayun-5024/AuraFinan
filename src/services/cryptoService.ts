// AuraFinance OS — Web Crypto API AES-GCM (256-bit) Vault Encryption & Backup Service
// Offloaded to dedicated Web Worker when supported to maintain uninterrupted 60 FPS on main thread.

import { runInCryptoWorker } from './cryptoWorkerClient';

export interface EncryptedVaultBundle {
  isEncrypted: boolean;
  algorithm?: 'AES-GCM-256';
  salt?: number[];
  iv?: number[];
  encryptedData?: number[];
  plainData?: any;
  version: string;
  exportDate: string;
}

/**
 * Derives a 256-bit AES-GCM key from a user password and salt using PBKDF2 (main thread fallback)
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary database JSON with optional password using AES-GCM (256-bit)
 * Runs inside Web Worker when available.
 */
export async function createVaultBackup(data: any, password?: string): Promise<EncryptedVaultBundle> {
  const jsonString = JSON.stringify(data);

  try {
    const workerResult = await runInCryptoWorker<EncryptedVaultBundle>('ENCRYPT_VAULT', {
      jsonString,
      password,
    });
    return workerResult;
  } catch (workerErr) {
    // Graceful fallback to main-thread Web Crypto if worker is unavailable
    const exportDate = new Date().toISOString();
    const version = '1.0.0';

    if (!password || password.trim().length === 0) {
      return {
        isEncrypted: false,
        version,
        exportDate,
        plainData: data,
      };
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKeyFromPassword(password, salt);
    const encodedPayload = new TextEncoder().encode(jsonString);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedPayload
    );

    return {
      isEncrypted: true,
      algorithm: 'AES-GCM-256',
      version,
      exportDate,
      salt: Array.from(salt),
      iv: Array.from(iv),
      encryptedData: Array.from(new Uint8Array(encryptedBuffer)),
    };
  }
}

/**
 * Restores and decrypts vault backup bundle
 */
export async function restoreVaultBackup(
  bundle: EncryptedVaultBundle,
  password?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!bundle.isEncrypted && bundle.plainData) {
      return { success: true, data: bundle.plainData };
    }

    if (bundle.isEncrypted) {
      if (!password || password.trim().length === 0) {
        return { success: false, error: 'Password required to decrypt this backup file.' };
      }

      if (!bundle.salt || !bundle.iv || !bundle.encryptedData) {
        return { success: false, error: 'Corrupt encrypted backup file: Missing cryptographic headers.' };
      }

      try {
        const decryptedData = await runInCryptoWorker('DECRYPT_VAULT', { bundle, password });
        return { success: true, data: decryptedData };
      } catch (workerErr: any) {
        if (workerErr?.message && workerErr.message.includes('INVALID_PASSWORD')) {
          return { success: false, error: 'Incorrect password or authentication tag mismatch.' };
        }

        // Main thread fallback
        const salt = new Uint8Array(bundle.salt);
        const iv = new Uint8Array(bundle.iv);
        const encryptedData = new Uint8Array(bundle.encryptedData);
        const key = await deriveKeyFromPassword(password, salt);

        try {
          const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
          );
          const decodedText = new TextDecoder().decode(decryptedBuffer);
          const data = JSON.parse(decodedText);
          return { success: true, data };
        } catch {
          return { success: false, error: 'Incorrect password or authentication tag mismatch.' };
        }
      }
    }

    const rawAny = bundle as any;
    if (rawAny.transactions || rawAny.goals || rawAny.subscriptions) {
      return { success: true, data: bundle };
    }

    return { success: false, error: 'Unrecognized backup file structure.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Decryption failed.' };
  }
}

/**
 * Encrypts a raw JSON string into an armored AES-GCM (256-bit) + PBKDF2 container and returns a Blob
 */
export async function encryptJsonPayload(jsonString: string, password: string): Promise<Blob> {
  try {
    const workerResult = await runInCryptoWorker<any>('ENCRYPT_VAULT', { jsonString, password });
    const container = {
      isEncrypted: true,
      algorithm: 'AES-GCM-256',
      schemaVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      salt: workerResult.salt,
      iv: workerResult.iv,
      encryptedData: workerResult.encryptedData,
    };
    return new Blob([JSON.stringify(container, null, 2)], { type: 'application/json' });
  } catch {
    // Main thread fallback
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKeyFromPassword(password, salt);
    const encodedPayload = new TextEncoder().encode(jsonString);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedPayload
    );

    const container = {
      isEncrypted: true,
      algorithm: 'AES-GCM-256',
      schemaVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      salt: Array.from(salt),
      iv: Array.from(iv),
      encryptedData: Array.from(new Uint8Array(encryptedBuffer)),
    };

    return new Blob([JSON.stringify(container, null, 2)], { type: 'application/json' });
  }
}

/**
 * Decrypts an armored AES-GCM (256-bit) + PBKDF2 container string back to the plaintext JSON string
 */
export async function decryptJsonPayload(fileContent: string, password: string): Promise<string> {
  const container = JSON.parse(fileContent);
  if (!container.isEncrypted || !container.salt || !container.iv || !container.encryptedData) {
    throw new Error('Corrupt encrypted backup file: Missing cryptographic headers.');
  }

  try {
    const data = await runInCryptoWorker('DECRYPT_VAULT', { bundle: container, password });
    return JSON.stringify(data);
  } catch (workerErr: any) {
    if (workerErr?.message && workerErr.message.includes('INVALID_PASSWORD')) {
      throw new Error('Incorrect password or cryptographic authentication tag mismatch.');
    }

    // Main thread fallback
    const salt = new Uint8Array(container.salt);
    const iv = new Uint8Array(container.iv);
    const encryptedData = new Uint8Array(container.encryptedData);

    const key = await deriveKeyFromPassword(password, salt);
    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );
      return new TextDecoder().decode(decryptedBuffer);
    } catch {
      throw new Error('Incorrect password or cryptographic authentication tag mismatch.');
    }
  }
}
