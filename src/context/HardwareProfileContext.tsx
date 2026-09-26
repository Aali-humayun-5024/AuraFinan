// AuraFinance OS — Global Hardware Adaptive Profile Context
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { detectDeviceTier, type DevicePerformanceProfile } from '../utils/hardwareSensor';

interface HardwareProfileContextValue {
  profile: DevicePerformanceProfile;
  setTierOverride: (tier: 'low' | 'mid' | 'high' | 'auto') => void;
  currentTierSetting: 'low' | 'mid' | 'high' | 'auto';
  isPageHidden: boolean;
}

const HardwareProfileContext = createContext<HardwareProfileContextValue | null>(null);

export const HardwareProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tierSetting, setTierSetting] = useState<'low' | 'mid' | 'high' | 'auto'>(() => {
    return (localStorage.getItem('aura_hardware_tier') as any) || 'auto';
  });

  const [profile, setProfile] = useState<DevicePerformanceProfile>(() => detectDeviceTier());
  const [isPageHidden, setIsPageHidden] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? document.hidden : false;
  });

  // Apply root CSS classes for zero-load styling pruning
  const applyRootClasses = useCallback((currentProfile: DevicePerformanceProfile) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.classList.remove('hardware-low', 'hardware-mid', 'hardware-high');
    root.classList.add(`hardware-${currentProfile.tier}`);
  }, []);

  // Update profile when setting changes or on resize/concurrency changes
  useEffect(() => {
    const updated = detectDeviceTier();
    setProfile(updated);
    applyRootClasses(updated);
  }, [tierSetting, applyRootClasses]);

  // Handle document visibility (tab switching / minimizing)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsPageHidden(hidden);

      if (hidden) {
        document.documentElement.classList.add('page-idle');
      } else {
        document.documentElement.classList.remove('page-idle');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const setTierOverride = useCallback((tier: 'low' | 'mid' | 'high' | 'auto') => {
    if (tier === 'auto') {
      localStorage.removeItem('aura_hardware_tier');
    } else {
      localStorage.setItem('aura_hardware_tier', tier);
    }
    setTierSetting(tier);
    const updated = detectDeviceTier();
    setProfile(updated);
    applyRootClasses(updated);
  }, [applyRootClasses]);

  return (
    <HardwareProfileContext.Provider
      value={{
        profile,
        setTierOverride,
        currentTierSetting: tierSetting,
        isPageHidden,
      }}
    >
      {children}
    </HardwareProfileContext.Provider>
  );
};

export function useHardwareProfile(): HardwareProfileContextValue {
  const context = useContext(HardwareProfileContext);
  if (!context) {
    const fallbackProfile = detectDeviceTier();
    return {
      profile: fallbackProfile,
      setTierOverride: () => {},
      currentTierSetting: 'auto',
      isPageHidden: false,
    };
  }
  return context;
}
