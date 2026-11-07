import React from 'react';
import { Trophy, Calendar, Users, Code, CheckCircle, Lightbulb, ExternalLink, Video } from 'lucide-react';
import { initialHackathons, HackathonEvent } from '../data/hackathons';

export const Hackathons: React.FC = () => {
  // Allow reading custom hackathons if added via Admin
  const savedHackathons = localStorage.getItem('adithyan_custom_hackathons');
  const hackathonsList: HackathonEvent[] = savedHackathons ? JSON.parse(savedHackathons) : initialHackathons;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-12">
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

      {/* Events List */}
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
                  className="w-full h-full object-cover"
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
                {event.teamMembers && (
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
    </div>
  );
};
