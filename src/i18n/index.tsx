import { initReactI18next } from 'react-i18next';
import i18next, { type LanguageDetectorAsyncModule, type Resource } from 'i18next';

import vi from './locales/vi.json';
import en from './locales/en.json';

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: (cb) => cb('vi'),
  init: () => {},
  cacheUserLanguage: () => {},
};

const resources: Resource = {
  vi: { translation: vi },
  en: { translation: en },
};

i18next.use(languageDetector).use(initReactI18next).init({
  fallbackLng: 'vi',
  debug: false,
  resources: resources,
  compatibilityJSON: 'v4',
});

const I18nApp = i18next;

export default I18nApp;
