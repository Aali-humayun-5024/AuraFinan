// AuraFinance OS — Master JSON Contracts & Encrypted Container Types
// Strictly JSON-only container format with Web Crypto AES-GCM (256-bit) and PBKDF2

export interface AuraMasterVaultJSON {
  metadata: {
    schemaVersion: '2.0.0';
    appVersion: 'AuraOS-2026.09';
    exportedAt: string;          // ISO 8601
    platformCurrency: string;
    activeLanguage: string;
    activePersona: string;
    recordChecksumSHA256: string;
  };
  accounts: any[];
  journalEntries: any[];
  cashFlowRecords: any[];
  ious: any[];
  goals: any[];
  subscriptions: any[];
  commodities: any[];
  customPersonas: any[];
  settings: Record<string, any>;
  transactions?: any[];
}

export interface AuraEncryptedVaultJSON {
  auraVaultContainer: true;
  isEncrypted: true;
  schemaVersion: '2.0.0';
  encryptionMetadata: {
    cipher: 'AES-GCM';
    keyLengthBits: 256;
    kdf: 'PBKDF2';
    kdfHash: 'SHA-256';
    iterations: 100000;
    saltHex: string;             // 16-byte salt as hex
    ivHex: string;               // 12-byte IV as hex
    exportedAt: string;
  };
  payloadCiphertextBase64: string; // AES-GCM encrypted string of AuraMasterVaultJSON
}

export type AnyVaultPayload = AuraMasterVaultJSON | AuraEncryptedVaultJSON;
