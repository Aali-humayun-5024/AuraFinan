// AuraFinance OS — Web Worker Crypto Client Dispatcher
// Manages worker pool lifecycle and offloads heavy AES-GCM / PBKDF2 cryptography

let workerInstance: Worker | null = null;
let messageIdCounter = 0;
const pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined') return null;

  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('../workers/crypto.worker.ts', import.meta.url), {
        type: 'module',
      });

      workerInstance.onmessage = (event) => {
        const { id, success, result, error } = event.data;
        const handler = pendingRequests.get(id);
        if (handler) {
          pendingRequests.delete(id);
          if (success) {
            handler.resolve(result);
          } else {
            handler.reject(new Error(error));
          }
        }
      };

      workerInstance.onerror = (err) => {
        console.warn('[CryptoWorker] Worker runtime error:', err);
      };
    } catch (e) {
      console.warn('[CryptoWorker] Web Worker could not be instantiated; falling back to main thread.', e);
      return null;
    }
  }

  return workerInstance;
}

export function runInCryptoWorker<T = any>(type: string, payload: any): Promise<T> {
  const worker = getWorker();
  if (!worker) {
    return Promise.reject(new Error('NO_WORKER'));
  }

  return new Promise((resolve, reject) => {
    const id = ++messageIdCounter;
    pendingRequests.set(id, { resolve, reject });
    worker.postMessage({ id, type, payload });
  });
}
