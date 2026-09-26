// AuraFinance OS — 3D Floating Tactile Coin & Milestones
// Features render suspension on tab blur/idle and pure CSS low-tier fallback
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { playCoinSound } from '../../services/soundService';
import { useHardwareProfile } from '../../context/HardwareProfileContext';
import { Coins } from 'lucide-react';

interface FloatingCoin3DProps {
  label?: string;
  size?: number;
  rewardValue?: string;
  onCollect?: () => void;
}

export default function FloatingCoin3D({
  label = 'Bachat Milestone',
  size = 64,
  rewardValue = '+₨ 500',
  onCollect,
}: FloatingCoin3DProps) {
  const { profile, isPageHidden } = useHardwareProfile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [spinBoost, setSpinBoost] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // If low hardware tier, avoid Three.js initialization entirely
    if (!profile.enable3DOrb) return;

    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: profile.tier === 'high',
      powerPreference: 'low-power',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.tier === 'high' ? 2 : 1));
    container.appendChild(renderer.domElement);

    // Coin Mesh (Cylinder)
    const coinGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.18, 24);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0xd97706,
      emissiveIntensity: 0.2,
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    scene.add(coin);

    // Rim ring
    const rimGeo = new THREE.TorusGeometry(1.0, 0.08, 12, 32);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    scene.add(rim);

    // Light
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(2, 3, 4);
    scene.add(dirLight);

    let animationFrameId: number | null = null;
    let speed = 0.025;

    const animate = () => {
      // Dynamic render suspension: suspend when tab is hidden or offscreen
      if (document.hidden || !isIntersecting) {
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
      coin.rotation.z += speed;
      rim.rotation.z += speed;

      if (speed > 0.025) {
        speed *= 0.96;
      }

      renderer.render(scene, camera);
    };

    if (!isPageHidden && isIntersecting) {
      animate();
    }

    const handleMouseEnter = () => {
      speed = 0.09;
    };

    container.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coinGeo.dispose();
      coinMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
    };
  }, [size, profile.enable3DOrb, profile.tier, isPageHidden, isIntersecting]);

  const handleClick = (e: React.MouseEvent) => {
    playCoinSound();
    setSpinBoost(true);
    setTimeout(() => setSpinBoost(false), 1200);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: profile.tier === 'low' ? 12 : 36,
      spread: 50,
      origin: { x, y },
      colors: ['#f59e0b', '#fbbf24', '#22c55e', '#7c5cfc'],
    });

    if (onCollect) onCollect();
  };

  return (
    <div
      onClick={handleClick}
      title="Click to celebrate savings milestone!"
      className="flex items-center gap-2 p-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer group"
    >
      {profile.enable3DOrb ? (
        <div
          ref={containerRef}
          style={{ width: size, height: size }}
          className={`shrink-0 transition-transform ${spinBoost ? 'scale-125' : 'group-hover:scale-110'}`}
        />
      ) : (
        /* Low-Hardware 2D SVG Coin: 0% GPU load */
        <div
          style={{ width: size, height: size }}
          className={`shrink-0 flex items-center justify-center rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 transition-transform ${
            spinBoost ? 'scale-125 rotate-180 duration-500' : 'group-hover:scale-110'
          }`}
        >
          <Coins size={size * 0.55} />
        </div>
      )}

      <div className="text-left pr-2">
        <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
          {label}
        </p>
        <p className="text-xs font-black text-aura-text">{rewardValue}</p>
      </div>
    </div>
  );
}
