// AuraFinance OS — Resilient Client-Side Gemini Key Resolver
// Prioritizes build-time environment variable and falls back to user-configured or session key
// 100% client-side, zero-knowledge privacy architecture

export function getActiveGeminiKey(): string {
  // 1. Check Vite environment variable (.env / .env.local)
  try {
    const envKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
    if (
      envKey &&
      typeof envKey === 'string' &&
      envKey.trim().length > 0 &&
      !envKey.includes('your_gemini_api_key')
    ) {
      return envKey.trim();
    }
  } catch {
    // ignore
  }

  // 2. Check localStorage configured key from settings
  try {
    const localKey =
      localStorage.getItem('aura_gemini_api_key') ||
      localStorage.getItem('gemini_api_key');
    if (localKey && typeof localKey === 'string' && localKey.trim().length > 0) {
      return localKey.trim();
    }
  } catch {
    // ignore
  }

  return '';
}

export function hasActiveGeminiKey(): boolean {
  return getActiveGeminiKey().length > 0;
}
