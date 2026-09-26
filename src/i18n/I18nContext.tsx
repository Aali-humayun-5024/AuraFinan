import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { en, type TranslationDictionary } from './locales/en';
import { ur } from './locales/ur';
import { ur_roman } from './locales/ur_roman';
import { ar } from './locales/ar';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { ja } from './locales/ja';
import { zh } from './locales/zh';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { CULTURAL_LOCALES, UI_TRANSLATIONS, type CulturalLocale } from './locales';
import { COUNTRIES_REGISTRY, getCountryInfo, type CountryInfo } from './countries';

export const LOCALE_REGISTRY: Record<string, TranslationDictionary> = {
  en,
  ur,
  ur_roman,
  ar,
  es,
  fr,
  de,
  ja,
  zh,
};

export type TranslationFunction = TranslationDictionary & {
  (key: string, fallback?: string): string;
};

export interface I18nContextType {
  currentLanguage: string;
  setLanguage: (langCode: string) => void;
  t: TranslationFunction;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  availableLanguages: Array<{ code: string; name: string; nativeName: string; dir: 'ltr' | 'rtl' }>;
  
  // Backward compatibility fields for cultural bazaar and multi-country engine
  locale: CulturalLocale;
  country: CountryInfo;
  bazaarTerms: CulturalLocale['bazaarTerms'];
  culturalTheme: CulturalLocale['culturalTheme'];
  setCountry: (countryCode: string) => void;
  supportedLocales: CulturalLocale[];
  allCountries: CountryInfo[];
}

export const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setBaseCurrency, setUserCity, setUserLocation } = useAppStore();

  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('aura_language') || localStorage.getItem('aura_lang');
      if (cached && LOCALE_REGISTRY[cached]) return cached;
    }
    return 'en';
  });

  const [activeCountryCode, setActiveCountryState] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('aura_country') : null) || 'PK';
  });

  // Attempt to restore selectedLanguage from IndexedDB settings table on boot
  useEffect(() => {
    db.settings
      .toCollection()
      .first()
      .then((settings) => {
        if (settings && (settings as any).selectedLanguage) {
          const dbLang = (settings as any).selectedLanguage;
          if (LOCALE_REGISTRY[dbLang] && dbLang !== currentLanguage) {
            setCurrentLanguage(dbLang);
          }
        }
      })
      .catch(() => {
        // Fallback to localStorage
      });
  }, []);

  const activeDictionary = LOCALE_REGISTRY[currentLanguage] || en;
  const direction: 'ltr' | 'rtl' = activeDictionary.metadata.direction;

  // Cultural locale fallback for bazaar terms
  const culturalLocale: CulturalLocale = useMemo(() => {
    if (CULTURAL_LOCALES[currentLanguage]) {
      return CULTURAL_LOCALES[currentLanguage];
    }
    if (currentLanguage === 'ur_roman') {
      return CULTURAL_LOCALES['hi'] || CULTURAL_LOCALES['ur'] || CULTURAL_LOCALES['en'];
    }
    return CULTURAL_LOCALES['en'];
  }, [currentLanguage]);

  const country: CountryInfo = useMemo(() => {
    return getCountryInfo(activeCountryCode);
  }, [activeCountryCode]);

  // Synchronize DOM direction, language attribute and font family
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // 1. Mutate HTML root attributes dynamically
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = direction;
      document.documentElement.setAttribute('data-direction', direction);

      // 2. Adjust body font-family for specialized scripts (Urdu Nastaliq / Arabic / Japanese / Chinese)
      if (activeDictionary.metadata.fontFamily && activeDictionary.metadata.fontFamily !== 'inherit') {
        document.body.style.fontFamily = activeDictionary.metadata.fontFamily;
      } else {
        document.body.style.fontFamily = '';
      }

      // 3. Cultural theme classes
      document.body.classList.remove(
        'theme-south-asia',
        'theme-middle-east',
        'theme-east-asia',
        'theme-americas-europe',
        'theme-latam'
      );
      if (culturalLocale.culturalTheme?.filigreeClass) {
        document.body.classList.add(culturalLocale.culturalTheme.filigreeClass);
      }

      // 4. Cache selection locally
      localStorage.setItem('aura_language', currentLanguage);
      localStorage.setItem('aura_lang', currentLanguage);
    }
  }, [currentLanguage, direction, activeDictionary, culturalLocale]);

  const setLanguage = useCallback((code: string) => {
    if (LOCALE_REGISTRY[code]) {
      setCurrentLanguage(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aura_language', code);
        localStorage.setItem('aura_lang', code);
      }

      // Storage Resilience: Persist into Dexie.js (IndexedDB) under the settings table
      db.settings
        .toCollection()
        .first()
        .then((existing) => {
          if (existing && existing.id) {
            return db.settings.update(existing.id, { selectedLanguage: code } as any);
          } else {
            return db.settings.put({
              baseCurrency: 'USD',
              monthlyIncomeTarget: 5000,
              isEncrypted: false,
              activePersona: 'household',
              aiPersona: 'mentor',
              selectedLanguage: code,
            } as any);
          }
        })
        .catch(() => {});
    }
  }, []);

  const setCountry = useCallback(
    (countryCode: string) => {
      const c = getCountryInfo(countryCode);
      setActiveCountryState(c.code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aura_country', c.code);
      }

      setBaseCurrency(c.defaultCurrency);
      if (c.majorCities && c.majorCities.length > 0) {
        setUserCity(c.majorCities[0]);
        setUserLocation({
          city: c.majorCities[0],
          country: c.name,
          ip: '127.0.0.1',
          isAutoDetected: false,
        });
      }

      // Auto-adapt default language if matching registered locale
      if (c.defaultLanguage && LOCALE_REGISTRY[c.defaultLanguage]) {
        setLanguage(c.defaultLanguage);
      }
    },
    [setBaseCurrency, setUserCity, setUserLocation, setLanguage]
  );

  // Hybrid `t`: Callable as t('key', 'fallback') AND property access as t.generalLedger.journalTitle
  const t: TranslationFunction = useMemo(() => {
    const fn = (key: string, fallback?: string): string => {
      const entry = UI_TRANSLATIONS[key];
      if (entry && entry[currentLanguage]) {
        return entry[currentLanguage];
      }
      if (entry && entry['en']) {
        return entry['en'];
      }
      return fallback || key;
    };

    return Object.assign(fn, activeDictionary);
  }, [activeDictionary, currentLanguage]);

  const availableLanguages = useMemo(() => {
    return Object.values(LOCALE_REGISTRY).map((dict) => ({
      code: dict.metadata.code,
      name: dict.metadata.name,
      nativeName: dict.metadata.nativeName,
      dir: dict.metadata.direction,
    }));
  }, []);

  const value: I18nContextType = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      t,
      dir: direction,
      isRTL: direction === 'rtl',
      availableLanguages,
      locale: culturalLocale,
      country,
      bazaarTerms: culturalLocale.bazaarTerms,
      culturalTheme: culturalLocale.culturalTheme,
      setCountry,
      supportedLocales: Object.values(CULTURAL_LOCALES),
      allCountries: COUNTRIES_REGISTRY,
    }),
    [
      currentLanguage,
      setLanguage,
      t,
      direction,
      availableLanguages,
      culturalLocale,
      country,
      setCountry,
    ]
  );

  return (
    <I18nContext.Provider value={value}>
      <div dir={direction} className={direction === 'rtl' ? 'rtl-mirrored font-nastaliq' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within an I18nProvider');
  return context;
};

export const useI18n = useTranslation;
export default useTranslation;
