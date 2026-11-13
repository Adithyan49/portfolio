import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Github,
  ExternalLink,
  Star,
  Globe,
} from 'lucide-react';
import {
  DbProject,
  ProjectFormInput,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  validateProjectInput,
} from '../services/projectService';

interface ProjectFormProps {
  isOpen: boolean;
  editingProject: DbProject | null;
  onClose: () => void;
  onSubmit: (input: ProjectFormInput, existingId?: string) => Promise<{ success: boolean; error?: string }>;
}

const EMPTY_FORM: ProjectFormInput = {
  title: '',
  short_description: '',
  description: '',
  category: 'AI / Machine Learning',
  technologies: [],
  image_url: '',
  screenshots: [],
  video_url: '',
  github_url: '',
  live_demo_url: '',
  status: 'In Development',
  completion_date: '',
  featured: false,
  is_published: true,
};

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  editingProject,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<ProjectFormInput>(EMPTY_FORM);
  const [techInput, setTechInput] = useState('');
  const [screenshotsInput, setScreenshotsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (editingProject) {
      setForm({
        title: editingProject.title || '',
        short_description: editingProject.short_description || '',
        description: editingProject.description || '',
        category: editingProject.category || 'AI / Machine Learning',
        technologies: editingProject.technologies || [],
        image_url: editingProject.image_url || '',
        screenshots: editingProject.screenshots || [],
        video_url: editingProject.video_url || '',
        github_url: editingProject.github_url || '',
        live_demo_url: editingProject.live_demo_url || '',
        status: editingProject.status || 'In Development',
        completion_date: editingProject.completion_date || '',
        featured: Boolean(editingProject.featured),
        is_published: editingProject.is_published !== false,
      });
      setTechInput((editingProject.technologies || []).join(', '));
      setScreenshotsInput((editingProject.screenshots || []).join('\n'));
    } else {
      setForm(EMPTY_FORM);
      setTechInput('');
      setScreenshotsInput('');
    }
  }, [isOpen, editingProject]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, submitting, onClose]);

  const handleImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTech = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedScreenshots = screenshotsInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: ProjectFormInput = {
      ...form,
      technologies: parsedTech,
      screenshots: parsedScreenshots,
    };

    const validationError = validateProjectInput(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit(payload, editingProject?.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to save project.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error saving project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => !submitting && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-[#0D1425] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200 my-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronized directly with Supabase <span className="font-mono text-[#00D4FF]">public.projects</span>
                </p>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/70 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AgriSaarthi AI"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  >
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Short Description */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Short Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise summary displayed on the project card..."
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>

              {/* Row 3: Detailed Description */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Comprehensive technical overview, problem solved, and engineering notes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white leading-relaxed focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>

              {/* Row 4: Technologies & Status & Completion Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Project Status <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  >
                    {PROJECT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Completion Date (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. March 2026"
                    value={form.completion_date}
                    onChange={(e) => setForm({ ...form, completion_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Technologies Used
                  </label>
                  <input
                    type="text"
                    placeholder="Python, React, Supabase"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>
              </div>

              {/* Row 5: Main Image URL + Local File Option */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <label className="block text-[11px] font-mono text-[#00D4FF] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Main Cover Image URL (Optional)</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  <input
                    type="text"
                    placeholder="https://example.com/project-cover.png"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                    }}
                    className="text-[11px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>
                {form.image_url && (
                  <div className="w-full aspect-video max-h-[140px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    <img
                      src={form.image_url}
                      alt="Cover preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Row 6: Screenshot URLs */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Screenshot URLs (One per line or comma-separated, Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://example.com/screenshot-1.png&#10;https://example.com/screenshot-2.png"
                  value={screenshotsInput}
                  onChange={(e) => setScreenshotsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>

              {/* Row 7: Video, GitHub, Live Demo URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    <span>Video Demo URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-300" />
                    <span>GitHub URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span>Live Demo URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.live_demo_url}
                    onChange={(e) => setForm({ ...form, live_demo_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>
              </div>

              {/* Row 8: Featured & Published Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Star className={`w-4 h-4 ${form.featured ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="text-xs font-semibold text-white block">Featured Project</span>
                      <span className="text-[11px] text-slate-400">Prioritize near the top of Projects</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#7C5CFC] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Globe className={`w-4 h-4 ${form.is_published ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="text-xs font-semibold text-white block">Publish Publicly</span>
                      <span className="text-[11px] text-slate-400">Visible to portfolio visitors</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="w-4 h-4 accent-[#00D4FF] cursor-pointer"
                  />
                </label>
              </div>

              {/* Submit / Cancel Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingProject ? 'Save Project Updates' : 'Create Project'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
