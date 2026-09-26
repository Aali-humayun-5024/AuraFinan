// AuraFinance OS — Dedicated Web Worker for AES-GCM Vault Encryption & CPU-Intensive Tasks
// Keeps the main browser UI thread strictly locked at 60 FPS during multi-megabyte vault exports.

self.onmessage = async (event: MessageEvent) => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case 'ENCRYPT_VAULT': {
        const { jsonString, password } = payload;
        const result = await executeEncryption(jsonString, password);
        self.postMessage({ id, success: true, result });
        break;
      }

      case 'DECRYPT_VAULT': {
        const { bundle, password } = payload;
        const result = await executeDecryption(bundle, password);
        self.postMessage({ id, success: true, result });
        break;
      }

      case 'COMPUTE_SHA256': {
        const { text } = payload;
        const hash = await executeSha256(text);
        self.postMessage({ id, success: true, result: hash });
        break;
      }

      default:
        self.postMessage({ id, success: false, error: `Unknown worker operation: ${type}` });
    }
  } catch (err: any) {
    self.postMessage({ id, success: false, error: err?.message || 'Worker computation error' });
  }
};

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
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

async function executeEncryption(jsonString: string, password?: string) {
  const exportDate = new Date().toISOString();
  const version = '2.0.0';

  if (!password || password.trim().length === 0) {
    return {
      isEncrypted: false,
      version,
      exportDate,
      plainData: JSON.parse(jsonString),
    };
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const plainBytes = enc.encode(jsonString);

  const encryptedBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plainBytes
  );

  return {
    isEncrypted: true,
    algorithm: 'AES-GCM-256',
    salt: Array.from(salt),
    iv: Array.from(iv),
    encryptedData: Array.from(new Uint8Array(encryptedBuf)),
    version,
    exportDate,
  };
}

async function executeDecryption(bundle: any, password?: string): Promise<any> {
  if (!bundle.isEncrypted) {
    return bundle.plainData;
  }

  if (!password) {
    throw new Error('PASSWORD_REQUIRED: Password is required to decrypt this vault.');
  }

  const salt = new Uint8Array(bundle.salt);
  const iv = new Uint8Array(bundle.iv);
  const encryptedBytes = new Uint8Array(bundle.encryptedData);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedBytes
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuf);
    return JSON.parse(jsonString);
  } catch {
    throw new Error('INVALID_PASSWORD: Decryption failed. Incorrect password.');
  }
}

async function executeSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
