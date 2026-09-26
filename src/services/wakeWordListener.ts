// AuraFinance OS — Continuous Background Wake-Word Engine & Lifecycle Supervisor
import { soundEffects, playWakeChime } from './soundEffects';

export type WakeWordCallback = (triggeredHotword: string) => void;

export class WakeWordListener {
  private recognition: any = null;
  private isListening = false;
  private shouldKeepListening = false;
  private onTriggerCallback: WakeWordCallback | null = null;
  private onTranscriptCallback: ((text: string) => void) | null = null;
  private restartTimeout: any = null;
  private hotwords = ['hey aura', 'suno aura', 'ya aura', 'hey ora', 'ay aura', 'aura assistant', 'hey aurora'];

  constructor(onTrigger?: WakeWordCallback, onTranscript?: (text: string) => void) {
    if (onTrigger) {
      this.init(onTrigger, onTranscript);
    }
  }

  init(onTrigger: WakeWordCallback, onTranscript?: (text: string) => void) {
    this.onTriggerCallback = onTrigger;
    this.onTranscriptCallback = onTranscript || null;

    if (typeof window === 'undefined') return false;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim().toLowerCase();
          
          if (this.onTranscriptCallback) {
            this.onTranscriptCallback(transcript);
          }

          const matched = this.hotwords.some((hw) => transcript.includes(hw));
          if (matched) {
            // Hotword triggered! Stop listening, play activation chime, and trigger HUD
            soundEffects.playWakeChime();
            this.stopTemporary();
            if (this.onTriggerCallback) {
              this.onTriggerCallback(transcript);
            }
            break;
          }
        }
      };

      let backoffDelay = 500;

      this.recognition.onerror = (event: any) => {
        if (event.error === 'network' || event.error === 'not-allowed') {
          // Gracefully backoff on network dropouts or permission pauses
          backoffDelay = Math.min(backoffDelay * 2, 8000);
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('WakeWordListener recognition error:', event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.shouldKeepListening) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldKeepListening) {
              this.start();
              backoffDelay = 1000;
            }
          }, backoffDelay);
        }
      };

      return true;
    } catch (e) {
      console.warn('WakeWordListener init error:', e);
      return false;
    }
  }

  start() {
    if (!this.recognition) {
      if (this.onTriggerCallback) {
        this.init(this.onTriggerCallback, this.onTranscriptCallback || undefined);
      } else {
        return;
      }
    }

    if (!this.isListening && this.recognition) {
      try {
        this.shouldKeepListening = true;
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        // Recognition already running or interrupted
      }
    }
  }

  /**
   * Temporary stop when active HUD opens to prevent microphone conflict
   */
  stopTemporary() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  /**
   * Full stop of background supervisor
   */
  stop() {
    this.shouldKeepListening = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const wakeWordEngine = new WakeWordListener();
// Backward compatibility alias
export const WakeWordListenerController = WakeWordListener;
export { playWakeChime };
