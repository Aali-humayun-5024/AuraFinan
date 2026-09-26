// AuraFinance OS — Hardware Adaptive Capability Sensor & Profiling Engine
// Detects CPU concurrency, memory constraints, and graphics capabilities for ultra-low spec targeting

export interface DevicePerformanceProfile {
  tier: 'low' | 'mid' | 'high';
  enable3DOrb: boolean;
  enableDynamicGradients: boolean;
  enableBlurFilters: boolean;
  maxChartPoints: number;
  ecoVoiceMode: boolean;
}

export function detectDeviceTier(): DevicePerformanceProfile {
  if (typeof window === 'undefined') {
    return {
      tier: 'high',
      enable3DOrb: true,
      enableDynamicGradients: true,
      enableBlurFilters: true,
      maxChartPoints: 90,
      ecoVoiceMode: false,
    };
  }

  // Check manual user tier override in localStorage
  const manualOverride = localStorage.getItem('aura_hardware_tier') as 'low' | 'mid' | 'high' | null;
  if (manualOverride === 'low') {
    return {
      tier: 'low',
      enable3DOrb: false,
      enableDynamicGradients: false,
      enableBlurFilters: false,
      maxChartPoints: 12,
      ecoVoiceMode: true,
    };
  }
  if (manualOverride === 'mid') {
    return {
      tier: 'mid',
      enable3DOrb: true,
      enableDynamicGradients: true,
      enableBlurFilters: false,
      maxChartPoints: 30,
      ecoVoiceMode: false,
    };
  }
  if (manualOverride === 'high') {
    return {
      tier: 'high',
      enable3DOrb: true,
      enableDynamicGradients: true,
      enableBlurFilters: true,
      maxChartPoints: 90,
      ecoVoiceMode: false,
    };
  }

  // Check memory footprint via navigator (Chromium/Android)
  const deviceMemory = (navigator as any).deviceMemory || 4; // Defaults to 4GB if unsupported
  const logicalProcessors = navigator.hardwareConcurrency || 2;
  
  // Network connection inspection (e.g. Save-Data flag or 2G/3G low-bandwidth)
  const conn = (navigator as any).connection;
  const isDataSaver = conn?.saveData === true;
  const isSlowConnection = conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';

  // Mobile and Android Go inspection
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|ipod/.test(ua);
  const isAndroidGo = ua.includes('android') && (deviceMemory <= 2 || logicalProcessors <= 2);

  const isLowEndBaseline =
    deviceMemory <= 2 ||
    logicalProcessors <= 2 ||
    isAndroidGo ||
    (isMobile && deviceMemory <= 3) ||
    isDataSaver ||
    isSlowConnection;

  if (isLowEndBaseline) {
    return {
      tier: 'low',
      enable3DOrb: false,               // Replaces WebGL canvas with a lightweight CSS indicator
      enableDynamicGradients: false,    // Replaces multi-stop CSS radial gradients with flat hex tokens
      enableBlurFilters: false,         // Completely strips backdrop-blur-* (prevents mobile GPU thermal throttling)
      maxChartPoints: 12,               // Downsamples historical series points
      ecoVoiceMode: true,               // Tap-to-talk instead of persistent background recognition
    };
  }

  if (deviceMemory <= 4 || logicalProcessors <= 4) {
    return {
      tier: 'mid',
      enable3DOrb: true,
      enableDynamicGradients: true,
      enableBlurFilters: false,         // Disable backdrop-filter on mid-tier integrated GPUs
      maxChartPoints: 30,
      ecoVoiceMode: false,
    };
  }

  return {
    tier: 'high',
    enable3DOrb: true,
    enableDynamicGradients: true,
    enableBlurFilters: true,
    maxChartPoints: 90,
    ecoVoiceMode: false,
  };
}
