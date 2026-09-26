// AuraFinance OS — Multi-Accent Web Speech TTS Narrator
// Wraps native window.speechSynthesis with voice selection and lifecycle supervision

export class SpeechSynthesizerService {
  private preferredVoices = [
    'Google US English',
    'Samantha',
    'Karen',
    'Victoria',
    'Microsoft Zira',
    'Moira',
    'en-US',
  ];

  /**
   * Speak response with professional crisp rate and language matching
   */
  speak(text: string, onEnd?: () => void, lang?: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances

      const cleanText = text.replace(/[*_#`[\]]/g, '').trim();
      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const targetLang = lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('aura_language') : null) || 'en';
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        // 1. Try to find native voice matching target language code
        let selectedVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(targetLang.toLowerCase().slice(0, 2))
        );

        // Urdu fallbacks
        if (!selectedVoice && (targetLang === 'ur' || targetLang === 'ur_roman')) {
          selectedVoice = voices.find(
            (v) => v.lang.toLowerCase().includes('ur') || v.lang.toLowerCase().includes('hi')
          );
        }

        // Arabic fallbacks
        if (!selectedVoice && targetLang === 'ar') {
          selectedVoice = voices.find((v) => v.lang.toLowerCase().includes('ar'));
        }

        // Default English preference
        if (!selectedVoice) {
          selectedVoice = voices.find((v) =>
            this.preferredVoices.some((pref) => v.name.toLowerCase().includes(pref.toLowerCase()))
          );
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        } else {
          utterance.lang = targetLang;
        }
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Unable to synthesize speech:', e);
      if (onEnd) onEnd();
    }
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSynthesizer = new SpeechSynthesizerService();
export default speechSynthesizer;
