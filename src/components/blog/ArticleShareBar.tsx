'use client';

import React from 'react';
import { useArticleShare } from '@/hooks/useArticleShare';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';

interface ArticleShareBarProps {
  title: string;
  url: string;
  whatsappShareUrl: string;
}

export const ArticleShareBar: React.FC<ArticleShareBarProps> = ({
  title,
  url,
  whatsappShareUrl,
}) => {
  const { copied, handleShare, handleCopyLink } = useArticleShare({
    title,
    url,
  });

  return (
    <div className="flex items-center flex-wrap gap-2">
      {/* WhatsApp 1-Click Share */}
      <a
        href={whatsappShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-all duration-200 border border-emerald-200/80 hover:border-emerald-300 shadow-xs hover:shadow-sm group text-decoration-none"
        title="Share on WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
        <span>WhatsApp</span>
      </a>

      {/* Native Web Share / Copy Fallback */}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all duration-200 border border-slate-200 hover:border-slate-300 cursor-pointer shadow-xs hover:shadow-sm"
        title="Share this article"
      >
        <Share2 className="w-3.5 h-3.5 text-slate-500" />
        <span>Share</span>
      </button>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer shadow-xs hover:shadow-sm ${
          copied
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/20'
            : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300'
        }`}
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50 duration-200" />
            <span className="font-bold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
};
