import { GoogleGenAI } from '@google/genai';

// Safely retrieve Gemini API Key from Vite env or runtime injected secrets
const getGeminiApiKey = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const vKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.GEMINI_API_KEY;
    if (vKey && vKey !== 'MY_GEMINI_API_KEY') return vKey;
  }
  if (typeof process !== 'undefined' && process.env) {
    const pKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (pKey && pKey !== 'MY_GEMINI_API_KEY') return pKey;
  }
  return '';
};

export const isGeminiConfigured = (): boolean => {
  const key = getGeminiApiKey();
  return !!(key && key.trim().length > 0);
};

let genAIInstance: GoogleGenAI | null = null;

export const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
};

/**
 * CityQR AI Studio Service - Generates smart offer descriptions and business insights using Gemini 2.5 Flash
 */
export async function generateCityQROffersAI(
  businessName: string,
  category: string,
  targetAudienceLanguage: 'ar' | 'en' = 'ar'
): Promise<{ titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string }> {
  const aiClient = getGeminiClient();
  if (!aiClient) {
    return {
      titleAr: `عرض حصري من ${businessName}`,
      titleEn: `Exclusive Offer from ${businessName}`,
      descriptionAr: `استمتع بأقوى الخصومات والمزايا عند المسح عبر تطبيق CityQR في ${businessName}.`,
      descriptionEn: `Enjoy top discounts and exclusive perks when scanning via CityQR app at ${businessName}.`
    };
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert marketing strategist for CityQR app. Generate a high-converting promotional QR campaign for a business named "${businessName}" in the "${category}" category. Return JSON only with keys: titleAr, titleEn, descriptionAr, descriptionEn.`
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      titleAr: parsed.titleAr || `عرض مميز - ${businessName}`,
      titleEn: parsed.titleEn || `Special Offer - ${businessName}`,
      descriptionAr: parsed.descriptionAr || `احصل على خصم حصري ومكافآت عند زيارة ${businessName} مسح رمز QR!`,
      descriptionEn: parsed.descriptionEn || `Get exclusive discounts and rewards when visiting ${businessName} and scanning QR!`
    };
  } catch (err) {
    console.warn('Gemini API call failed, using CityQR smart defaults:', err);
    return {
      titleAr: `عرض حصري من ${businessName}`,
      titleEn: `Exclusive Offer from ${businessName}`,
      descriptionAr: `استمتع بأقوى الخصومات والمزايا عند المسح عبر تطبيق CityQR في ${businessName}.`,
      descriptionEn: `Enjoy top discounts and exclusive perks when scanning via CityQR app at ${businessName}.`
    };
  }
}
