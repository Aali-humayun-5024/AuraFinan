// AuraFinance OS — Zustand Global Store
import { create } from 'zustand';
import type { CustomPersonaProfile } from '../db/database';
import { getActiveGeminiKey } from '../services/geminiKeyConfig';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR' | 'INR' | 'AED' | 'CAD' | 'JPY';

interface FXRates {
  [key: string]: number;
}

interface AppState {
  // UI State
  sidebarOpen: boolean;
  activeView: string;
  commandPaletteOpen: boolean;
  personaStudioOpen: boolean;
  voiceAssistantOpen: boolean;
  copilotDrawerOpen: boolean;
  siteMapModalOpen: boolean;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  ecoVoiceMode: boolean;
  
  // Currency
  baseCurrency: CurrencyCode;
  fxRates: FXRates;
  fxLastUpdated: string | null;
  
  // AI
  geminiApiKey: string;
  aiPersona: 'mentor' | 'roast';
  aiLoading: boolean;
  
  // Persona
  activePersona: 'student' | 'freelancer' | 'household' | 'clean' | 'custom' | string;
  customPersona: CustomPersonaProfile | null;
  
  // Location & Daily Bazaar
  userCity: string;
  userCountry: string;
  userIP: string;
  isLocationDetected: boolean;
  
  // Multi-User & Family Mode
  activeProfileId: string; // 'all' | 'household' | 'personal' | 'business' | custom id
  familySize: number;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setPersonaStudioOpen: (open: boolean) => void;
  setVoiceAssistantOpen: (open: boolean) => void;
  setCopilotDrawerOpen: (open: boolean) => void;
  setSiteMapModalOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  setEcoVoiceMode: (enabled: boolean) => void;
  setBaseCurrency: (currency: CurrencyCode) => void;
  setFxRates: (rates: FXRates, timestamp: string) => void;
  setGeminiApiKey: (key: string) => void;
  setAiPersona: (persona: 'mentor' | 'roast') => void;
  setAiLoading: (loading: boolean) => void;
  setActivePersona: (persona: 'student' | 'freelancer' | 'household' | 'clean' | 'custom' | string) => void;
  setCustomPersona: (persona: CustomPersonaProfile | null) => void;
  setUserCity: (city: string) => void;
  setUserLocation: (loc: { city: string; country: string; ip: string; isAutoDetected: boolean }) => void;
  setActiveProfileId: (id: string) => void;
  setFamilySize: (size: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  activeView: 'dashboard',
  commandPaletteOpen: false,
  personaStudioOpen: false,
  voiceAssistantOpen: false,
  copilotDrawerOpen: false,
  siteMapModalOpen: false,
  theme: 'light', // Opal Ceramic Default Aesthetic
  soundEnabled: true,
  ecoVoiceMode: typeof window !== 'undefined' && localStorage.getItem('aura_eco_voice') !== null
    ? localStorage.getItem('aura_eco_voice') === 'true'
    : false,
  baseCurrency: 'PKR',
  fxRates: {},
  fxLastUpdated: null,
  geminiApiKey: getActiveGeminiKey(),
  aiPersona: 'mentor',
  aiLoading: false,
  activePersona: 'household',
  customPersona: null,
  userCity: 'Karachi',
  userCountry: 'Pakistan',
  userIP: '119.160.119.50',
  isLocationDetected: false,
  activeProfileId: 'all',
  familySize: 4,
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setPersonaStudioOpen: (open) => set({ personaStudioOpen: open }),
  setVoiceAssistantOpen: (open) => set({ voiceAssistantOpen: open }),
  setCopilotDrawerOpen: (open) => set({ copilotDrawerOpen: open }),
  setSiteMapModalOpen: (open) => set({ siteMapModalOpen: open }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    })),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setEcoVoiceMode: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_eco_voice', String(enabled));
    }
    set({ ecoVoiceMode: enabled });
  },
  setBaseCurrency: (currency) => set({ baseCurrency: currency }),
  setFxRates: (rates, timestamp) => set({ fxRates: rates, fxLastUpdated: timestamp }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setAiPersona: (persona) => set({ aiPersona: persona }),
  setAiLoading: (loading) => set({ aiLoading: loading }),
  setActivePersona: (persona) => set({ activePersona: persona }),
  setCustomPersona: (persona) => set({ customPersona: persona }),
  setUserCity: (city) => set({ userCity: city }),
  setUserLocation: (loc) =>
    set({
      userCity: loc.city,
      userCountry: loc.country,
      userIP: loc.ip,
      isLocationDetected: loc.isAutoDetected,
    }),
  setActiveProfileId: (id) => set({ activeProfileId: id }),
  setFamilySize: (size) => set({ familySize: size }),
}));
