// AuraFinance OS — Haptic & Audio Synthesizer (Web Audio API)
// Volume strictly capped at 5% with instantaneous global mute support
// Implements strict OS audio device polling pruning via lazy singleton & auto-suspend

import { useAppStore } from '../store/useAppStore';

let sharedAudioCtx: AudioContext | null = null;
let autoSuspendTimer: ReturnType<typeof setTimeout> | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioCtx = new AudioCtxClass();
    }
  }

  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }

  // Clear pending suspension timer and re-arm for 400ms after synthesis completes
  if (autoSuspendTimer) {
    clearTimeout(autoSuspendTimer);
  }
  autoSuspendTimer = setTimeout(() => {
    if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
      sharedAudioCtx.suspend().catch(() => {});
    }
  }, 450);

  return sharedAudioCtx;
}

export function playClickSound() {
  if (!useAppStore.getState().soundEnabled) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.025);

    // Max 4% volume
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch {
    // Graceful fallback
  }
}

export function playCoinSound() {
  if (!useAppStore.getState().soundEnabled) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    [1046.5, 1318.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.035;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.08);

      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.13);
    });
  } catch {
    // Graceful fallback
  }
}

export function playSuccessSound() {
  if (!useAppStore.getState().soundEnabled) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.045, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.24);
    });
  } catch {
    // Graceful fallback
  }
}

export function playToggleSound() {
  if (!useAppStore.getState().soundEnabled) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.03);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Graceful fallback
  }
}
