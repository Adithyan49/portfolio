import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Github, Video, Star, Calendar, Image as ImageIcon } from 'lucide-react';
import { DbProject, isValidUrl } from '../services/projectService';

interface ProjectDetailModalProps {
  project: DbProject | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!project) {
      setActiveImage(null);
      return;
    }

    const firstValid =
      project.image_url && isValidUrl(project.image_url, true)
        ? project.image_url
        : project.screenshots?.find((s) => isValidUrl(s, true)) || null;
    setActiveImage(firstValid);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  const galleryImages = project
    ? [
        ...(project.image_url && isValidUrl(project.image_url, true) ? [project.image_url] : []),
        ...(project.screenshots || []).filter((s) => isValidUrl(s, true)),
      ].filter((url, idx, arr) => arr.indexOf(url) === idx)
    : [];

  const hasVideo = Boolean(project?.video_url && isValidUrl(project.video_url));
  const hasGithub = Boolean(project?.github_url && isValidUrl(project.github_url));
  const hasLiveDemo = Boolean(project?.live_demo_url && isValidUrl(project.live_demo_url));

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-[#0D1425] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200 my-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close project details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Unboxed Metadata Header */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2 font-mono pr-10">
              <span className="text-[#00D4FF] font-medium">{project.category}</span>
              <span aria-hidden="true">·</span>
              <span>{project.status}</span>
              {project.completion_date && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {project.completion_date}
                  </span>
                </>
              )}
              {project.featured && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Featured
                  </span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight pr-8">
              {project.title}
            </h2>

            {/* Active Image Preview */}
            {activeImage && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
                <img
                  src={activeImage}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Screenshots Thumbnail Strip (if more than 1 image) */}
            {galleryImages.length > 1 && (
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>Screenshots ({galleryImages.length})</span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`shrink-0 w-24 aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        activeImage === imgUrl
                          ? 'border-[#00D4FF] ring-2 ring-[#00D4FF]/30'
                          : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${project.title} screenshot ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Short Summary Highlight */}
            <p className="text-sm sm:text-base text-cyan-200/90 font-medium leading-relaxed mb-4">
              {project.short_description}
            </p>

            {/* Detailed Description */}
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Project Overview & Details
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {/* Technologies Used */}
              {project.technologies.length > 0 && (
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
              )}
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {hasVideo && (
                  <a
                    href={project.video_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-purple-200 bg-purple-950/70 hover:bg-purple-900/70 border border-purple-800/60 rounded-lg transition-colors"
                  >
                    <Video className="w-4 h-4 text-[#00D4FF]" />
                    <span>Watch Video Demo</span>
                  </a>
                )}

                {hasGithub && (
                  <a
                    href={project.github_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub Repository</span>
                  </a>
                )}

                {hasLiveDemo && (
                  <a
                    href={project.live_demo_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] hover:opacity-95 rounded-lg transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Demo</span>
                  </a>
                )}

                {!hasVideo && !hasGithub && !hasLiveDemo && (
                  <span className="text-xs text-slate-400 italic">
                    Repository and live preview links are currently private or in preparation.
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ProjectDetails = ProjectDetailModal;
