import React, { useState } from 'react';

interface OfferCardDescriptionProps {
  description: string;
  language: string;
}

export const OfferCardDescription: React.FC<OfferCardDescriptionProps> = ({
  description,
  language
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description && description.trim().length > 65;

  return (
    <div className="mt-1.5 text-xs text-zinc-400 leading-relaxed font-medium">
      <p className={`transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {description}
      </p>
      {isLong && !isExpanded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="mt-1.5 inline-flex items-center gap-1.5 text-[#D4AF37] hover:text-amber-300 font-extrabold text-xs cursor-pointer hover:underline bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/10 to-transparent px-2.5 py-1 rounded-lg border border-[#D4AF37]/35 shadow-xs transition-all duration-200 active:scale-95 group/more"
        >
          <span className="text-[11px] font-black tracking-wide group-hover/more:translate-x-0.5 transition-transform">
            {language === 'ar' ? '... مزيد من التفاصيل' : '... See more'}
          </span>
        </button>
      )}
      {isLong && isExpanded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
          className="mt-1.5 inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 font-bold text-[11px] cursor-pointer hover:underline px-2 py-0.5 transition-all duration-200 active:scale-95 bg-zinc-900/80 rounded-md border border-zinc-800"
        >
          <span>{language === 'ar' ? '▲ عرض أقل' : '▲ Show less'}</span>
        </button>
      )}
    </div>
  );
};
