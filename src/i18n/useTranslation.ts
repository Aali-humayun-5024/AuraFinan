// AuraFinance OS — Primary translation hook exposing t() and language switchers
export { useTranslation, useI18n, I18nContext, I18nProvider, LOCALE_REGISTRY } from './I18nContext';
export type { I18nContextType, TranslationFunction } from './I18nContext';
export type { TranslationDictionary } from './locales/en';
import { useTranslation } from './I18nContext';
export default useTranslation;
