import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Github, ArrowRight, Video, Star, Layers } from 'lucide-react';
import { DbProject, isValidUrl } from '../services/projectService';

interface ProjectCardProps {
  project: DbProject;
  onSelect: (project: DbProject) => void;
  index?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, index = 0 }) => {
  const hasImage = Boolean(project.image_url && isValidUrl(project.image_url, true));
  const hasVideo = Boolean(project.video_url && isValidUrl(project.video_url));
  const hasGithub = Boolean(project.github_url && isValidUrl(project.github_url));
  const hasLiveDemo = Boolean(project.live_demo_url && isValidUrl(project.live_demo_url));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Subtle ambient glow on hover */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/12 transition-colors pointer-events-none" />

      <div>
        {/* Clean unboxed metadata row */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#00D4FF] font-medium tracking-wide truncate">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{project.status}</span>
          </div>

          {project.featured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Project Banner Image (or clean styled fallback frame when none set) */}
        {hasImage ? (
          <div
            onClick={() => onSelect(project)}
            className="w-full aspect-video rounded-xl overflow-hidden border border-slate-800/80 mb-4 bg-slate-950 flex items-center justify-center cursor-pointer"
          >
            <img
              src={project.image_url!}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            onClick={() => onSelect(project)}
            className="w-full aspect-[16/7] rounded-xl overflow-hidden border border-slate-800/70 mb-4 bg-gradient-to-br from-slate-900/90 via-[#0D1425] to-purple-950/30 flex items-center justify-between px-5 cursor-pointer group-hover:border-purple-500/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-slate-900/90 border border-slate-700/70 flex items-center justify-center text-[#00D4FF] shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-slate-400 truncate">
                {project.category}
              </span>
            </div>
            {project.completion_date && (
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {project.completion_date}
              </span>
            )}
          </div>
        )}

        {/* Project Title */}
        <h3
          onClick={() => onSelect(project)}
          className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#A78BFA] transition-colors cursor-pointer"
        >
          {project.title}
        </h3>

        {/* Short description */}
        <p className="text-sm text-slate-300/90 leading-relaxed mb-5 line-clamp-3">
          {project.short_description}
        </p>

        {/* Technologies list */}
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.technologies.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-800"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 5 && (
              <span className="text-[11px] font-mono px-2 py-0.5 text-slate-400">
                +{project.technologies.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <button
          onClick={() => onSelect(project)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D4FF] hover:text-white transition-colors group/btn cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-2">
          {hasVideo && (
            <a
              href={project.video_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-purple-950/60 text-[#00D4FF] hover:text-white hover:bg-purple-900 border border-purple-800/60 transition-colors"
              title="Watch Video Demonstration"
              aria-label={`Watch video demonstration of ${project.title}`}
            >
              <Video className="w-4 h-4" />
            </a>
          )}
          {hasGithub && (
            <a
              href={project.github_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              title="View GitHub Repository"
              aria-label={`View ${project.title} on GitHub`}
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {hasLiveDemo && (
            <a
              href={project.live_demo_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 text-[#00D4FF] hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Open Live Demo"
              aria-label={`Open live demo of ${project.title}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};
