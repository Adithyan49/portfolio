import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Terminal, Video, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { SkillItem, SkillStatus } from '../data/skills';
import { fetchSkills } from '../services/portfolioContentService';

interface SkillsProps {
  onNavigate: (pageId: string) => void;
}

const CATEGORIES = [
  'All',
  'Programming Languages',
  'Web Technologies',
  'AI & Machine Learning',
  'Tools & Platforms',
];

export const Skills: React.FC<SkillsProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchSkills();
    if (res.error) {
      setError(res.error);
      setSkillsList([]);
    } else {
      setSkillsList(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const filteredSkills =
    selectedCategory === 'All'
      ? skillsList
      : skillsList.filter((s) => s.category === selectedCategory);

  const getStatusBadge = (status: SkillStatus) => {
    switch (status) {
      case 'Practising':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
            ● Practising Daily
          </span>
        );
      case 'Learning':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50">
            ● Actively Learning
          </span>
        );
      case 'Exploring':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
            ● Exploring Concepts
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Technical Competencies & Exploration</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Skills & <span className="text-gradient">Technologies</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Core programming foundations, web technologies, and artificial intelligence concepts actively developed through academic coursework and practical projects.
          </p>
        </div>

        <button
          onClick={loadSkills}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-[#7C5CFC] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00D4FF]' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Interactive Category Filter Tabs (Single-line controls) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 overflow-x-auto mb-10 max-w-fit">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6366F1] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl border border-slate-800">
          <Loader2 className="w-7 h-7 text-[#00D4FF] animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">Loading skills from Supabase...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200 font-medium">Unable to load skills</p>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSkills.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
          <Terminal className="w-8 h-8 text-[#00D4FF] mx-auto mb-3" />
          <p className="text-sm text-slate-400">No skills found for this filter.</p>
        </div>
      )}

      {/* Skills Grid */}
      {!loading && !error && filteredSkills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Category & Status */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-mono text-[#00D4FF]">{skill.category}</span>
                  {getStatusBadge(skill.status)}
                </div>

                {/* Skill Photo / Badge Preview */}
                {skill.imageUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 mb-3 shrink-0">
                    <img
                      src={skill.imageUrl}
                      alt={skill.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#A78BFA] transition-colors">
                  {skill.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  {skill.description}
                </p>

                {/* Video Walkthrough if present */}
                {skill.videoUrl && (
                  <div className="mb-4">
                    <a
                      href={skill.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#00D4FF] hover:underline font-mono"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Watch Skill Demo Video →</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Key Topics */}
              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Focal Topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skill.keyTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Currently Learning Highlight Banner */}
      <div className="mt-14 glass-panel rounded-2xl p-6 sm:p-8 border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-cyan-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A78BFA] uppercase tracking-wider">
              <Brain className="w-4 h-4 text-[#00D4FF]" />
              <span>Current Academic Focus</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Actively Expanding Machine Learning Foundations
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Synthesizing linear algebra, calculus, and Python algorithmic workflows to prepare for end-to-end neural network modeling.
            </p>
          </div>

          <button
            onClick={() => onNavigate('learning')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 whitespace-nowrap transition-colors"
          >
            View Learning Journey
          </button>
        </div>
      </div>
    </div>
  );
};
