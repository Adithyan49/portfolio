import React from 'react';
import { ExternalLink, Github, ArrowRight, Layers, Video } from 'lucide-react';
import { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden">
      {/* Decorative subtle ambient card glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />

      <div>
        {/* Unboxed Metadata (Zero-Pill discipline) */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="text-[#00D4FF] font-medium tracking-wide">{project.category}</span>
          <div className="flex items-center gap-1.5">
            <span aria-hidden="true">·</span>
            <span>{project.status}</span>
          </div>
        </div>

        {/* Optional Project Banner Image */}
        {project.image && (
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-800/80 mb-4 bg-slate-950 flex items-center justify-center">
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* Project Title */}
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#A78BFA] transition-colors">
          {project.name}
        </h3>

        {/* Short description */}
        <p className="text-sm text-slate-400 leading-relaxed mb-5 line-clamp-3">
          {project.shortDescription}
        </p>

        {/* Technology tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-800"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-[11px] font-mono px-2 py-0.5 text-slate-400">
              +{project.technologies.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <button
          onClick={() => onSelect(project)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D4FF] hover:text-white transition-colors group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-2">
          {project.videoUrl && (
            <a
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-purple-950/60 text-[#00D4FF] hover:text-white hover:bg-purple-900 border border-purple-800/60 transition-colors"
              title="Watch Video Demo"
              aria-label={`Watch video of ${project.name}`}
            >
              <Video className="w-4 h-4" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              aria-label={`View ${project.name} on GitHub`}
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              aria-label={`Open live demo of ${project.name}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
