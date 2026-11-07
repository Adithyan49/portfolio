import React from 'react';
import { X, ExternalLink, Github, CheckCircle2, Video, ImageIcon } from 'lucide-react';
import { Project } from '../data/projects';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0D1425] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
          <span className="text-[#00D4FF] font-medium">{project.category}</span>
          <span aria-hidden="true">·</span>
          <span>Status: {project.status}</span>
          {project.completionDate && (
            <>
              <span aria-hidden="true">·</span>
              <span>{project.completionDate}</span>
            </>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
          {project.name}
        </h2>

        {/* Optional Media Preview Banner */}
        {project.image && (
          <div className="mb-6 rounded-xl overflow-hidden border border-slate-800 max-h-[260px]">
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Main description */}
        <div className="space-y-4 mb-6">
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.detailedDescription}
          </p>

          {/* Architecture overview */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Architecture & Approach
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {project.architectureOverview}
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Key Capabilities & Innovations
            </h4>
            <ul className="space-y-2">
              {project.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#7C5CFC] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies Used */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Technologies & Methodologies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800/90 text-slate-300 border border-slate-700/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {project.videoUrl && (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-purple-200 bg-purple-950/70 hover:bg-purple-900/70 border border-purple-800/60 rounded-lg transition-colors"
              >
                <Video className="w-4 h-4 text-[#00D4FF]" />
                <span>Watch Video Demo</span>
              </a>
            )}

            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Source code private or upon request
              </span>
            )}

            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] hover:opacity-95 rounded-lg transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Demo</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
