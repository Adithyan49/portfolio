import React from 'react';
import {
  GraduationCap,
  Target,
  Brain,
  Code2,
  Award,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { initialProfile } from '../data/profile';

interface AboutProps {
  onNavigate: (pageId: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Section Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Biographical & Academic Profile</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About <span className="text-gradient">Adithyan</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
          First-year AI & Data Science undergraduate driven by algorithmic curiosity, machine learning exploration, and engineering practical prototypes.
        </p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card & Quick Bio (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            {/* Profile Avatar / Photo placeholder area */}
            <div className="relative w-full aspect-square max-w-[240px] mx-auto rounded-2xl bg-gradient-to-b from-[#111B30] to-[#070B16] border border-slate-700/80 p-3 flex flex-col items-center justify-center text-center overflow-hidden mb-6 shadow-xl">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#00D4FF] flex items-center justify-center text-white text-3xl font-extrabold mb-3 shadow-lg shadow-purple-950/50">
                A
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Adithyan</span>
              <span className="text-xs text-[#00D4FF] font-mono mt-0.5">AI & DS Student</span>
              <div className="mt-3 text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#A78BFA]" />
                <span>Pollachi, Coimbatore</span>
              </div>
            </div>

            {/* Core facts unboxed list */}
            <div className="space-y-3 text-xs border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Degree</span>
                <span className="font-medium text-right text-white">B.Tech AI & DS</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Institution</span>
                <span className="font-medium text-right text-white">Sri Eshwar College</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Academic Year</span>
                <span className="font-medium text-white">First Year</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Career Objective</span>
                <span className="font-medium text-[#00D4FF]">AI/ML Engineer</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => onNavigate('contact')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] hover:opacity-95 transition-opacity"
              >
                Get In Touch Directly
              </button>
            </div>
          </div>

          {/* Personal Tagline Card */}
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-[#7C5CFC]">
            <span className="text-xs font-mono text-[#A78BFA] uppercase tracking-wider block mb-1">
              Guiding Mantra
            </span>
            <p className="text-base font-bold text-white tracking-wide font-mono">
              &ldquo;{initialProfile.tagline}&rdquo;
            </p>
          </div>
        </div>

        {/* Right Column: Narrative, Interests, Philosophy (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Biography Narrative */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#7C5CFC]" />
              <span>Who I Am & What Drives Me</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {initialProfile.aboutMe}
            </p>
          </div>

          {/* Education Details Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#00D4FF]" />
              <span>Academic Foundation</span>
            </h2>
            {initialProfile.educationDetails.map((edu, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-base font-bold text-white">{edu.institution}</h3>
                    <p className="text-sm text-[#A78BFA]">{edu.degree}</p>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    <span>{edu.duration}</span> · <span>{edu.status}</span>
                  </div>
                </div>

                <ul className="space-y-1.5 pt-1">
                  {edu.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-[#00D4FF] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 3-Column Interests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Programming Interests */}
            <div className="glass-panel rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Code2 className="w-4 h-4 text-[#7C5CFC]" />
                <span>Programming</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {initialProfile.interests.programming.map((p, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#7C5CFC]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI & ML Interests */}
            <div className="glass-panel rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Brain className="w-4 h-4 text-[#00D4FF]" />
                <span>AI & ML Focus</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {initialProfile.interests.aiAndMl.map((m, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#00D4FF]" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Domain Interests */}
            <div className="glass-panel rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Layers className="w-4 h-4 text-[#A78BFA]" />
                <span>Domain Exploration</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {initialProfile.interests.domains.map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#A78BFA]" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Learning Philosophy Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#7C5CFC]" />
              <span>Learning Philosophy</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {initialProfile.learningPhilosophy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
