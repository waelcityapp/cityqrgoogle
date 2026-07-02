export interface CountryProfile {
  code: string;           // ISO Alpha-2 code e.g. 'EG', 'SA', 'US'
  nameAr: string;         // Arabic name
  nameEn: string;         // English name
  flag: string;           // Flag emoji
  currencyCode: string;   // Currency code e.g. 'EGP', 'SAR', 'USD'
  currencySymbol: string; // Currency symbol e.g. 'ج.م', 'ر.س', '$'
  rateVsUSD: number;      // Approximate exchange rate against 1 USD
  timezones: string[];    // Timezone identifiers e.g. ['Africa/Cairo']
  policeNumber: string;   // Police emergency number
  ambulanceNumber: string;// Ambulance emergency number
  touristTipAr: string;   // Tourist/visitor tip in Arabic
  touristTipEn: string;   // Tourist/visitor tip in English
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
    timezones: ['Asia/Riyadh'],
    policeNumber: '999',
    ambulanceNumber: '997',
    touristTipAr: 'استخدم تطبيق CityQR للوصول السريع لخدمات الحرمين والشؤون الصحية والمرافق العامة في المملكة.',
    touristTipEn: 'Use CityQR to instantly access Holy Sites services, healthcare, and public facilities across Saudi Arabia.'
  },
  {
    code: 'EG',
    nameAr: 'جمهورية مصر العربية',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    currencyCode: 'EGP',
    currencySymbol: 'ج.م',
    rateVsUSD: 48.50,
    timezones: ['Africa/Cairo'],
    policeNumber: '122',
    ambulanceNumber: '123',
    touristTipAr: 'مسح رموز CityQR في الأهرامات والمتاحف المصرية يتيح لك الاستماع للإرشاد الصوتي متعدد اللغات مجاناً.',
    touristTipEn: 'Scanning CityQR tags at pyramids and museums gives you free multilingual audio guidance and site maps.'
  },
  {
    code: 'AE',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    rateVsUSD: 3.67,
    timezones: ['Asia/Dubai', 'Asia/Abu_Dhabi'],
    policeNumber: '999',
    ambulanceNumber: '998',
    touristTipAr: 'جميع محطات مترو دبي والمعالم السياحية مزودة برموز CityQR للوصول السريع لجدول الرحلات والخرائط.',
    touristTipEn: 'All Dubai Metro stations and attractions feature CityQR tags for live transit schedules and smart maps.'
  },
  {
    code: 'KW',
    nameAr: 'دولة الكويت',
    nameEn: 'Kuwait',
    flag: '🇰🇼',
    currencyCode: 'KWD',
    currencySymbol: 'د.ك',
    rateVsUSD: 0.31,
    timezones: ['Asia/Kuwait'],
    policeNumber: '112',
    ambulanceNumber: '112',
    touristTipAr: 'توفر رموز CityQR في أبراج الكويت والمجمعات التجارية خدمة استعراض الفعاليات والخصومات السياحية.',
    touristTipEn: 'CityQR codes in Kuwait Towers and shopping malls offer real-time event guides and tourist discounts.'
  },
  {
    code: 'QA',
    nameAr: 'دولة قطر',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    currencyCode: 'QAR',
    currencySymbol: 'ر.ق',
    rateVsUSD: 3.64,
    timezones: ['Asia/Qatar'],
    policeNumber: '999',
    ambulanceNumber: '999',
    touristTipAr: 'استخدم الرموز الذكية في مترو الدوحة ومشيرب للتعرف على أوقات الفعاليات والمعارض الدولية.',
    touristTipEn: 'Use smart tags across Doha Metro and Msheireb to discover live international events and exhibitions.'
  },
  {
    code: 'BH',
    nameAr: 'مملكة البحرين',
    nameEn: 'Bahrain',
    flag: '🇧🇭',
    currencyCode: 'BHD',
    currencySymbol: 'د.ب',
    rateVsUSD: 0.38,
    timezones: ['Asia/Bahrain'],
    policeNumber: '999',
    ambulanceNumber: '999',
    touristTipAr: 'استكشف باب البحرين والمناطق التاريخية من خلال مسح الرموز للحصول على نبذة تاريخية فورية.',
    touristTipEn: 'Explore Bab Al Bahrain and historical quarters by scanning tags for instant heritage guides.'
  },
  {
    code: 'OM',
    nameAr: 'سلطنة عمان',
    nameEn: 'Oman',
    flag: '🇴🇲',
    currencyCode: 'OMR',
    currencySymbol: 'ر.ع',
    rateVsUSD: 0.38,
    timezones: ['Asia/Muscat'],
    policeNumber: '9999',
    ambulanceNumber: '9999',
    touristTipAr: 'تيح لك رموز CityQR في القلاع والمحميات الطبيعية تنزيل الخرائط للعمل دون اتصال بالإنترنت في الجبال.',
    touristTipEn: 'CityQR tags at forts and nature reserves allow you to download offline maps for mountain adventures.'
  },
  {
    code: 'JO',
    nameAr: 'المملكة الأردنية الهاشمية',
    nameEn: 'Jordan',
    flag: '🇯🇴',
    currencyCode: 'JOD',
    currencySymbol: 'د.أ',
    rateVsUSD: 0.71,
    timezones: ['Asia/Amman'],
    policeNumber: '911',
    ambulanceNumber: '911',
    touristTipAr: 'في البتراء وجرش، استخدم الماسح الضوئي للتعرف على تاريخ الآثار النبطية والرومانية بالتفصيل.',
    touristTipEn: 'In Petra and Jerash, use the scanner to uncover detailed history of Nabataean and Roman ruins.'
  },
  {
    code: 'MA',
    nameAr: 'المملكة المغربية',
    nameEn: 'Morocco',
    flag: '🇲🇦',
    currencyCode: 'MAD',
    currencySymbol: 'د.م.',
    rateVsUSD: 10.00,
    timezones: ['Africa/Casablanca'],
    policeNumber: '19',
    ambulanceNumber: '15',
    touristTipAr: 'تساعدك الرموز المنتشرة في أسواق مراكش وفاس القديمة على معرفة الاتجاهات وتجنب الضياع.',
    touristTipEn: 'Smart tags located across ancient souks in Marrakech and Fez help you navigate and avoid getting lost.'
  },
  {
    code: 'US',
    nameAr: 'الولايات المتحدة الأمريكية',
    nameEn: 'United States',
    flag: '🇺🇸',
    currencyCode: 'USD',
    currencySymbol: '$',
    rateVsUSD: 1.00,
    timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
    policeNumber: '911',
    ambulanceNumber: '911',
    touristTipAr: 'الرموز الذكية متوافقة تماماً مع المعايير الفيدرالية الأمريكية لتوفير معلومات الوصول للمرافق العامة.',
    touristTipEn: 'Smart tags are fully compatible with US ADA accessibility standards for public transit and facilities.'
  },
  {
    code: 'GB',
    nameAr: 'المملكة المتحدة',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    currencyCode: 'GBP',
    currencySymbol: '£',
    rateVsUSD: 0.79,
    timezones: ['Europe/London'],
    policeNumber: '999',
    ambulanceNumber: '999',
    touristTipAr: 'مسح الرموز في محطات قطارات لندن وأكسفورد يمنحك التحديثات الفورية لحركة القطارات.',
    touristTipEn: 'Scanning tags at London and Oxford railway stations gives you live platform updates and departures.'
  },
  {
    code: 'EU',
    nameAr: 'الاتحاد الأوروبي (ألمانيا، فرنسا، إيطاليا...)',
    nameEn: 'European Union (Germany, France, Italy...)',
    flag: '🇪🇺',
    currencyCode: 'EUR',
    currencySymbol: '€',
    rateVsUSD: 0.92,
    timezones: ['Europe/Berlin', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam'],
    policeNumber: '112',
    ambulanceNumber: '112',
    touristTipAr: 'متوافق مع معايير السياحة الذكية للاتحاد الأوروبي ويوفر خيارات ترجمة فورية لـ 24 لغة أوروبية.',
    touristTipEn: 'Compliant with EU Smart Tourism guidelines, offering instant translations across 24 European languages.'
  },
  {
    code: 'TR',
    nameAr: 'الجمهورية التركية',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    currencyCode: 'TRY',
    currencySymbol: '₺',
    rateVsUSD: 33.00,
    timezones: ['Europe/Istanbul'],
    policeNumber: '112',
    ambulanceNumber: '112',
    touristTipAr: 'في إسطنبول وكبادوكيا، تمنحك رموز CityQR أدلة تاريخية للمساجد العثمانية ومواعيد المناطيد.',
    touristTipEn: 'In Istanbul and Cappadocia, CityQR tags offer historical guides for mosques and hot air balloon schedules.'
  },
  {
    code: 'CN',
    nameAr: 'جمهورية الصين الشعبية',
    nameEn: 'China',
    flag: '🇨🇳',
    currencyCode: 'CNY',
    currencySymbol: '¥',
    rateVsUSD: 7.26,
    timezones: ['Asia/Shanghai', 'Asia/Hong_Kong'],
    policeNumber: '110',
    ambulanceNumber: '120',
    touristTipAr: 'تطبيق CityQR يدعم القراءة المباشرة ومتوافق مع رموز الدفع والإرشاد السياحي الصينية.',
    touristTipEn: 'CityQR natively supports high-speed scanning and integrates smoothly with Chinese digital navigation tags.'
  },
  {
    code: 'JP',
    nameAr: 'اليابان',
    nameEn: 'Japan',
    flag: '🇯🇵',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    rateVsUSD: 158.00,
    timezones: ['Asia/Tokyo'],
    policeNumber: '110',
    ambulanceNumber: '119',
    touristTipAr: 'في طوكيو وكيوتو، تساعدك الرموز الذكية على قراءة لوحات محطات الشينكانسن باللغة العربية.',
    touristTipEn: 'In Tokyo and Kyoto, smart tags help you translate Shinkansen train station signs into your native language.'
  }
];

export function detectUserCountry(): CountryProfile {
  try {
    // Try via timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    for (const country of WORLD_COUNTRIES) {
      if (country.timezones.some(t => tz.includes(t) || t.includes(tz))) {
        return country;
      }
    }

    // Try via browser language locale e.g. ar-SA, en-US, ar-EG
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

  // Default fallback to Saudi Arabia / Global Arabic standards
  return WORLD_COUNTRIES[0];
}

export function convertCurrency(amountInUSD: number, targetRateVsUSD: number): string {
  const converted = amountInUSD * targetRateVsUSD;
  if (converted >= 100) return converted.toFixed(0);
  return converted.toFixed(2);
}
