import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Calendar, Users, CheckCircle, Lightbulb, Video, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { HackathonEvent } from '../data/hackathons';
import { fetchHackathons } from '../services/portfolioContentService';

export const Hackathons: React.FC = () => {
  const [hackathonsList, setHackathonsList] = useState<HackathonEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadHackathons = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchHackathons();
    if (res.error) {
      setError(res.error);
      setHackathonsList([]);
    } else {
      setHackathonsList(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Competitions & Technical Hackathons</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Hackathons & <span className="text-gradient">Experiences</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            High-intensity problem-solving sprints, collaborative software engineering, and technical ideation challenges.
          </p>
        </div>

        <button
          onClick={loadHackathons}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-[#7C5CFC] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00D4FF]' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl border border-slate-800">
          <Loader2 className="w-7 h-7 text-[#00D4FF] animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">Loading hackathon records from Supabase...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200 font-medium">Unable to load hackathons</p>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && hackathonsList.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
          <Trophy className="w-8 h-8 text-[#A78BFA] mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hackathon experiences recorded in Supabase yet.</p>
        </div>
      )}

      {/* Events List */}
      {!loading && !error && hackathonsList.length > 0 && (
        <div className="space-y-8">
          {hackathonsList.map((event) => (
            <div
              key={event.id}
              className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-1">
                    <span>{event.participationStatus}</span>
                    <span aria-hidden="true">·</span>
                    <span>{event.role}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {event.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>{event.date}</span>
                </div>
              </div>

              {/* Event Photo / Stage Photo */}
              {event.imageUrl && (
                <div className="mt-5 w-full aspect-video max-h-[340px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Description & Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Event Overview
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <h4 className="text-xs font-mono text-[#00D4FF] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Project Prototype Engineered</span>
                    </h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {event.projectDetails}
                    </p>
                  </div>
                </div>

                {/* Right: Key Learnings & Team */}
                <div className="lg:col-span-5 space-y-4">
                  {event.teamMembers && event.teamMembers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#7C5CFC]" />
                        <span>Collaboration</span>
                      </h4>
                      <p className="text-xs text-slate-300">
                        {event.teamMembers.join(' · ')}
                      </p>
                    </div>
                  )}

                  {event.keyLearnings.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                        Key Technical Learnings
                      </h4>
                      <ul className="space-y-1.5">
                        {event.keyLearnings.map((learning, lIdx) => (
                          <li key={lIdx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle className="w-3.5 h-3.5 text-[#00D4FF] shrink-0 mt-0.5" />
                            <span>{learning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Tech Tags & Result */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {event.technologiesUsed.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {event.videoUrl && (
                    <a
                      href={event.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-950/70 hover:bg-purple-900 border border-purple-800/60 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-[#00D4FF]" />
                      <span>Watch Demo Video</span>
                    </a>
                  )}

                  {event.result && (
                    <div className="text-xs font-mono text-[#A78BFA] bg-purple-950/40 border border-purple-800/40 px-3 py-1.5 rounded-lg whitespace-nowrap">
                      {event.result}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
