// AuraFinance OS — The Wealth Prism (Hardware-Adaptive 3D WebGL Canvas)
// Features dynamic render loop suspension (tab-hidden / offscreen) & zero-GPU fallback for low-spec hardware

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { useHardwareProfile } from '../../context/HardwareProfileContext';
import { Sparkles, ShieldCheck, AlertTriangle, TrendingUp, Gem } from 'lucide-react';
import RollingNumber from '../common/RollingNumber';

interface WealthPrismCanvasProps {
  score?: number; // 0 - 1000
  size?: number;
}

export default function WealthPrismCanvas({ score = 825, size = 160 }: WealthPrismCanvasProps) {
  const { theme } = useAppStore();
  const { profile, isPageHidden } = useHardwareProfile();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });
  const [hovered, setHovered] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);

  // IntersectionObserver to suspend WebGL rendering when scrolled out of viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Determine color palette based on health score (0 - 1000)
  const colorPalette = (() => {
    if (score >= 876) {
      return {
        primary: 0xf59e0b, // Amber / Gold
        secondary: 0x10b981, // Emerald
        glow: 'rgba(245, 158, 11, 0.45)',
        tier: 'Financial Sovereign',
        icon: Sparkles,
        badgeColor: 'text-amber-500 dark:text-amber-300 bg-amber-500/20 border-amber-400/40',
        hexPrimary: '#f59e0b',
      };
    } else if (score >= 701) {
      return {
        primary: 0x10b981, // Emerald
        secondary: 0x06b6d4, // Cyan
        glow: 'rgba(16, 185, 129, 0.4)',
        tier: 'Wealth Builder',
        icon: ShieldCheck,
        badgeColor: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        hexPrimary: '#10b981',
      };
    } else if (score >= 451) {
      return {
        primary: 0x06b6d4, // Cyan
        secondary: 0x8b5cf6, // Violet
        glow: 'rgba(6, 182, 212, 0.4)',
        tier: 'Balanced',
        icon: TrendingUp,
        badgeColor: 'text-cyan-500 dark:text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
        hexPrimary: '#06b6d4',
      };
    } else {
      return {
        primary: 0xef4444, // Crimson
        secondary: 0xec4899, // Pink
        glow: 'rgba(239, 68, 68, 0.4)',
        tier: 'Vulnerable',
        icon: AlertTriangle,
        badgeColor: 'text-rose-500 dark:text-rose-400 bg-rose-500/15 border-rose-500/30',
        hexPrimary: '#ef4444',
      };
    }
  })();

  // WebGL 3D Canvas initialization for mid & high hardware tiers
  useEffect(() => {
    // If 3D orb is disabled on low-tier hardware, bypass WebGL entirely
    if (!profile.enable3DOrb) return;

    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: profile.tier === 'high',
      powerPreference: 'low-power',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.tier === 'high' ? 2 : 1));
    container.appendChild(renderer.domElement);

    const prismGroup = new THREE.Group();
    scene.add(prismGroup);

    // 1. Faceted Icosahedron (Glass Prism)
    const icosahedronGeo = new THREE.IcosahedronGeometry(1.35, 0);
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: colorPalette.primary,
      emissive: colorPalette.secondary,
      emissiveIntensity: 0.35,
      metalness: 0.2,
      roughness: 0.2,
    });
    const prismMesh = new THREE.Mesh(icosahedronGeo, glassMaterial);
    prismGroup.add(prismMesh);

    // 2. Wireframe Cage
    const wireframeGeo = new THREE.WireframeGeometry(icosahedronGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: colorPalette.secondary,
      transparent: true,
      opacity: 0.6,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    prismGroup.add(wireframeMesh);

    // 3. Inner Energy Core (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(0.55, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    prismGroup.add(coreMesh);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(colorPalette.primary, 2.5, 30);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    // Animation loop with active suspension checks
    let animationFrameId: number | null = null;
    const startTime = performance.now();

    const animate = () => {
      // Dynamic Render Suspension: Pause loop if tab is hidden or element is offscreen
      if (document.hidden || !isIntersecting) {
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Slow rotation
      prismGroup.rotation.y = elapsedTime * 0.45 + mouseRef.current.x * 0.8;
      prismGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15 + mouseRef.current.y * 0.8;

      coreMesh.rotation.y = -elapsedTime * 0.9;
      coreMesh.rotation.z = elapsedTime * 0.6;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      renderer.render(scene, camera);
    };

    // Start loop if visible
    if (!isPageHidden && isIntersecting) {
      animate();
    }

    // Mouse tilt listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      icosahedronGeo.dispose();
      glassMaterial.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, [score, size, colorPalette, profile.enable3DOrb, profile.tier, isPageHidden, isIntersecting]);

  const Icon = colorPalette.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-4 group cursor-pointer"
    >
      {/* 3D Canvas / 2D Low-Hardware Fallback */}
      <div className="relative shrink-0 flex items-center justify-center">
        {profile.enableBlurFilters && (
          <div
            className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none"
            style={{
              background: colorPalette.glow,
              opacity: hovered ? 0.9 : 0.45,
            }}
          />
        )}

        {profile.enable3DOrb ? (
          <div ref={containerRef} style={{ width: size, height: size }} className="relative z-10" />
        ) : (
          /* Low-Tier Solid SVG/CSS Prism: 0% GPU, zero WebGL context overhead */
          <div
            ref={containerRef}
            style={{ width: size, height: size }}
            className="relative z-10 flex items-center justify-center"
          >
            <div className="relative w-28 h-28 rounded-2xl flex items-center justify-center border-2 border-dashed transition-transform duration-300 group-hover:scale-105"
                 style={{ borderColor: colorPalette.hexPrimary }}>
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${colorPalette.hexPrimary}18` }}
              >
                <Gem size={44} style={{ color: colorPalette.hexPrimary }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Badge */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${colorPalette.badgeColor}`}>
            <Icon size={13} />
            <RollingNumber value={score} suffix=" / 1000" />
          </span>
          <span className="text-[11px] text-aura-text-muted">Health Index</span>
        </div>
        <p className="text-sm font-bold text-aura-text">{colorPalette.tier}</p>
        <p className="text-xs text-aura-text-secondary">
          Refracting live cashflow resilience & emergency buffer
        </p>
      </div>
    </div>
  );
}
