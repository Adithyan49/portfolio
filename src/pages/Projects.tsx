import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FolderGit2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import {
  DbProject,
  fetchPublishedProjects,
  PROJECT_CATEGORIES,
} from '../services/projectService';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDetailModal } from '../components/ProjectDetailModal';

const FILTER_TABS = ['All', ...PROJECT_CATEGORIES];

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<DbProject | null>(null);

  const loadPublishedProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchPublishedProjects();
    if (fetchError) {
      setError(fetchError);
      setProjects([]);
    } else {
      setProjects(data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadPublishedProjects();
  }, [loadPublishedProjects]);

  const filteredProjects = projects.filter((project) => {
    // Only display published projects
    if (!project.is_published) return false;

    const matchesCategory =
      activeTab === 'All' || project.category === activeTab;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      project.title.toLowerCase().includes(q) ||
      project.short_description.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q) ||
      project.technologies.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
          <FolderGit2 className="w-4 h-4" />
          <span>Engineering Portfolio & Systems</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Featured <span className="text-gradient">Projects</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
          Practical applications spanning artificial intelligence, quantum-inspired cybersecurity, embedded assistive hardware, and modern web architectures.
        </p>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 overflow-x-auto">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6366F1] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or tech..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#7C5CFC] transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl border border-slate-800">
          <Loader2 className="w-7 h-7 text-[#00D4FF] animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">
            Loading published projects from Supabase...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200 font-medium">Unable to retrieve projects</p>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
          <button
            onClick={loadPublishedProjects}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && filteredProjects.length > 0 && (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onSelect={(p) => setSelectedProject(p)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">
            {projects.length === 0
              ? 'No published projects are currently listed.'
              : 'No projects matched your criteria.'}
          </p>
          {(activeTab !== 'All' || searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setActiveTab('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-[#00D4FF] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};
