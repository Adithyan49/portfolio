import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  RefreshCw,
  Database,
  Github,
  ExternalLink,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DbProject,
  ProjectFormInput,
  PROJECT_CATEGORIES,
  fetchAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  updateProjectFlags,
  seedMissingInitialProjects,
  isValidUrl,
} from '../services/projectService';
import { ProjectForm } from './ProjectForm';

interface ManageProjectsProps {
  onNotify: (message: string) => void;
}

const ADMIN_CATEGORIES = ['All', ...PROJECT_CATEGORIES];

export const ManageProjects: React.FC<ManageProjectsProps> = ({ onNotify }) => {
  const { isAdmin, isAuthenticated } = useAuth();

  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<DbProject | null>(null);

  // Delete confirmation modal state
  const [deletingTarget, setDeletingTarget] = useState<DbProject | null>(null);
  const [deletingBusy, setDeletingBusy] = useState<boolean>(false);
  const [seedingBusy, setSeedingBusy] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchAllProjectsAdmin();
    if (fetchError) {
      setError(fetchError);
    } else {
      setProjects(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadProjects();
    }
  }, [isAuthenticated, isAdmin, loadProjects]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: DbProject) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    input: ProjectFormInput,
    existingId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, error: 'Unauthorized: Verified administrator session required.' };
    }

    if (existingId) {
      const { data, error: updateErr } = await updateProject(existingId, input);
      if (updateErr || !data) {
        return { success: false, error: updateErr || 'Update failed.' };
      }
      setProjects((prev) => prev.map((p) => (p.id === existingId ? data : p)));
      onNotify(`Project "${data.title}" updated in Supabase.`);
      return { success: true };
    } else {
      const { data, error: createErr } = await createProject(input);
      if (createErr || !data) {
        return { success: false, error: createErr || 'Creation failed.' };
      }
      setProjects((prev) => [data, ...prev]);
      onNotify(`Project "${data.title}" saved to Supabase.`);
      return { success: true };
    }
  };

  const handleToggleFeatured = async (project: DbProject) => {
    if (!isAuthenticated || !isAdmin) return;
    setTogglingId(project.id);
    const nextVal = !project.featured;
    const { data, error: flagErr } = await updateProjectFlags(project.id, { featured: nextVal });
    setTogglingId(null);

    if (flagErr || !data) {
      setError(flagErr || 'Failed to update featured state.');
      return;
    }

    setProjects((prev) => prev.map((p) => (p.id === project.id ? data : p)));
    onNotify(`"${data.title}" ${nextVal ? 'marked as featured' : 'removed from featured'}.`);
  };

  const handleTogglePublished = async (project: DbProject) => {
    if (!isAuthenticated || !isAdmin) return;
    setTogglingId(project.id);
    const nextVal = !project.is_published;
    const { data, error: flagErr } = await updateProjectFlags(project.id, { is_published: nextVal });
    setTogglingId(null);

    if (flagErr || !data) {
      setError(flagErr || 'Failed to update publish visibility.');
      return;
    }

    setProjects((prev) => prev.map((p) => (p.id === project.id ? data : p)));
    onNotify(`"${data.title}" is now ${nextVal ? 'published publicly' : 'unpublished (hidden)'}.`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget || !isAuthenticated || !isAdmin) return;
    setDeletingBusy(true);
    const { success, error: delErr } = await deleteProject(deletingTarget.id);
    setDeletingBusy(false);

    if (!success) {
      setError(delErr || 'Could not delete project.');
      setDeletingTarget(null);
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== deletingTarget.id));
    onNotify(`Deleted "${deletingTarget.title}" from Supabase.`);
    setDeletingTarget(null);
  };

  const handleSeedInitial = async () => {
    if (!isAuthenticated || !isAdmin) return;
    setSeedingBusy(true);
    setError(null);
    const { insertedCount, error: seedErr } = await seedMissingInitialProjects(projects);
    setSeedingBusy(false);

    if (seedErr) {
      setError(seedErr);
      return;
    }

    if (insertedCount === 0) {
      onNotify('All 4 core portfolio projects already exist in Supabase.');
    } else {
      await loadProjects();
      onNotify(`Added ${insertedCount} missing core portfolio project(s) to Supabase.`);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = categoryFilter === 'All' || project.category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      project.title.toLowerCase().includes(q) ||
      project.short_description.toLowerCase().includes(q) ||
      project.technologies.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-center">
        <AlertCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
        <p className="text-sm text-rose-200 font-semibold">Administrator Authorization Required</p>
        <p className="text-xs text-rose-300/80 mt-1">
          Only database-verified administrators can manage Supabase projects.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00D4FF]" />
            <span>Supabase Project Management ({projects.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, edit, publish, feature, and manage projects stored in <span className="font-mono text-[#A78BFA]">public.projects</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSeedInitial}
            disabled={seedingBusy || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:border-[#00D4FF] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            title="Safely inserts AgriSaarthi AI, QShield, Smart Blind Stick, and Personal Portfolio if not already present"
          >
            {seedingBusy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00D4FF]" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4FF]" />
            )}
            <span>Sync Core 4 Projects</span>
          </button>

          <button
            type="button"
            onClick={loadProjects}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] hover:opacity-95 transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">Supabase Operation Notice</p>
            <p className="text-rose-300/90 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-300 hover:text-white text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
          {ADMIN_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6366F1] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, summary, or tech..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="py-16 glass-panel rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin mb-2" />
          <p className="text-xs font-mono text-slate-400">Fetching projects from Supabase...</p>
        </div>
      )}

      {/* Projects List */}
      {!loading && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => {
            const isToggling = togglingId === project.id;
            return (
              <div
                key={project.id}
                className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {project.image_url && isValidUrl(project.image_url, true) && (
                    <div className="hidden sm:block w-28 aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
                      <span className="text-[#00D4FF]">{project.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.status}</span>
                      {project.completion_date && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{project.completion_date}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className={project.is_published ? 'text-emerald-400' : 'text-amber-400'}>
                        {project.is_published ? 'Published' : 'Draft / Hidden'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white truncate">{project.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{project.short_description}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.github_url && isValidUrl(project.github_url) && (
                        <span title="GitHub URL attached" className="inline-flex">
                          <Github className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      )}
                      {project.live_demo_url && isValidUrl(project.live_demo_url) && (
                        <span title="Live demo URL attached" className="inline-flex">
                          <ExternalLink className="w-3.5 h-3.5 text-[#00D4FF]" />
                        </span>
                      )}
                      {project.video_url && isValidUrl(project.video_url) && (
                        <span title="Video URL attached" className="inline-flex">
                          <Video className="w-3.5 h-3.5 text-purple-400" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggleFeatured(project)}
                    title={project.featured ? 'Remove featured status' : 'Mark as featured'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      project.featured
                        ? 'bg-amber-950/50 border-amber-700/60 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${project.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{project.featured ? 'Featured' : 'Feature'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleTogglePublished(project)}
                    title={project.is_published ? 'Unpublish project' : 'Publish project'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      project.is_published
                        ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {project.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{project.is_published ? 'Published' : 'Hidden'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(project)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200 hover:border-[#7C5CFC] hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingTarget(project)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 border border-rose-900/60 text-rose-300 hover:bg-rose-900/50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="py-14 px-6 glass-panel rounded-2xl border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-300 font-medium">
            {projects.length === 0
              ? 'No projects found in Supabase public.projects yet.'
              : 'No projects match your current search or category filter.'}
          </p>
          {projects.length === 0 && (
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &ldquo;Add Project&rdquo; to create a custom entry, or click &ldquo;Sync Core 4 Projects&rdquo; to populate AgriSaarthi AI, QShield, Smart Blind Stick, and Personal Portfolio.
            </p>
          )}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        editingProject={editingProject}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deletingTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !deletingBusy && setDeletingTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0D1425] border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <h4 className="text-lg font-bold text-white">Delete Project?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-white">&ldquo;{deletingTarget.title}&rdquo;</span> from
                Supabase? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={deletingBusy}
                  onClick={() => setDeletingTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingBusy}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 cursor-pointer"
                >
                  {deletingBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
