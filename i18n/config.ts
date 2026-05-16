export const locales = ['es', 'ca', 'en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  ca: 'Català',
  en: 'English',
  fr: 'Français',
};
