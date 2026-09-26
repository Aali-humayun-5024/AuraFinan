import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n/I18nContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageDropdown: React.FC = () => {
  const { currentLanguage, setLanguage, availableLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = availableLanguages.find((l) => l.code === currentLanguage);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl bg-white/[0.05] dark:bg-white/[0.05] border border-aura-border hover:border-aura-accent/40 text-xs font-semibold text-aura-text transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
        title="Change Platform Language / زبان منتخب کریں"
      >
        <Globe className="text-aura-cyan shrink-0" size={13} />
        <span className="truncate max-w-[60px] xl:max-w-[110px]">{activeLang?.nativeName || 'Language'}</span>
        <ChevronDown size={11} className={`text-aura-text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-2xl p-1.5 z-50
              bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)]
              dark:bg-[#090D1A]/92 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)]
              backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-2.5 py-1 uppercase tracking-wider border-b border-slate-100 dark:border-white/[0.06] mb-1 flex items-center justify-between">
              <span>Select Language</span>
              <span className="font-urdu text-[11px] text-emerald-600 dark:text-emerald-400">زبان</span>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.98] cursor-pointer ${
                    currentLanguage === lang.code
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <span className={lang.dir === 'rtl' ? 'font-urdu' : ''}>{lang.nativeName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                      {lang.code}
                    </span>
                    {currentLanguage === lang.code && <Check className="text-purple-600 dark:text-purple-400" size={13} />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageDropdown;
