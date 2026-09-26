import { AuraEncryptedVaultJSON, AuraMasterVaultJSON } from '../types/vault';

export class CryptoVaultService {
  private static textEncoder = new TextEncoder();
  private static textDecoder = new TextDecoder();

  // Helper: Buffer to Hex
  private static bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Helper: Hex to Uint8Array
  private static hexToBuf(hex: string): Uint8Array {
    const cleanHex = hex.trim();
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Helper: ArrayBuffer to Base64
  private static bufToBase64(buf: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buf);
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return window.btoa(binary);
  }

  // Helper: Base64 to ArrayBuffer
  private static base64ToBuf(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Derive AES-GCM 256-bit Key from Password + Salt using PBKDF2 (100,000 iterations)
   */
  private static async deriveKey(password: string, salt: Uint8Array, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      this.textEncoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      [usage]
    );
  }

  /**
   * Encrypt master vault object into a secure JSON container
   */
  static async encryptVault(rawVault: AuraMasterVaultJSON, password: string): Promise<AuraEncryptedVaultJSON> {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt, 'encrypt');

    const plaintext = JSON.stringify(rawVault);
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as any },
      key,
      this.textEncoder.encode(plaintext)
    );

    return {
      auraVaultContainer: true,
      isEncrypted: true,
      schemaVersion: '2.0.0',
      encryptionMetadata: {
        cipher: 'AES-GCM',
        keyLengthBits: 256,
        kdf: 'PBKDF2',
        kdfHash: 'SHA-256',
        iterations: 100000,
        saltHex: this.bufToHex(salt.buffer),
        ivHex: this.bufToHex(iv.buffer),
        exportedAt: new Date().toISOString(),
      },
      payloadCiphertextBase64: this.bufToBase64(ciphertextBuffer),
    };
  }

  /**
   * Decrypt armored JSON container back to AuraMasterVaultJSON
   */
  static async decryptVault(encryptedContainer: AuraEncryptedVaultJSON, password: string): Promise<AuraMasterVaultJSON> {
    const salt = this.hexToBuf(encryptedContainer.encryptionMetadata.saltHex);
    const iv = this.hexToBuf(encryptedContainer.encryptionMetadata.ivHex);
    const key = await this.deriveKey(password, salt, 'decrypt');

    const ciphertext = this.base64ToBuf(encryptedContainer.payloadCiphertextBase64);

    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as any },
        key,
        ciphertext
      );
      const decryptedText = this.textDecoder.decode(decryptedBuffer);
      return JSON.parse(decryptedText) as AuraMasterVaultJSON;
    } catch (err) {
      throw new Error('DECRYPTION_FAILED: Invalid password or corrupted vault container.');
    }
  }

  /**
   * Calculate real SHA-256 checksum for audit logs and verification seals
   */
  static async computeSHA256(data: string): Promise<string> {
    const buffer = await window.crypto.subtle.digest('SHA-256', this.textEncoder.encode(data));
    return this.bufToHex(buffer);
  }
}
