// AuraFinance OS — Procedural Web Audio API Chime Synthesizer
// Pure procedural synthesis without external .mp3/.wav dependencies
// Shares the single lazy singleton AudioContext with auto-suspend lifecycle

import { getSharedAudioContext } from './soundService';

export class SoundEffectsService {
  private getContext(): AudioContext | null {
    return getSharedAudioContext();
  }

  /**
   * Activation Chime: Double-tone sweep
   * Sine wave ramping rapidly from 440 Hz (A4) to 880 Hz (A5) over 120 ms.
   * Smooth gain envelope: Attack at 0.01s, exponential decay over 250 ms.
   */
  playWakeChime(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Web Audio playWakeChime failed:', e);
    }
  }

  /**
   * Success / Posted Chime:
   * Soft major-third harmonic chord: 523.25 Hz (C5) and 659.25 Hz (E5) fading over 350 ms.
   */
  playSuccessChime(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [523.25, 659.25].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.38);
      });
    } catch (e) {
      console.warn('Web Audio playSuccessChime failed:', e);
    }
  }

  /**
   * Error Chime:
   * Low warning tone at 220 Hz decaying rapidly.
   */
  playErrorChime(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      console.warn('Web Audio playErrorChime failed:', e);
    }
  }
}

export const soundEffects = new SoundEffectsService();
export const playWakeChime = () => soundEffects.playWakeChime();
export const playSuccessChime = () => soundEffects.playSuccessChime();
export const playErrorChime = () => soundEffects.playErrorChime();
