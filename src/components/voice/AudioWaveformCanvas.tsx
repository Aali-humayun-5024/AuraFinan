// AuraFinance OS — Live Audio Waveform Canvas Visualizer
import { useEffect, useRef } from 'react';

interface AudioWaveformCanvasProps {
  isListening: boolean;
  width?: number;
  height?: number;
}

export default function AudioWaveformCanvas({
  isListening,
  width = 300,
  height = 64,
}: AudioWaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Create glowing gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#7c5cfc');
      gradient.addColorStop(0.5, '#06b6d4');
      gradient.addColorStop(1, '#10b981');

      const centerY = height / 2;
      const barCount = 36;
      const barWidth = 4;
      const spacing = (width - barCount * barWidth) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + spacing);
        let barHeight = 4; // Resting height

        if (isListening) {
          // Dynamic wave math
          const wave1 = Math.sin(phase + i * 0.28) * 0.5 + 0.5;
          const wave2 = Math.cos(phase * 1.4 + i * 0.45) * 0.5 + 0.5;
          const amplitude = (wave1 * 0.6 + wave2 * 0.4) * (height * 0.75);
          barHeight = Math.max(6, amplitude);
        }

        const y = centerY - barHeight / 2;

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded pill bars
        const radius = barWidth / 2;
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      phase += isListening ? 0.08 : 0.02;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening, width, height]);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-xl filter drop-shadow-[0_0_12px_rgba(124,92,252,0.35)]"
      />
    </div>
  );
}
