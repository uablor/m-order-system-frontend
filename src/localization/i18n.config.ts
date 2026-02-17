import { createI18n } from 'vue-i18n';
import messages from './index';

const savedLocale = localStorage.getItem('app-locale') || 'la';

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'la',
  messages: {
    en: messages.en,
    la: messages.la,
    th: messages.th,
  },
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: true
      }
    },
    la: {
      currency: {
        style: 'currency',
        currency: 'LAK',
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: true
      }
    },
    th: {
      currency: {
        style: 'currency',
        currency: 'THB',
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: true
      }
    },
  }
});
