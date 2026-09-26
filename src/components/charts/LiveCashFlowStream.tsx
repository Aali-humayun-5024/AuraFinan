// AuraFinance OS — Live Cash-Flow Particle Stream (Sankey-Canvas Dual Hybrid)
// Features: Real IndexedDB ledger binding, proportional particle velocity, 60 FPS Canvas & tab-idle suspension

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useRealStreamData } from '../../hooks/useRealStreamData';
import { StreamNode, StreamChannel, FlowParticle } from '../../types/cashFlowStream';
import { useHardwareProfile } from '../../context/HardwareProfileContext';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, getCurrencySymbol } from '../../services/fxService';
import { playClickSound } from '../../services/soundService';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Sparkles, Layers, Info, ArrowRight } from 'lucide-react';

export const LiveCashFlowStream: React.FC = () => {
  const { nodes, channels, totalInflow } = useRealStreamData();
  const { profile, isPageHidden } = useHardwareProfile();
  const { baseCurrency, theme } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<StreamNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<StreamNode | null>(null);

  // Cubic Bezier evaluation function for coordinate at progress t (0.0 to 1.0)
  const getBezierPoint = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    t: number
  ) => {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const xt = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
    const yt = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

    return { x: xt, y: yt };
  };

  useEffect(() => {
    // Dynamic Render Suspension: Stop canvas simulation if tab is hidden
    if (isPageHidden) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || channels.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    const particles: FlowParticle[] = [];

    // Scale particle count & speed by hardware tier and real dollar flow volume
    const tierMultiplier = profile.tier === 'low' ? 0.4 : profile.tier === 'mid' ? 0.75 : 1.0;
    const isLowTier = profile.tier === 'low';

    channels.forEach((channel) => {
      const volumeRatio = channel.amount / (totalInflow || 1);
      const rawCount = Math.round(volumeRatio * 32 * tierMultiplier);
      const particleCount = Math.max(isLowTier ? 2 : 3, Math.min(isLowTier ? 8 : 22, rawCount));

      // Velocity rule: Vi = clamp(0.002 + (Amount/Total) * 0.008, 0.003, 0.015)
      const calculatedSpeed = Math.max(0.003, Math.min(0.015, 0.0025 + volumeRatio * 0.009));
      const particleSize = isLowTier
        ? 2.5
        : Math.max(2.2, Math.min(5.0, 2.0 + volumeRatio * 4.5));

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          channelId: channel.id,
          progress: Math.random(),
          speed: calculatedSpeed * (0.85 + Math.random() * 0.3),
          size: particleSize,
          color: channel.color,
          alpha: 0.55 + Math.random() * 0.45,
        });
      }
    });

    // Retina DPR Display Scaling
    const updateSize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, profile.tier === 'high' ? 2 : 1.5);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before re-scaling
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Animation Loop
    const render = () => {
      if (document.hidden) {
        animationFrameId = null;
        return;
      }

      const width = container.clientWidth;
      const height = container.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // Render & Advance Quantum Light Particles
      particles.forEach((p) => {
        const channel = channels.find((c) => c.id === p.channelId);
        if (!channel) return;
        const sourceNode = nodes.find((n) => n.id === channel.sourceId);
        const targetNode = nodes.find((n) => n.id === channel.targetId);
        if (!sourceNode || !targetNode) return;

        // Pixel coordinates of bezier anchor and control handles
        const p0 = { x: (sourceNode.x / 100) * width, y: (sourceNode.y / 100) * height };
        const p3 = { x: (targetNode.x / 100) * width, y: (targetNode.y / 100) * height };
        const dx = Math.abs(p3.x - p0.x) * 0.55;
        const p1 = { x: p0.x + dx, y: p0.y };
        const p2 = { x: p3.x - dx, y: p3.y };

        // Advance particle progress along path
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
        }

        const pos = getBezierPoint(p0, p1, p2, p3, p.progress);

        // Draw particle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;

        if (!isLowTier) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // Immediate reset to prevent GPU cache thrashing
        } else {
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [channels, nodes, totalInflow, isPageHidden, profile.tier]);

  const activeInspectNode = hoveredNode || selectedNode;

  return (
    <div
      ref={containerRef}
      className={`glass-card relative w-full h-[460px] overflow-hidden p-5 sm:p-6 select-none flex flex-col justify-between ${
        theme === 'dark' ? 'bg-slate-950/70 border-white/10' : 'bg-white/90 border-slate-200 shadow-xl'
      }`}
    >
      {/* ─── Header & Throughput Metrics ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-20 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity size={17} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-aura-text">
                Live Cash-Flow Particle Stream
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                Real Ledger
              </span>
            </div>
            <p className="text-[11px] text-aura-text-muted mt-0.5">
              Proportional velocity flow mapping Tier 1 Inflows → Clearing Hub → 50/30/20 Allocation Pots
            </p>
          </div>
        </div>

        {/* Global Cleared Volume Counter */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-aura-text-muted tracking-wider block">
              Total Cleared Volume
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {formatCurrency(totalInflow, baseCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── SVG Static Structural Tracks (Mathematical Bezier Thickness) ─── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          {channels.map((c) => (
            <linearGradient key={`grad_${c.id}`} id={`grad_${c.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={c.color} stopOpacity={0.12} />
            </linearGradient>
          ))}
        </defs>

        {channels.map((channel) => {
          const s = nodes.find((n) => n.id === channel.sourceId);
          const t = nodes.find((n) => n.id === channel.targetId);
          if (!s || !t) return null;

          // Bezier Path Thickness rule: Wi = clamp((Node Value / Total Volume) * 24px, 2px, 28px)
          const strokeWidth = Math.max(
            2.5,
            Math.min(26, Math.round((channel.amount / (totalInflow || 1)) * 26))
          );

          const isChannelActive =
            activeInspectNode &&
            (activeInspectNode.id === channel.sourceId || activeInspectNode.id === channel.targetId);

          return (
            <path
              key={channel.id}
              d={`M ${s.x}% ${s.y}% C ${s.x + 22}% ${s.y}%, ${t.x - 22}% ${t.y}%, ${t.x}% ${t.y}%`}
              fill="none"
              stroke={`url(#grad_${channel.id})`}
              strokeWidth={strokeWidth}
              strokeOpacity={isChannelActive ? 0.75 : 0.28}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* ─── HTML5 High-Performance Canvas Particle Overlay ─── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* ─── Interactive Tactical Node HUDs ─── */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode?.id === node.id;
          const isClearing = node.type === 'clearing';

          return (
            <div
              key={node.id}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => {
                playClickSound();
                setSelectedNode(isSelected ? null : node);
              }}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
            >
              <div className="flex flex-col items-center">
                {/* Node Target Core Ring */}
                <div
                  style={{
                    borderColor: node.color,
                    backgroundColor: `${node.color}25`,
                    boxShadow: isHovered || isSelected ? `0 0 16px ${node.color}` : undefined,
                  }}
                  className={`rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isClearing
                      ? 'w-7 h-7 scale-110'
                      : 'w-5 h-5 group-hover:scale-125'
                  }`}
                >
                  <div
                    style={{ backgroundColor: node.color }}
                    className={`rounded-full transition-transform ${
                      isClearing ? 'w-2.5 h-2.5 animate-pulse' : 'w-1.5 h-1.5'
                    }`}
                  />
                </div>

                {/* Node Label & Real Dynamic Balance Badge */}
                <div
                  className={`mt-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 text-center shadow-lg ${
                    isClearing
                      ? 'bg-sky-500/20 border-sky-400 text-white shadow-sky-500/20'
                      : isHovered || isSelected
                      ? 'bg-slate-900 border-aura-accent text-white scale-105'
                      : theme === 'dark'
                      ? 'bg-slate-950/85 border-white/10 text-slate-100'
                      : 'bg-white/95 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-[10px] font-semibold text-aura-text-muted whitespace-nowrap">
                    {node.label}
                  </p>
                  <p className="text-xs font-black font-mono tabular-nums text-aura-text">
                    {formatCurrency(node.amount, (node.currency as any) || baseCurrency)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Floating Detailed Node Inspection HUD ─── */}
      <AnimatePresence>
        {activeInspectNode && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-4 left-6 z-30 px-4 py-2.5 rounded-2xl border text-xs shadow-2xl backdrop-blur-xl flex items-center gap-3 ${
              theme === 'dark'
                ? 'bg-slate-950/95 border-cyan-500/40 text-slate-100'
                : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/50'
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeInspectNode.color }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-aura-text">{activeInspectNode.label}</span>
                <span className="text-aura-text-muted">•</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(activeInspectNode.amount, (activeInspectNode.currency as any) || baseCurrency)}
                </span>
              </div>
              <span className="text-[10px] text-aura-text-muted block mt-0.5">
                {((activeInspectNode.amount / (totalInflow || 1)) * 100).toFixed(1)}% of total cash-flow throughput
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Footer Legend ─── */}
      <div className="flex items-center justify-between text-[11px] text-aura-text-muted z-20 relative pt-2 border-t border-aura-border/40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Real Inflows
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Clearing Hub
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Needs (50%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Wants (30%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Savings (20%)
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px]">
          Hover or tap any node to inspect channel %
        </span>
      </div>
    </div>
  );
};

export default LiveCashFlowStream;
