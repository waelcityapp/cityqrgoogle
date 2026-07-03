import { QRCodeItem, LandmarkCategory } from '../types';

/**
 * Normalizes Arabic and English text for robust fuzzy searching.
 * Removes diacritics (tashkeel), unifies Arabic letter variants (أ,إ,آ -> ا; ة -> ه; ى -> ي),
 * and converts to lower case.
 */
export function normalizeSearchText(text?: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove Arabic tashkeel (diacritics)
    .trim();
}

/**
 * Returns comprehensive Arabic and English search keywords, synonyms, and labels
 * associated with each landmark/offer category.
 */
export function getCategorySearchKeywords(category?: string): string {
  switch (category) {
    case 'monument':
      return 'مطعم مطاعم مقهى مقهي مقاهي كافيه كافية كوفي قهوة قهوه وجبة وجبه وجبات طعام اكل أكل مشروبات شاي حلا حلى فطور غدا غداء عشا عشاء حجز طاولة طاوله منسف برياني برغر بيتزا شاورما عروض مطاعم كافيهات مطعم/مقهى مطعم ومقهى restaurant cafe coffee dining food menu table drink meal breakfast lunch dinner pizza burger cafe';
    case 'culture':
      return 'سياحة سياحه سياحي معالم معلم ترفيه رحلات تراث اثار آثار حديقة حديقه تذاكر فندق فنادق استجمام متنزه متاحف متحف سفاري جولة جوله فعاليات موسمي سياحة/معالم سياحة ومعالم tourism tourist landmark heritage trip travel park hotel museum tour entertainment event';
    case 'facility':
      return 'خدمات خدمة خدمه مرفق مرافق عامة عامه مختبر مختبرات تحاليل فحص صيانة صيانه تشغيل استشارات حكومي حكومية تجاري اعمال تجارة ورشة ورشه صالون حلاقة حلاقه تجميل مغسلة مغسله تنظيف خدمة/مرفق خدمات ومرافق service services facility facilities general lab diagnostics test maintenance consulting clean shop beauty';
    case 'transport':
      return 'لياقة لياقه بدنية بدنيه جيم مسبح ساونا كمال اجسام أجسام مواصلات نقل سيارات تدريب رياضة رياضه اشتراك كوتش باص قطار محطة محطه تاكسي سيارة أجرة اجره تأجير لياقة/مواصلات لياقة ومواصلات gym fitness workout sports swimming pool transport transfer taxi car train bus coach rent';
    case 'emergency':
      return 'عيادة عياده عيادات مركز طبي طوارئ مستشفى مستشفي علاج اسنان أسنان جلدية جلديه صحة صحه دكتور طبيب صيدلية صيدليه اسعاف دواء رعاية رعايه عيادة/طوارئ عيادات وطوارئ clinic medical hospital emergency health doctor dental care pharmacy ambulance medicine';
    default:
      return 'عام كل العروض منصة cityqr';
  }
}

/**
 * Common stop words in Arabic and English to ignore during multi-word token searches
 */
const STOP_WORDS = new Set([
  'و', 'في', 'من', 'عن', 'على', 'إلى', 'الى', 'أو', 'او', 'مع', 'بين', 'إن', 'ان', 'هل', 'كل', 'معظم',
  'in', 'on', 'at', 'to', 'or', 'and', 'of', 'for', 'by', 'with', 'the', 'a', 'an', 'is', 'are'
]);

/**
 * Smart fuzzy matching between a QR offer item and a search query string.
 * Checks titles, descriptions, addresses, category labels, category keywords, and general offer terms.
 */
export function smartMatchQRItem(qr: QRCodeItem | any, query: string): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  // General offer keywords: since every item on CityQR is an active offer/deal,
  // searching for general offer words matches active items.
  const generalOfferTerms = ['عرض', 'عروض', 'خصم', 'خصومات', 'تخفيض', 'تخفيضات', 'توفير', 'باقة', 'باقات', 'deal', 'offer', 'offers', 'discount', 'discounts', 'sale', 'sales', 'cityqr', 'سيتي', 'كيوار'];
  if (generalOfferTerms.some(term => normalizedQuery === term || normalizedQuery.includes(term))) {
    return true;
  }

  // Combine all searchable fields of the QR item + category keywords + category labels
  const itemTextParts = [
    qr.titleAr,
    qr.titleEn,
    qr.descriptionAr,
    qr.descriptionEn,
    qr.location?.addressAr,
    qr.location?.addressEn,
    qr.addressAr,
    qr.addressEn,
    qr.descAr,
    qr.descEn,
    getCategorySearchKeywords(qr.category)
  ];

  const fullItemText = normalizeSearchText(itemTextParts.filter(Boolean).join(' '));

  // Split query into tokens and filter out stop words if there are multiple words
  let tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const filteredTokens = tokens.filter(t => !STOP_WORDS.has(t));
    if (filteredTokens.length > 0) {
      tokens = filteredTokens;
    }
  }

  // Check if every meaningful token in the user's search query exists in the item's normalized text
  return tokens.every(token => fullItemText.includes(token));
}
