// AuraFinance OS — Manual Microphone Fallback Trigger Button
import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { useAppStore } from '../../store/useAppStore';

interface VoiceTriggerButtonProps {
  className?: string;
  compact?: boolean;
}

export const VoiceTriggerButton: React.FC<VoiceTriggerButtonProps> = ({
  className = '',
  compact = false,
}) => {
  const { setVoiceAssistantOpen } = useAppStore();

  const handleTrigger = () => {
    soundEffects.playWakeChime();
    setVoiceAssistantOpen(true);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleTrigger}
      title="Hey Aura Voice Assistant (or say 'Hey Aura')"
      aria-label="Activate Hey Aura Voice Assistant"
      className={`relative rounded-xl border transition-all cursor-pointer shadow-sm group flex items-center gap-1.5 shrink-0 ${
        compact ? 'p-1.5' : 'px-2 xl:px-3 py-1.5'
      } bg-gradient-to-r from-violet-600/20 to-indigo-600/20 hover:from-violet-600/30 hover:to-indigo-600/30 border-violet-500/30 text-violet-400 hover:text-violet-300 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
      </span>
      <Mic size={compact ? 17 : 15} className="group-hover:scale-110 transition-transform" />
      {!compact && (
        <span className="text-xs font-bold hidden xl:inline tracking-tight">Hey Aura</span>
      )}
    </motion.button>
  );
};

export default VoiceTriggerButton;
