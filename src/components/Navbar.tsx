import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, MessageSquare, Terminal } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (pageId: string) => void;
}

export const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'learning', label: 'Learning' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleItemClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070B16]/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl shadow-purple-950/20 py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleItemClick('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          aria-label="Adithyan Portfolio Home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C5CFC] to-[#00D4FF] flex items-center justify-center text-white font-bold text-sm tracking-tighter shadow-md group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-[#00D4FF] transition-colors whitespace-nowrap">
            ADITHYAN
          </span>
        </button>

        {/* Zone 2: Desktop Navigation Links (Exhaustive 9 items) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`px-3 py-1.5 text-xs xl:text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'text-white bg-slate-800/70 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Admin Entrance */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleItemClick('contact')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#6366F1] hover:from-[#6D4AEB] hover:to-[#4F46E5] rounded-lg shadow-sm hover:shadow-purple-500/25 transition-all whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>

          <button
            onClick={() => handleItemClick('admin')}
            title="Private Admin Portal"
            className={`p-2 rounded-lg text-xs transition-colors border ${
              currentPage === 'admin'
                ? 'bg-purple-950/60 border-purple-500/50 text-[#A78BFA]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            aria-label="Admin Portal"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-[#070B16]/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1 shadow-2xl">
          <div className="grid grid-cols-2 gap-1.5 pt-1 pb-3">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-950/50 text-[#00D4FF] border border-purple-800/40'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => handleItemClick('contact')}
              className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
            >
              Get in Touch
            </button>
            <button
              onClick={() => handleItemClick('admin')}
              className="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-800"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
