import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { translations } from '../services/translations';
import { QRCodeFormSchema, QRCodeFormValues, LandmarkCategory } from '../types';
import { 
  Sparkles, 
  MapPin, 
  Link2, 
  FileText, 
  Compass, 
  Download, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRGeneratorProps {
  onNavigate?: (tabId: string) => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ onNavigate }) => {
  const { language, addQRCode } = useApp();
  const t = translations[language];

  // Form State
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'monument' as LandmarkCategory,
    targetUrl: '',
    addressAr: '',
    addressEn: '',
    lat: '',
    lng: ''
  });

  // Errors & Success States
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [success, setSuccess] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<{
    title: string;
    qrUrl: string;
    targetUrl: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name as keyof typeof formData];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert lat/lng strings to numbers if present
    const parsedData = {
      ...formData,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
    };

    // Zod validation
    const result = QRCodeFormSchema.safeParse(parsedData);
    if (!result.success) {
      const formattedErrors: Partial<Record<keyof typeof formData, string>> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof typeof formData;
        formattedErrors[path] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      // Build location object if present
      const location = (formData.addressAr || formData.addressEn || formData.lat || formData.lng) ? {
        addressAr: formData.addressAr || '',
        addressEn: formData.addressEn || '',
        lat: parsedData.lat || 0,
        lng: parsedData.lng || 0
      } : undefined;

      const newQRUrl = `https://cityqr.local/scan/${Date.now()}`;

      const qrItem = {
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        category: formData.category,
        qrUrl: newQRUrl,
        targetUrl: formData.targetUrl,
        location,
        totalScans: 0,
        isActive: true
      };

      await addQRCode(qrItem);

      // Save generated info for preview
      setGeneratedQR({
        title: language === 'ar' ? formData.titleAr : formData.titleEn,
        qrUrl: newQRUrl,
        targetUrl: formData.targetUrl
      });

      setSuccess(true);
      // Reset form
      setFormData({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        category: 'monument',
        targetUrl: '',
        addressAr: '',
        addressEn: '',
        lat: '',
        lng: ''
      });
      setErrors({});

      setTimeout(() => setSuccess(false), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  // Build real API QR code image URL
  const qrImageSrc = generatedQR 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=d4af37&bgcolor=000000&data=${encodeURIComponent(generatedQR.targetUrl)}`
    : '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Form Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 relative overflow-hidden">
          {/* Top colored line indicator */}
          <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
          
          <div className="flex items-center justify-between mb-2 mt-2 gap-2">
            <h2 className="text-xl font-black tracking-tighter text-[#D4AF37] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8B0000]" />
              {t.addQRTitle}
            </h2>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-[#D4AF37] border border-zinc-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>{language === 'ar' ? '← العودة للوحة التحكم' : '← Back to Dashboard'}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500 mb-6 font-medium">
            {language === 'ar' 
              ? 'الرجاء إدخال البيانات باللغتين العربية والإنجليزية لضمان عرضها بشكل صحيح لجميع مواطني وزوار المدينة.'
              : 'Please enter details in both Arabic and English to ensure proper display for all citizens and visitors.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs md:text-sm">
            {/* Title Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-semibold">{t.qrTitleAr}</label>
                <input
                  type="text"
                  name="titleAr"
                  value={formData.titleAr}
                  onChange={handleInputChange}
                  placeholder="مثال: قصر المصمك التاريخي"
                  className={`w-full rounded-lg border bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37] ${
                    errors.titleAr ? 'border-red-500' : 'border-zinc-800'
                  }`}
                />
                {errors.titleAr && (
                  <span className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.titleAr}
                  </span>
                )}
              </div>

              <div className="space-y-1.5" dir="ltr">
                <label className="block text-zinc-400 font-semibold text-right">{t.qrTitleEn}</label>
                <input
                  type="text"
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleInputChange}
                  placeholder="e.g. Masmak Historical Palace"
                  className={`w-full rounded-lg border bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37] ${
                    errors.titleEn ? 'border-red-500' : 'border-zinc-800'
                  }`}
                />
                {errors.titleEn && (
                  <span className="text-[10px] text-red-500 flex items-center gap-1 justify-end">
                    {errors.titleEn} <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-semibold">{t.qrDescAr}</label>
                <textarea
                  name="descriptionAr"
                  rows={3}
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  placeholder="وصف مختصر ومفيد عن تاريخ وأهمية المعلم الأثري..."
                  className={`w-full rounded-lg border bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37] ${
                    errors.descriptionAr ? 'border-red-500' : 'border-zinc-800'
                  }`}
                />
                {errors.descriptionAr && (
                  <span className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.descriptionAr}
                  </span>
                )}
              </div>

              <div className="space-y-1.5" dir="ltr">
                <label className="block text-zinc-400 font-semibold text-right">{t.qrDescEn}</label>
                <textarea
                  name="descriptionEn"
                  rows={3}
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  placeholder="A short and helpful guide about the landmark's historical value..."
                  className={`w-full rounded-lg border bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37] ${
                    errors.descriptionEn ? 'border-red-500' : 'border-zinc-800'
                  }`}
                />
                {errors.descriptionEn && (
                  <span className="text-[10px] text-red-500 flex items-center gap-1 justify-end">
                    {errors.descriptionEn} <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>

            {/* Category & Redirect URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-semibold">{t.qrCategory}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37]"
                >
                  <option value="monument">{t.monument}</option>
                  <option value="transport">{t.transport}</option>
                  <option value="facility">{t.facility}</option>
                  <option value="emergency">{t.emergencyCategory}</option>
                  <option value="culture">{t.culture}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-semibold">{t.qrTargetUrl}</label>
                <div className="relative">
                  <Link2 className="absolute right-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="url"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/masmak"
                    className={`w-full rounded-lg border bg-zinc-950 py-3 pl-4 pr-10 text-white outline-none focus:border-[#D4AF37] ${
                      errors.targetUrl ? 'border-red-500' : 'border-zinc-800'
                    }`}
                  />
                </div>
                {errors.targetUrl && (
                  <span className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.targetUrl}
                  </span>
                )}
              </div>
            </div>

            {/* Geography / Address Section */}
            <div className="border-t border-zinc-900 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#8B0000]" />
                {language === 'ar' ? 'العنوان وتحديد الموقع الجغرافي (اختياري)' : 'Address & Geo Location (Optional)'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-400 font-semibold">{t.qrAddressAr}</label>
                  <input
                    type="text"
                    name="addressAr"
                    value={formData.addressAr}
                    onChange={handleInputChange}
                    placeholder="مثال: حي العليا، الرياض"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5" dir="ltr">
                  <label className="block text-zinc-400 font-semibold text-right">{t.qrAddressEn}</label>
                  <input
                    type="text"
                    name="addressEn"
                    value={formData.addressEn}
                    onChange={handleInputChange}
                    placeholder="e.g. Olaya District, Riyadh"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-400 font-semibold">{language === 'ar' ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    value={formData.lat}
                    onChange={handleInputChange}
                    placeholder="24.7136"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-400 font-semibold">{language === 'ar' ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    value={formData.lng}
                    onChange={handleInputChange}
                    placeholder="46.6753"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Offer Image & Expiration Date Section */}
            <div className="border-t border-zinc-900 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                {language === 'ar' ? 'تفاصيل ومعلومات العرض الإضافية (اختياري)' : 'Additional Offer Details (Optional)'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-400 font-semibold">
                    {language === 'ar' ? 'رابط صورة الإعلان (URL)' : 'Offer Image URL'}
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-400 font-semibold">
                    {language === 'ar' ? 'تاريخ انتهاء صلاحية العرض' : 'Offer Expiration Date'}
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37] text-zinc-300"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 text-center py-3 rounded-lg bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] text-sm font-semibold text-white shadow-lg transition duration-200 cursor-pointer"
              >
                {t.createBtn}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Area */}
      <div className="space-y-6">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          {/* Top colored line indicator */}
          <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
          
          <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mt-2">
            {language === 'ar' ? 'معاينة ملصق الرمز الذكي' : 'Smart Tag Preview'}
          </h3>

          <AnimatePresence mode="wait">
            {generatedQR ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 w-full"
              >
                {/* Beautiful CityQR Signboard Tag */}
                <div className="border-4 border-[#D4AF37] bg-black p-6 rounded-2xl glow-gold inline-block w-full max-w-xs mx-auto">
                  <div className="border border-[#8B0000] p-4 rounded-xl space-y-4">
                    <div className="text-center" dir="ltr">
                      <span className="text-xl font-black tracking-tighter text-[#8B0000]">{language === 'ar' ? 'City' : 'City'}</span>
                      <span className="text-xl font-black tracking-tighter text-[#D4AF37]">{language === 'ar' ? 'QR' : 'QR'}</span>
                      <div className="w-12 h-0.5 bg-[#8B0000] mx-auto mt-1" />
                    </div>

                    {/* QR Code Container */}
                    <div className="bg-white p-3 rounded-lg mx-auto w-48 h-48 flex items-center justify-center border-2 border-[#D4AF37]">
                      <img 
                        src={qrImageSrc} 
                        alt={generatedQR.title} 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="text-center">
                      <h4 className="text-sm font-extrabold text-white truncate">{generatedQR.title}</h4>
                      <p className="text-[9px] text-zinc-500 font-mono mt-1 select-all">{generatedQR.targetUrl}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg justify-center">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.qrGeneratedSuccess}</span>
                  </div>

                  <a
                    href={qrImageSrc}
                    download={`cityqr-${generatedQR.title}.png`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full rounded-lg border border-[#D4AF37] bg-transparent text-[#D4AF37] py-2.5 text-xs font-semibold hover:bg-[#D4AF37]/10 transition"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadQr}
                  </a>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('dashboard')}
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#8B0000] text-white py-2.5 text-xs font-bold hover:bg-[#8B0000]/90 transition cursor-pointer shadow-md mt-2"
                    >
                      <span>{language === 'ar' ? '← العودة إلى لوحة التحكم وسجل الرموز' : '← Back to Dashboard & QR Registry'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="py-16 text-zinc-600 flex flex-col items-center space-y-4">
                <FileText className="w-16 h-16 text-zinc-800" />
                <p className="text-xs leading-relaxed max-w-[200px] mx-auto">
                  {language === 'ar' 
                    ? 'أدخل البيانات ثم اضغط توليد لرؤية تصميم ملصق الرمز وتحميله للطباعة.'
                    : 'Fill the form and click generate to view the landmark tag and download it for printing.'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
