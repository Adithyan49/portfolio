import React from 'react';
import { Github, Linkedin, Mail, MessageCircle, Terminal, Heart, Shield } from 'lucide-react';
import { socialLinks, directContact } from '../data/socialLinks';

interface FooterProps {
  onNavigate: (pageId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-white/10 bg-[#030305]/85 backdrop-blur-md text-slate-400 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-lg text-white tracking-tight">ADITHYAN</span>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs text-[#00D4FF] font-mono">B.Tech AI & Data Science</span>
          </div>
          <p className="text-xs text-slate-400 font-mono tracking-wider">
            &ldquo;CODE. CREATE. INNOVATE. REPEAT.&rdquo;
          </p>
          <p className="text-xs text-slate-400">
            Sri Eshwar College of Engineering · Pollachi, Coimbatore, India
          </p>
        </div>

        {/* Quick Social & Direct Action Icons */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Adithyan49"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-[#7C5CFC] transition-colors"
            aria-label="GitHub Profile"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/adithyan-r-7420bb419/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-[#00D4FF] transition-colors"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href="https://leetcode.com/u/adithyan_adhi/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-[#A78BFA] transition-colors"
            aria-label="LeetCode Profile"
          >
            <Terminal className="w-4 h-4" />
          </a>
          <a
            href="https://www.instagram.com/aadhi49.exe/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-pink-400 hover:text-pink-300 hover:border-pink-500/50 transition-colors"
            aria-label="Instagram Profile"
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            href={directContact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
            aria-label="WhatsApp Direct Chat"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a
            href={directContact.emailMailto}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400 hover:text-purple-300 hover:border-purple-500/50 transition-colors"
            aria-label="Send Direct Email"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>

        {/* Copyright & Admin Link */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Adithyan. All rights reserved.</span>
          <button
            onClick={() => onNavigate('admin')}
            className="text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
