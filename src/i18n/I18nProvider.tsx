// AuraFinance OS — I18nProvider Re-Export for backward compatibility
export { I18nProvider, useI18n, useTranslation, I18nContext, LOCALE_REGISTRY } from './I18nContext';
export type { I18nContextType, TranslationFunction } from './I18nContext';
export type { TranslationDictionary } from './locales/en';
import { I18nProvider } from './I18nContext';
export default I18nProvider;
