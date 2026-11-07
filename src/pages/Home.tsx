import React from 'react';
import { ArrowRight, MessageSquare, FileText, Github, Linkedin, Terminal, ChevronDown } from 'lucide-react';
import { HeroIcons3D } from '../components/HeroIcons3D';
import { initialProfile } from '../data/profile';
import { socialLinks } from '../data/socialLinks';

interface HomeProps {
  onNavigate: (pageId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  // Check if resume file has been provided in localStorage
  const resumeUrl = localStorage.getItem('adithyan_resume_url');

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between pt-16 sm:pt-20">
      {/* Hero Section Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center py-8 lg:py-16">
          {/* Left Column: Typographic Presentation */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-xs font-mono text-[#A78BFA]">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
              <span className="tracking-wide uppercase font-semibold">{initialProfile.tagline}</span>
            </div>

            {/* Giant Title */}
            <div>
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white mb-2 leading-none">
                Hi, I&apos;m <span className="text-gradient">{initialProfile.name}</span>
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-[#00D4FF] tracking-tight">
                {initialProfile.professionalTitle}
              </p>
            </div>

            {/* Supporting Intro */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {initialProfile.supportingIntro}
            </p>

            {/* Academic details info strip */}
            <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2 pt-1">
              <span>{initialProfile.degree}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">{initialProfile.college}</span>
              <span aria-hidden="true">·</span>
              <span>{initialProfile.location}</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('projects')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#7C5CFC] to-[#6366F1] hover:from-[#6D4AEB] hover:to-[#4F46E5] shadow-lg shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>View Projects</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:text-white transition-all"
              >
                <MessageSquare className="w-4 h-4 text-[#00D4FF]" />
                <span>Contact Me</span>
              </button>

              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  download="Adithyan_Resume.pdf"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Resume PDF</span>
                </a>
              ) : (
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  title="Full credentials available on the About page"
                >
                  <span>Explore Journey</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Social icons row */}
            <div className="pt-4 flex flex-wrap items-center gap-2.5">
              <span className="text-xs text-slate-400 font-mono mr-1">Profiles:</span>
              <a
                href="https://github.com/Adithyan49"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-[#7C5CFC] transition-colors"
                title="GitHub"
                aria-label="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/adithyan-r-7420bb419/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-[#00D4FF] hover:border-[#00D4FF] transition-colors"
                title="LinkedIn"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919659007117"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/60 transition-colors"
                title="WhatsApp Direct Chat"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </a>
              <a
                href="https://www.instagram.com/aadhi49.exe/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-pink-400 hover:border-pink-500/60 transition-colors"
                title="Instagram (@aadhi49.exe)"
                aria-label="Instagram Profile"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://leetcode.com/u/adithyan_adhi/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-[#A78BFA] hover:border-[#A78BFA] transition-colors"
                title="LeetCode"
                aria-label="LeetCode Profile"
              >
                <Terminal className="w-4 h-4" />
              </a>
              <a
                href="https://www.kaggle.com/adithyanraids"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-[#00D4FF] hover:border-[#00D4FF] transition-colors"
                title="Kaggle"
                aria-label="Kaggle Profile"
              >
                <span className="font-mono font-bold text-xs">K</span>
              </a>
            </div>
          </div>

          {/* Right Column: Three.js Interactive Floating Icons */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <HeroIcons3D />
          </div>
        </div>
      </div>

      {/* Subtle Bottom Scroll Indicator */}
      <div className="w-full flex justify-center pb-6 pt-2">
        <button
          onClick={() => onNavigate('about')}
          className="flex flex-col items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors group focus:outline-none"
        >
          <span className="font-mono text-[11px] tracking-wider uppercase">Scroll to Discover</span>
          <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform text-[#7C5CFC]" />
        </button>
      </div>
    </div>
  );
};
