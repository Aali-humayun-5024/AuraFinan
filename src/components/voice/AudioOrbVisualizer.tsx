// AuraFinance OS — Dynamic HTML5 Canvas Audio-Frequency Reactive Orb
// Features: Dynamic render suspension on tab blur/idle & low-tier zero-GPU fallback
import React, { useEffect, useRef, useState } from 'react';
import type { VoiceAssistantState } from '../../types/voice';
import { useHardwareProfile } from '../../context/HardwareProfileContext';
import { Mic, Sparkles, AlertCircle } from 'lucide-react';

interface AudioOrbVisualizerProps {
  state?: VoiceAssistantState;
  isListening?: boolean;
  size?: number;
  audioStream?: MediaStream | null;
}

export function AudioOrbVisualizer({
  state = 'active_listening',
  isListening = true,
  size = 220,
  audioStream,
}: AudioOrbVisualizerProps) {
  const { profile, isPageHidden } = useHardwareProfile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // If low tier or 3D orb disabled: Pure CSS / SVG zero-load rendering
  if (!profile.enable3DOrb) {
    const isSpeakingAi = state === 'speaking_response' || state === 'processing_ai';
    const isError = state === 'error_state';

    return (
      <div
        className="relative flex items-center justify-center select-none"
        style={{ width: size, height: size }}
      >
        {/* Static concentric pulse rings driven strictly by CSS hardware transforms */}
        <div
          className={`absolute inset-4 rounded-full border border-dashed transition-all duration-500 ${
            isError
              ? 'border-rose-500/40 animate-spin'
              : isSpeakingAi
              ? 'border-purple-500/40 animate-pulse'
              : 'border-emerald-500/40'
          }`}
          style={{ animationDuration: '6s' }}
        />
        <div
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-transform duration-300 shadow-lg ${
            isError
              ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-500'
              : isSpeakingAi
              ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400 scale-105'
              : 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
          }`}
        >
          {isError ? (
            <AlertCircle size={40} />
          ) : isSpeakingAi ? (
            <Sparkles size={40} className="animate-pulse" />
          ) : (
            <Mic size={40} />
          )}
        </div>
      </div>
    );
  }

  return (
    <ActiveCanvasOrb
      state={state}
      isListening={isListening}
      size={size}
      audioStream={audioStream}
      isPageHidden={isPageHidden}
    />
  );
}

function ActiveCanvasOrb({
  state,
  isListening,
  size,
  audioStream,
  isPageHidden,
}: {
  state: VoiceAssistantState;
  isListening: boolean;
  size: number;
  audioStream?: MediaStream | null;
  isPageHidden: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If page is hidden in background tab, immediately halt canvas rendering
    if (isPageHidden) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let sourceNode: MediaStreamAudioSourceNode | null = null;
    let dataArray: Uint8Array | null = null;

    if (audioStream) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioCtx();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        sourceNode = audioCtx.createMediaStreamSource(audioStream);
        sourceNode.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch (err) {
        console.warn('Orb Web Audio stream error:', err);
      }
    }

    let phase = 0;

    const render = () => {
      // Check document visibility inside frame loop as well
      if (document.hidden) {
        animationFrameRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, size, size);

      let avgFrequency = 0;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray as any);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        avgFrequency = sum / dataArray.length;
      }

      phase += 0.045;

      const isSpeakingAi = state === 'speaking_response' || state === 'processing_ai';
      const isError = state === 'error_state';

      const freqMultiplier = isSpeakingAi ? 1.4 : 1.0;
      const syntheticMod = Math.sin(phase * freqMultiplier) * 10 + Math.cos(phase * 1.6) * 6;
      const audioMod = (avgFrequency / 255) * 40;
      const baseRadius = size / 4 + (isListening ? 12 : 0) + syntheticMod + audioMod;
      const centerX = size / 2;
      const centerY = size / 2;

      // 1. Ambient Background Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.35,
        centerX,
        centerY,
        baseRadius * 1.65
      );

      if (isError) {
        glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.2)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (isSpeakingAi) {
        glowGrad.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
        glowGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.25)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.65, 0, Math.PI * 2);
      ctx.fill();

      // 2. Morphing Core Sphere
      ctx.save();
      ctx.beginPath();
      const points = 24;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave = Math.sin(angle * 5 + phase * 2.5) * (isListening ? 9 : 4);
        const freqOffset = dataArray ? (dataArray[i % dataArray.length] / 255) * 20 : 0;
        const r = baseRadius + wave + freqOffset;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      const coreGrad = ctx.createLinearGradient(
        centerX - baseRadius,
        centerY - baseRadius,
        centerX + baseRadius,
        centerY + baseRadius
      );

      if (isError) {
        coreGrad.addColorStop(0, '#ef4444');
        coreGrad.addColorStop(0.5, '#dc2626');
        coreGrad.addColorStop(1, '#991b1b');
      } else if (isSpeakingAi) {
        coreGrad.addColorStop(0, '#8b5cf6');
        coreGrad.addColorStop(0.5, '#c084fc');
        coreGrad.addColorStop(0.8, '#d946ef');
        coreGrad.addColorStop(1, '#ec4899');
      } else {
        coreGrad.addColorStop(0, '#06b6d4');
        coreGrad.addColorStop(0.4, '#14b8a6');
        coreGrad.addColorStop(0.8, '#10b981');
        coreGrad.addColorStop(1, '#059669');
      }

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = isSpeakingAi
        ? 'rgba(217, 70, 239, 0.7)'
        : isError
        ? 'rgba(239, 68, 68, 0.7)'
        : 'rgba(6, 182, 212, 0.7)';
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.restore();

      // 3. Inner Specular Highlight
      ctx.beginPath();
      ctx.ellipse(
        centerX - baseRadius * 0.32,
        centerY - baseRadius * 0.36,
        baseRadius * 0.36,
        baseRadius * 0.18,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (sourceNode) sourceNode.disconnect();
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  }, [state, isListening, size, audioStream, isPageHidden]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="max-w-full drop-shadow-2xl"
    />
  );
}

export default AudioOrbVisualizer;
