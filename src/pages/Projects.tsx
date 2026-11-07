import React, { useState } from 'react';
import { Search, Sparkles, FolderGit2 } from 'lucide-react';
import { initialProjects, Project } from '../data/projects';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDetailModal } from '../components/ProjectDetailModal';

const FILTER_TABS = [
  'All Projects',
  'AI / Machine Learning',
  'Web Development',
  'Cybersecurity',
  'Hardware / IoT'
];

export const Projects: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('All Projects');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Read custom projects if added via Admin
  const savedProjects = localStorage.getItem('adithyan_custom_projects');
  const projectsList: Project[] = savedProjects ? JSON.parse(savedProjects) : initialProjects;

  const filteredProjects = projectsList.filter((project) => {
    const matchesCategory =
      activeTab === 'All Projects' || project.category === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-10">
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
      </div>

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
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-all ${
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

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={(p) => setSelectedProject(p)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">
            No projects matched your criteria.
          </p>
          <button
            onClick={() => {
              setActiveTab('All Projects');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-[#00D4FF] hover:underline"
          >
            Reset filters
          </button>
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
