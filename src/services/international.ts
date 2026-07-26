export interface CountryProfile {
  code: string;           // ISO Alpha-2 code e.g. 'EG', 'SA', 'US'
  nameAr: string;         // Arabic name
  nameEn: string;         // English name
  flag: string;           // Flag emoji
  currencyCode: string;   // Currency code e.g. 'EGP', 'SAR', 'USD'
  currencySymbol: string; // Currency symbol e.g. 'ج.م', 'ر.س', '$'
  rateVsUSD: number;      // Approximate exchange rate against 1 USD
  timezones: string[];    // Timezone identifiers e.g. ['Africa/Cairo']
}

export const WORLD_COUNTRIES: CountryProfile[] = [
  {
    code: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    currencyCode: 'SAR',
    currencySymbol: 'ر.س',
    rateVsUSD: 3.75,
    timezones: ['Asia/Riyadh']
  },
  {
    code: 'EG',
    nameAr: 'جمهورية مصر العربية',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    currencyCode: 'EGP',
    currencySymbol: 'ج.م',
    rateVsUSD: 48.50,
    timezones: ['Africa/Cairo']
  },
  {
    code: 'AE',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    rateVsUSD: 3.67,
    timezones: ['Asia/Dubai', 'Asia/Abu_Dhabi']
  },
  {
    code: 'KW',
    nameAr: 'دولة الكويت',
    nameEn: 'Kuwait',
    flag: '🇰🇼',
    currencyCode: 'KWD',
    currencySymbol: 'د.ك',
    rateVsUSD: 0.31,
    timezones: ['Asia/Kuwait']
  },
  {
    code: 'QA',
    nameAr: 'دولة قطر',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    currencyCode: 'QAR',
    currencySymbol: 'ر.ق',
    rateVsUSD: 3.64,
    timezones: ['Asia/Qatar']
  },
  {
    code: 'BH',
    nameAr: 'مملكة البحرين',
    nameEn: 'Bahrain',
    flag: '🇧🇭',
    currencyCode: 'BHD',
    currencySymbol: 'د.ب',
    rateVsUSD: 0.38,
    timezones: ['Asia/Bahrain']
  },
  {
    code: 'OM',
    nameAr: 'سلطنة عمان',
    nameEn: 'Oman',
    flag: '🇴🇲',
    currencyCode: 'OMR',
    currencySymbol: 'ر.ع',
    rateVsUSD: 0.38,
    timezones: ['Asia/Muscat']
  },
  {
    code: 'JO',
    nameAr: 'المملكة الأردنية الهاشمية',
    nameEn: 'Jordan',
    flag: '🇯🇴',
    currencyCode: 'JOD',
    currencySymbol: 'د.أ',
    rateVsUSD: 0.71,
    timezones: ['Asia/Amman']
  },
  {
    code: 'MA',
    nameAr: 'المملكة المغربية',
    nameEn: 'Morocco',
    flag: '🇲🇦',
    currencyCode: 'MAD',
    currencySymbol: 'د.م.',
    rateVsUSD: 10.00,
    timezones: ['Africa/Casablanca']
  },
  {
    code: 'US',
    nameAr: 'الولايات المتحدة الأمريكية',
    nameEn: 'United States',
    flag: '🇺🇸',
    currencyCode: 'USD',
    currencySymbol: '$',
    rateVsUSD: 1.00,
    timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']
  },
  {
    code: 'GB',
    nameAr: 'المملكة المتحدة',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    currencyCode: 'GBP',
    currencySymbol: '£',
    rateVsUSD: 0.79,
    timezones: ['Europe/London']
  },
  {
    code: 'EU',
    nameAr: 'الاتحاد الأوروبي',
    nameEn: 'European Union',
    flag: '🇪🇺',
    currencyCode: 'EUR',
    currencySymbol: '€',
    rateVsUSD: 0.92,
    timezones: ['Europe/Berlin', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam']
  },
  {
    code: 'TR',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    currencyCode: 'TRY',
    currencySymbol: '₺',
    rateVsUSD: 33.00,
    timezones: ['Europe/Istanbul']
  },
  {
    code: 'CN',
    nameAr: 'الصين',
    nameEn: 'China',
    flag: '🇨🇳',
    currencyCode: 'CNY',
    currencySymbol: '¥',
    rateVsUSD: 7.26,
    timezones: ['Asia/Shanghai', 'Asia/Hong_Kong']
  },
  {
    code: 'JP',
    nameAr: 'اليابان',
    nameEn: 'Japan',
    flag: '🇯🇵',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    rateVsUSD: 158.00,
    timezones: ['Asia/Tokyo']
  }
];

export function detectUserCountry(): CountryProfile {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    for (const country of WORLD_COUNTRIES) {
      if (country.timezones.some(t => tz.includes(t) || t.includes(tz))) {
        return country;
      }
    }

    const locale = navigator.language || '';
    const parts = locale.split('-');
    if (parts.length > 1) {
      const code = parts[1].toUpperCase();
      const matched = WORLD_COUNTRIES.find(c => c.code === code);
      if (matched) return matched;
    }
  } catch (err) {
    console.warn('Could not auto-detect timezone/locale:', err);
  }

  return WORLD_COUNTRIES[0];
}

export function convertCurrency(amountInUSD: number, targetRateVsUSD: number): string {
  const converted = amountInUSD * targetRateVsUSD;
  if (converted >= 100) return converted.toFixed(0);
  return converted.toFixed(2);
}
