import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { directContact } from '../data/socialLinks';

export const WhatsAppButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      aria-label="Direct WhatsApp contact"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip badge (hidden on mobile to prevent overlaying content) */}
      {isHovered && (
        <span
          className="hidden sm:inline-block px-3 py-1.5 rounded-lg bg-slate-900/95 text-xs text-white border border-slate-700 shadow-xl whitespace-nowrap transition-opacity duration-200"
          role="tooltip"
        >
          Chat with Adithyan
        </span>
      )}

      {/* Floating Action Button */}
      <a
        href={directContact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat directly on WhatsApp"
        className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-xl shadow-emerald-950/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
      </a>
    </aside>
  );
};
