import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  MessageSquare,
  FolderGit2,
  Terminal,
  Trophy,
  Award,
  Database,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Save,
  BarChart3,
  BookOpen,
  Video,
  KeyRound,
  Upload,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { fetchContactMessages, ContactMessage, supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ManageProjects } from './ManageProjects';
import { SkillItem, SkillStatus } from '../data/skills';
import { HackathonEvent } from '../data/hackathons';
import { Certificate } from '../data/certificates';
import { BlogPost } from '../data/blog';
import {
  CodingStats,
  DEFAULT_CODING_STATS,
  FULL_SUPABASE_SQL_SCHEMA,
  fileToCompressedDataUrl,
  fetchBlogPosts,
  createBlogPost,
  deleteBlogPost,
  seedInitialBlogPosts,
  fetchCertificates,
  createCertificate,
  deleteCertificate,
  seedInitialCertificates,
  fetchHackathons,
  createHackathon,
  deleteHackathon,
  seedInitialHackathons,
  fetchSkills,
  createSkill,
  deleteSkill,
  seedInitialSkills,
  fetchCodingStats,
  saveCodingStats,
} from '../services/portfolioContentService';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (pageId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onNavigate }) => {
  const { user, signOut: authSignOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'blog' | 'certificates' | 'hackathons' | 'projects' | 'skills' | 'messages' | 'stats' | 'security' | 'schema'
  >('blog');

  // Helper to compress and convert uploaded image files into lightweight Data URLs
  const handleFileToBase64 = async (file: File, callback: (base64: string) => void) => {
    if (!file) return;
    try {
      const compressed = await fileToCompressedDataUrl(file);
      callback(compressed);
    } catch (err: any) {
      showError(err?.message || 'Could not process image file.');
    }
  };

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Supabase-synced content states
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [savingBlog, setSavingBlog] = useState(false);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [savingCert, setSavingCert] = useState(false);

  const [hackathons, setHackathons] = useState<HackathonEvent[]>([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);
  const [savingHackathon, setSavingHackathon] = useState(false);
  const [hackathonsTableMissing, setHackathonsTableMissing] = useState(false);

  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [savingSkill, setSavingSkill] = useState(false);
  const [skillsTableMissing, setSkillsTableMissing] = useState(false);

  const [stats, setStats] = useState<CodingStats>(DEFAULT_CODING_STATS);
  const [loadingStats, setLoadingStats] = useState(true);
  const [savingStats, setSavingStats] = useState(false);
  const [statsTableMissing, setStatsTableMissing] = useState(false);

  const [seedingTab, setSeedingTab] = useState<string | null>(null);

  // Password management state
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');

  const [notification, setNotification] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const notify = (msg: string) => {
    setErrorBanner(null);
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const showError = (msg: string) => {
    setErrorBanner(msg);
  };

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const data = await fetchContactMessages();
      setMessages(data);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const loadBlog = useCallback(async () => {
    setLoadingBlog(true);
    const res = await fetchBlogPosts();
    if (res.error) {
      showError(`Blog sync error: ${res.error}`);
    } else {
      setBlogPosts(res.data);
    }
    setLoadingBlog(false);
  }, []);

  const loadCertificates = useCallback(async () => {
    setLoadingCerts(true);
    const res = await fetchCertificates();
    if (res.error) {
      showError(`Certificates sync error: ${res.error}`);
    } else {
      setCertificates(res.data);
    }
    setLoadingCerts(false);
  }, []);

  const loadHackathons = useCallback(async () => {
    setLoadingHackathons(true);
    const res = await fetchHackathons();
    setHackathonsTableMissing(res.tableMissing);
    if (res.error) {
      showError(`Hackathons sync error: ${res.error}`);
    } else {
      setHackathons(res.tableMissing ? [] : res.data);
    }
    setLoadingHackathons(false);
  }, []);

  const loadSkills = useCallback(async () => {
    setLoadingSkills(true);
    const res = await fetchSkills();
    setSkillsTableMissing(res.tableMissing);
    if (res.error) {
      showError(`Skills sync error: ${res.error}`);
    } else {
      setSkills(res.tableMissing ? [] : res.data);
    }
    setLoadingSkills(false);
  }, []);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    const res = await fetchCodingStats();
    setStatsTableMissing(res.tableMissing);
    if (res.error) {
      showError(`Coding stats sync error: ${res.error}`);
    } else {
      setStats(res.data);
    }
    setLoadingStats(false);
  }, []);

  useEffect(() => {
    loadMessages();
    loadBlog();
    loadCertificates();
    loadHackathons();
    loadSkills();
    loadStats();
  }, [loadMessages, loadBlog, loadCertificates, loadHackathons, loadSkills, loadStats]);

  // 1. Add Blog Post (Supabase)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: 'AI, Machine Learning, Engineering',
    imageUrl: '',
    videoUrl: '',
    linkedInPostUrl: '',
  });

  const handleAddBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    setSavingBlog(true);
    setErrorBanner(null);
    const res = await createBlogPost({
      title: newPost.title,
      content: newPost.content,
      tags: newPost.tags.split(',').map((t) => t.trim()).filter(Boolean),
      imageUrl: newPost.imageUrl || undefined,
      videoUrl: newPost.videoUrl || undefined,
      linkedInPostUrl: newPost.linkedInPostUrl || undefined,
    });
    setSavingBlog(false);

    if (res.error || !res.data) {
      showError(res.error || 'Failed to publish blog post to Supabase.');
      return;
    }

    setBlogPosts((prev) => [res.data!, ...prev]);
    setNewPost({
      title: '',
      content: '',
      tags: 'AI, Machine Learning, Engineering',
      imageUrl: '',
      videoUrl: '',
      linkedInPostUrl: '',
    });
    if (res.schemaNotice) {
      showError(res.schemaNotice);
    }
    notify(`Published post to Supabase: "${res.data.title}"`);
  };

  const handleDeletePost = async (id: string) => {
    const res = await deleteBlogPost(id);
    if (!res.success) {
      showError(res.error || 'Failed to delete blog post.');
      return;
    }
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    notify('Blog post deleted from Supabase.');
  };

  const handleSeedBlog = async () => {
    setSeedingTab('blog');
    const res = await seedInitialBlogPosts(blogPosts);
    setSeedingTab(null);
    if (res.error) {
      showError(res.error);
      return;
    }
    await loadBlog();
    notify(res.insertedCount > 0 ? `Imported ${res.insertedCount} blog posts to Supabase.` : 'Starter blog posts are already in Supabase.');
  };

  // 2. Add Certificate with Photo & Video (Supabase)
  const [newCert, setNewCert] = useState({
    title: '',
    issuingOrganization: '',
    completionDate: '2026',
    description: '',
    credentialUrl: '',
    category: 'Academics' as Certificate['category'],
    imageUrl: '',
    videoUrl: '',
  });

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.title.trim() || !newCert.issuingOrganization.trim()) return;

    setSavingCert(true);
    setErrorBanner(null);
    const res = await createCertificate({
      title: newCert.title,
      issuingOrganization: newCert.issuingOrganization,
      completionDate: newCert.completionDate,
      description: newCert.description,
      credentialUrl: newCert.credentialUrl || undefined,
      category: newCert.category,
      imageUrl: newCert.imageUrl || undefined,
      videoUrl: newCert.videoUrl || undefined,
    });
    setSavingCert(false);

    if (res.error || !res.data) {
      showError(res.error || 'Failed to save certificate to Supabase.');
      return;
    }

    setCertificates((prev) => [res.data!, ...prev]);
    setNewCert({
      title: '',
      issuingOrganization: '',
      completionDate: '2026',
      description: '',
      credentialUrl: '',
      category: 'Academics',
      imageUrl: '',
      videoUrl: '',
    });
    if (res.schemaNotice) {
      showError(res.schemaNotice);
    }
    notify(`Certificate "${res.data.title}" saved to Supabase.`);
  };

  const handleDeleteCertificate = async (id: string) => {
    const res = await deleteCertificate(id);
    if (!res.success) {
      showError(res.error || 'Failed to delete certificate.');
      return;
    }
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    notify('Certificate deleted from Supabase.');
  };

  const handleSeedCertificates = async () => {
    setSeedingTab('certificates');
    const res = await seedInitialCertificates(certificates);
    setSeedingTab(null);
    if (res.error) {
      showError(res.error);
      return;
    }
    if (res.schemaNotice) {
      showError(res.schemaNotice);
    }
    await loadCertificates();
    notify(res.insertedCount > 0 ? `Imported ${res.insertedCount} certificate record(s) to Supabase.` : 'Initial certificates already synced.');
  };

  // 3. Add Hackathon with Photo & Video (Supabase)
  const [newHackathon, setNewHackathon] = useState({
    name: '',
    description: '',
    date: '2026',
    participationStatus: 'Active Participant',
    role: 'Developer & AI System Researcher',
    teamMembers: 'Adithyan (Lead Developer), Peer Collaborators',
    technologiesUsed: 'Python, AI Agents, APIs',
    projectDetails: '',
    keyLearnings: 'System architecture, API optimization, rapid sprint problem solving',
    result: 'Working prototype demonstration',
    imageUrl: '',
    videoUrl: '',
  });

  const handleAddHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHackathon.name.trim()) return;

    setSavingHackathon(true);
    setErrorBanner(null);
    const res = await createHackathon({
      name: newHackathon.name,
      description: newHackathon.description,
      date: newHackathon.date,
      participationStatus: newHackathon.participationStatus,
      role: newHackathon.role,
      teamMembers: newHackathon.teamMembers.split(',').map((t) => t.trim()).filter(Boolean),
      technologiesUsed: newHackathon.technologiesUsed.split(',').map((t) => t.trim()).filter(Boolean),
      projectDetails: newHackathon.projectDetails,
      keyLearnings: newHackathon.keyLearnings.split(',').map((l) => l.trim()).filter(Boolean),
      result: newHackathon.result || undefined,
      imageUrl: newHackathon.imageUrl || undefined,
      videoUrl: newHackathon.videoUrl || undefined,
    });
    setSavingHackathon(false);

    if (res.error || !res.data) {
      if (res.tableMissing) setHackathonsTableMissing(true);
      showError(res.error || 'Failed to save hackathon to Supabase.');
      return;
    }

    setHackathons((prev) => [res.data!, ...prev]);
    setNewHackathon({
      name: '',
      description: '',
      date: '2026',
      participationStatus: 'Active Participant',
      role: 'Developer & AI System Researcher',
      teamMembers: '',
      technologiesUsed: '',
      projectDetails: '',
      keyLearnings: '',
      result: '',
      imageUrl: '',
      videoUrl: '',
    });
    notify(`Hackathon "${res.data.name}" saved to Supabase.`);
  };

  const handleDeleteHackathon = async (id: string) => {
    const res = await deleteHackathon(id);
    if (!res.success) {
      showError(res.error || 'Failed to delete hackathon.');
      return;
    }
    setHackathons((prev) => prev.filter((h) => h.id !== id));
    notify('Hackathon removed from Supabase.');
  };

  const handleSeedHackathons = async () => {
    setSeedingTab('hackathons');
    const res = await seedInitialHackathons(hackathons);
    setSeedingTab(null);
    if (res.error) {
      showError(res.error);
      return;
    }
    await loadHackathons();
    notify(res.insertedCount > 0 ? `Imported ${res.insertedCount} hackathon(s) to Supabase.` : 'Initial hackathons already synced.');
  };

  // 4. Projects are managed via Supabase in <ManageProjects />

  // 5. Add Skill with Photo & Video (Supabase)
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Programming Languages' as SkillItem['category'],
    status: 'Practising' as SkillStatus,
    description: '',
    keyTopics: '',
    imageUrl: '',
    videoUrl: '',
  });

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    setSavingSkill(true);
    setErrorBanner(null);
    const res = await createSkill({
      name: newSkill.name,
      category: newSkill.category,
      status: newSkill.status,
      description: newSkill.description,
      keyTopics: newSkill.keyTopics.split(',').map((t) => t.trim()).filter(Boolean),
      imageUrl: newSkill.imageUrl || undefined,
      videoUrl: newSkill.videoUrl || undefined,
    });
    setSavingSkill(false);

    if (res.error || !res.data) {
      if (res.tableMissing) setSkillsTableMissing(true);
      showError(res.error || 'Failed to save skill to Supabase.');
      return;
    }

    setSkills((prev) => [...prev, res.data!]);
    setNewSkill({
      name: '',
      category: 'Programming Languages',
      status: 'Practising',
      description: '',
      keyTopics: '',
      imageUrl: '',
      videoUrl: '',
    });
    notify(`Skill "${res.data.name}" saved to Supabase.`);
  };

  const handleDeleteSkill = async (id: string) => {
    const res = await deleteSkill(id);
    if (!res.success) {
      showError(res.error || 'Failed to delete skill.');
      return;
    }
    setSkills((prev) => prev.filter((s) => s.id !== id));
    notify('Skill removed from Supabase.');
  };

  const handleSeedSkills = async () => {
    setSeedingTab('skills');
    const res = await seedInitialSkills(skills);
    setSeedingTab(null);
    if (res.error) {
      showError(res.error);
      return;
    }
    await loadSkills();
    notify(res.insertedCount > 0 ? `Imported ${res.insertedCount} skills to Supabase.` : 'Initial skills already synced.');
  };

  // 6. Supabase Admin Password Update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPw.length < 6) {
      notify('New password must have at least 6 characters.');
      return;
    }

    if (newPw !== confirmNewPw) {
      notify('New password and confirmation do not match.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPw.trim(),
      });

      if (error) {
        notify(`Failed to update password: ${error.message}`);
        return;
      }

      setNewPw('');
      setConfirmNewPw('');
      notify('Supabase administrator password successfully updated!');
    } catch (err: any) {
      notify(err?.message || 'Password update failed.');
    }
  };

  const supabaseSqlSchema = FULL_SUPABASE_SQL_SCHEMA;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-1">
            <Shield className="w-4 h-4 text-[#7C5CFC]" />
            <span>Authorized Administrator Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Admin <span className="text-gradient">Console</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:text-white"
          >
            View Portfolio
          </button>
          <button
            onClick={async () => {
              await authSignOut();
              onLogout();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/50 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="mb-6 p-3.5 rounded-xl bg-purple-950/80 border border-purple-700/60 text-xs text-purple-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00D4FF] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {errorBanner && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-950/70 border border-amber-700/60 text-xs text-amber-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-amber-300 hover:text-white text-[11px] font-mono shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto mb-8">
        {[
          { id: 'blog', label: `Blog (${blogPosts.length})`, icon: BookOpen },
          { id: 'certificates', label: `Certificates (${certificates.length})`, icon: Award },
          { id: 'hackathons', label: `Hackathons (${hackathons.length})`, icon: Trophy },
          { id: 'projects', label: 'Projects (Supabase)', icon: FolderGit2 },
          { id: 'skills', label: `Skills (${skills.length})`, icon: Terminal },
          { id: 'messages', label: `Inquiries (${messages.length})`, icon: MessageSquare },
          { id: 'stats', label: 'Coding Stats', icon: BarChart3 },
          { id: 'security', label: 'Security & Auth', icon: KeyRound },
          { id: 'schema', label: 'Supabase SQL', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6366F1] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Blog & Updates */}
      {activeTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 h-fit">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00D4FF]" />
              <span>Create Blog / LinkedIn Post</span>
            </h3>

            <form onSubmit={handleAddBlogPost} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecting Data Pipelines for AgriSaarthi"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Post Body</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share engineering discoveries, hackathon reflections, code insights..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="AI, Machine Learning, Python"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              {/* Photo Upload / URL */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[11px] font-mono text-[#00D4FF]">
                  Attach Post Picture / Diagram
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileToBase64(e.target.files[0], (b64) => setNewPost({ ...newPost, imageUrl: b64 }));
                      }
                    }}
                    className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-white"
                  />
                </div>
                <input
                  type="url"
                  placeholder="Or paste direct image URL..."
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
                {newPost.imageUrl && (
                  <div className="w-full aspect-video max-h-[140px] rounded-lg overflow-hidden border border-slate-800">
                    <img src={newPost.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>Video Link (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... or loom.com/..."
                  value={newPost.videoUrl}
                  onChange={(e) => setNewPost({ ...newPost, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">LinkedIn Post URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/posts/..."
                  value={newPost.linkedInPostUrl}
                  onChange={(e) => setNewPost({ ...newPost, linkedInPostUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={savingBlog}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {savingBlog && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{savingBlog ? 'Publishing to Supabase...' : 'Publish Post to Supabase'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-white">Live Blog Posts ({blogPosts.length})</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSeedBlog}
                  disabled={seedingTab === 'blog'}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-medium text-[#00D4FF] hover:text-white disabled:opacity-50"
                >
                  {seedingTab === 'blog' ? 'Importing...' : 'Import Default Posts'}
                </button>
                <button
                  type="button"
                  onClick={loadBlog}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  title="Refresh from Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBlog ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loadingBlog ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading posts from Supabase...</div>
            ) : blogPosts.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-300">No blog posts in Supabase yet.</p>
                <p className="text-[11px] text-slate-400">
                  Publish a new post on the left or click &quot;Import Default Posts&quot; to sync starter articles across Mobile &amp; PC.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {blogPosts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-[#00D4FF] block mb-1">
                        {p.date} · {p.readTime}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">{p.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(p.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Certificates Management with Photo & Video */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 h-fit">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#00D4FF]" />
              <span>Upload Certificate & Credentials</span>
            </h3>

            <form onSubmit={handleAddCertificate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Certificate Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python for Data Science"
                  value={newCert.title}
                  onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Issuing Authority / College</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Eshwar College / HackerRank"
                  value={newCert.issuingOrganization}
                  onChange={(e) => setNewCert({ ...newCert, issuingOrganization: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Completion Date</label>
                  <input
                    type="text"
                    value={newCert.completionDate}
                    onChange={(e) => setNewCert({ ...newCert, completionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
                  <select
                    value={newCert.category}
                    onChange={(e) => setNewCert({ ...newCert, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="Academics">Academics</option>
                    <option value="Programming">Programming</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Hackathons">Hackathons</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload for Certificate */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[11px] font-mono text-[#00D4FF]">
                  Upload Certificate Photo / Document
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileToBase64(e.target.files[0], (b64) => setNewCert({ ...newCert, imageUrl: b64 }));
                    }
                  }}
                  className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-white"
                />
                <input
                  type="url"
                  placeholder="Or paste image/scan URL..."
                  value={newCert.imageUrl}
                  onChange={(e) => setNewCert({ ...newCert, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
                {newCert.imageUrl && (
                  <div className="w-full aspect-[4/3] max-h-[140px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    <img src={newCert.imageUrl} alt="Certificate preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Video Walkthrough URL */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>Video Walkthrough / Verification Link (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... or loom.com/..."
                  value={newCert.videoUrl}
                  onChange={(e) => setNewCert({ ...newCert, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Official Verification URL</label>
                <input
                  type="url"
                  placeholder="https://... verify on issuer portal"
                  value={newCert.credentialUrl}
                  onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={savingCert}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {savingCert && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{savingCert ? 'Saving to Supabase...' : 'Save Certificate to Supabase'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-white">Uploaded Certificates ({certificates.length})</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSeedCertificates}
                  disabled={seedingTab === 'certificates'}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-medium text-[#00D4FF] hover:text-white disabled:opacity-50"
                >
                  {seedingTab === 'certificates' ? 'Importing...' : 'Import Starter Record'}
                </button>
                <button
                  type="button"
                  onClick={loadCertificates}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  title="Refresh from Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCerts ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loadingCerts ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading certificates from Supabase...</div>
            ) : certificates.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-300">No certificates in Supabase yet.</p>
                <p className="text-[11px] text-slate-400">
                  Upload a certificate on the left so it syncs across Mobile &amp; PC.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {certificates.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-[#00D4FF] block mb-1">
                        {c.category} · {c.completionDate}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">{c.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{c.issuingOrganization}</p>
                      {c.imageUrl && (
                        <span className="inline-block mt-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                          Photo Attached
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCertificate(c.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                      title="Delete certificate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Hackathons Management with Photo & Video */}
      {activeTab === 'hackathons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 h-fit">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00D4FF]" />
              <span>Add Hackathon / Competition</span>
            </h3>

            <form onSubmit={handleAddHackathon} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Agent Hackathon 2026"
                  value={newHackathon.name}
                  onChange={(e) => setNewHackathon({ ...newHackathon, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Date</label>
                  <input
                    type="text"
                    value={newHackathon.date}
                    onChange={(e) => setNewHackathon({ ...newHackathon, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Status</label>
                  <input
                    type="text"
                    value={newHackathon.participationStatus}
                    onChange={(e) => setNewHackathon({ ...newHackathon, participationStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Your Role</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Developer & AI Researcher"
                  value={newHackathon.role}
                  onChange={(e) => setNewHackathon({ ...newHackathon, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Event Overview & Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief summary of the challenge and problem statement..."
                  value={newHackathon.description}
                  onChange={(e) => setNewHackathon({ ...newHackathon, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Prototype Details</label>
                <textarea
                  rows={2}
                  placeholder="What solution did your team build?..."
                  value={newHackathon.projectDetails}
                  onChange={(e) => setNewHackathon({ ...newHackathon, projectDetails: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              {/* Hackathon Photo Upload */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[11px] font-mono text-[#00D4FF]">
                  Upload Hackathon / Stage Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileToBase64(e.target.files[0], (b64) => setNewHackathon({ ...newHackathon, imageUrl: b64 }));
                    }
                  }}
                  className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-white"
                />
                <input
                  type="url"
                  placeholder="Or paste event image link..."
                  value={newHackathon.imageUrl}
                  onChange={(e) => setNewHackathon({ ...newHackathon, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
                {newHackathon.imageUrl && (
                  <div className="w-full aspect-video max-h-[140px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    <img src={newHackathon.imageUrl} alt="Hackathon preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Hackathon Video Demo */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>Demo Video / Presentation Link (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... or loom.com/..."
                  value={newHackathon.videoUrl}
                  onChange={(e) => setNewHackathon({ ...newHackathon, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Result or Presentation Milestone</label>
                <input
                  type="text"
                  placeholder="e.g. Working prototype submission and live jury demonstration"
                  value={newHackathon.result}
                  onChange={(e) => setNewHackathon({ ...newHackathon, result: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={savingHackathon}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {savingHackathon && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{savingHackathon ? 'Saving to Supabase...' : 'Save Hackathon to Supabase'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-white">Hackathon Events ({hackathons.length})</h3>
              <div className="flex items-center gap-2">
                {!hackathonsTableMissing && (
                  <button
                    type="button"
                    onClick={handleSeedHackathons}
                    disabled={seedingTab === 'hackathons'}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-medium text-[#00D4FF] hover:text-white disabled:opacity-50"
                  >
                    {seedingTab === 'hackathons' ? 'Importing...' : 'Import Starter Hackathons'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={loadHackathons}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  title="Refresh from Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHackathons ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {hackathonsTableMissing && (
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs text-amber-200 space-y-2">
                <p className="font-semibold">Supabase Table Setup Required: public.hackathons</p>
                <p className="text-amber-200/80">
                  Run the SQL script from the &quot;Supabase SQL&quot; tab in your Supabase SQL Editor so hackathons sync across Mobile &amp; PC.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('schema')}
                  className="px-3 py-1 rounded bg-amber-900/70 hover:bg-amber-800 text-white text-[11px] font-medium"
                >
                  Open Supabase SQL Tab →
                </button>
              </div>
            )}

            {loadingHackathons ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading hackathons from Supabase...</div>
            ) : !hackathonsTableMissing && hackathons.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-300">No hackathons in Supabase yet.</p>
                <p className="text-[11px] text-slate-400">
                  Add one on the left or click &quot;Import Starter Hackathons&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {hackathons.map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-[#00D4FF] block mb-1">
                        {h.date} · {h.role}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">{h.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{h.description}</p>
                      {h.imageUrl && (
                        <span className="inline-block mt-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900">
                          Event Photo Attached
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteHackathon(h.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                      title="Delete hackathon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Projects & Media (Supabase public.projects) */}
      {activeTab === 'projects' && <ManageProjects onNotify={notify} />}

      {/* TAB 5: Skills with Badge Photo & Video */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 h-fit">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00D4FF]" />
              <span>Register New Skill</span>
            </h3>

            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scikit-Learn"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="Programming Languages">Programming Languages</option>
                  <option value="Web Technologies">Web Technologies</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Tools & Platforms">Tools & Platforms</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Status</label>
                <select
                  value={newSkill.status}
                  onChange={(e) => setNewSkill({ ...newSkill, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="Practising">Practising</option>
                  <option value="Learning">Learning</option>
                  <option value="Exploring">Exploring</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Focus areas and application scope..."
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              {/* Skill Badge Photo */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[11px] font-mono text-[#00D4FF]">
                  Upload Skill Icon / Badge Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileToBase64(e.target.files[0], (b64) => setNewSkill({ ...newSkill, imageUrl: b64 }));
                    }
                  }}
                  className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-white"
                />
                <input
                  type="url"
                  placeholder="Or paste badge image URL..."
                  value={newSkill.imageUrl}
                  onChange={(e) => setNewSkill({ ...newSkill, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
                {newSkill.imageUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={newSkill.imageUrl} alt="Skill icon preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Skill Demo Video */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>Demo Video / Code Walkthrough Link (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... or loom.com/..."
                  value={newSkill.videoUrl}
                  onChange={(e) => setNewSkill({ ...newSkill, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Key Topics (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Regression, Feature Scaling, Metrics"
                  value={newSkill.keyTopics}
                  onChange={(e) => setNewSkill({ ...newSkill, keyTopics: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={savingSkill}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {savingSkill && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{savingSkill ? 'Saving to Supabase...' : 'Save Skill to Supabase'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-white">Current Skills ({skills.length})</h3>
              <div className="flex items-center gap-2">
                {!skillsTableMissing && (
                  <button
                    type="button"
                    onClick={handleSeedSkills}
                    disabled={seedingTab === 'skills'}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-medium text-[#00D4FF] hover:text-white disabled:opacity-50"
                  >
                    {seedingTab === 'skills' ? 'Importing...' : 'Import Starter Skills'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={loadSkills}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  title="Refresh from Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSkills ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {skillsTableMissing && (
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs text-amber-200 space-y-2">
                <p className="font-semibold">Supabase Table Setup Required: public.skills</p>
                <p className="text-amber-200/80">
                  Run the SQL script from the &quot;Supabase SQL&quot; tab in your Supabase SQL Editor so skills sync across Mobile &amp; PC.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('schema')}
                  className="px-3 py-1 rounded bg-amber-900/70 hover:bg-amber-800 text-white text-[11px] font-medium"
                >
                  Open Supabase SQL Tab →
                </button>
              </div>
            )}

            {loadingSkills ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading skills from Supabase...</div>
            ) : !skillsTableMissing && skills.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-300">No skills in Supabase yet.</p>
                <p className="text-[11px] text-slate-400">
                  Add a skill on the left or click &quot;Import Starter Skills&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {skills.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#00D4FF]">
                        <span>{s.category}</span>
                        <span>·</span>
                        <span className="text-purple-300 font-semibold">{s.status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-0.5">{s.name}</h4>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(s.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                      title="Delete skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Contact Submissions</h3>
            <button onClick={loadMessages} className="text-xs text-[#00D4FF] hover:underline">
              Refresh inbox
            </button>
          </div>

          {loadingMessages ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading inquiries...</div>
          ) : messages.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {messages.map((m, idx) => (
                <div key={m.id || idx} className="glass-panel rounded-xl p-5 border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 font-mono">
                    <span className="font-semibold text-white text-sm">{m.name}</span>
                    <span>{m.email}</span>
                    <span>{m.created_at ? new Date(m.created_at).toLocaleString() : 'Recent'}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                    {m.subject}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {m.message}
                  </p>
                  <div className="pt-2">
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                      className="text-xs text-[#00D4FF] hover:underline font-medium"
                    >
                      Reply to {m.name} via Email →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-panel rounded-xl border border-slate-800 text-slate-400 text-xs">
              No messages received yet. Messages sent via the Contact page will be listed here.
            </div>
          )}
        </div>
      )}

      {/* TAB 7: Coding Stats (Supabase) */}
      {activeTab === 'stats' && (
        <div className="max-w-xl glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Configure Public Coding Metrics</h3>
            <p className="text-xs text-slate-400">
              Update genuine verified milestones in Supabase to sync across the Developer Dashboard on all devices.
            </p>
          </div>

          {statsTableMissing && (
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs text-amber-200 space-y-2">
              <p className="font-semibold">Supabase Table Setup Required: public.coding_stats</p>
              <p className="text-amber-200/80">
                Run the SQL script from the &quot;Supabase SQL&quot; tab in your Supabase SQL Editor first.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('schema')}
                className="px-3 py-1 rounded bg-amber-900/70 hover:bg-amber-800 text-white text-[11px] font-medium"
              >
                Open Supabase SQL Tab →
              </button>
            </div>
          )}

          {loadingStats ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading coding stats from Supabase...</div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingStats(true);
                const res = await saveCodingStats(stats);
                setSavingStats(false);
                if (res.error) {
                  if (res.tableMissing) setStatsTableMissing(true);
                  showError(res.error);
                  return;
                }
                if (res.data) setStats(res.data);
                notify('Coding statistics saved to Supabase across all devices.');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  LeetCode Problems Solved (Tracked)
                </label>
                <input
                  type="text"
                  value={stats.leetcode_solved || ''}
                  onChange={(e) => setStats({ ...stats, leetcode_solved: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  CodeChef Rating / Division
                </label>
                <input
                  type="text"
                  value={stats.codechef_rating || ''}
                  onChange={(e) => setStats({ ...stats, codechef_rating: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  HackerRank Badges / Certifications
                </label>
                <input
                  type="text"
                  value={stats.hackerrank_badges || ''}
                  onChange={(e) => setStats({ ...stats, hackerrank_badges: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Kaggle Tier
                </label>
                <input
                  type="text"
                  value={stats.kaggle_tier || ''}
                  onChange={(e) => setStats({ ...stats, kaggle_tier: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={savingStats}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] disabled:opacity-60"
              >
                {savingStats ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savingStats ? 'Saving to Supabase...' : 'Save Dashboard Statistics'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 8: Security & Authentication */}
      {activeTab === 'security' && (
        <div className="max-w-2xl space-y-6">
          {/* Authenticated Identity Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-700/50 flex items-center justify-center text-[#00D4FF]">
                  <Shield className="w-5 h-5 text-[#7C5CFC]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Authenticated Supabase Admin</h3>
                  <p className="text-xs text-slate-400">Database Role Verified via public.admin_users</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-xs font-mono text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Administrator Email</span>
                <span className="text-white font-medium break-all">{user?.email || 'adithyanadhi2998@gmail.com'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Database Authorization</span>
                <span className="text-cyan-400 font-medium">public.admin_users (RLS Enforced)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 sm:col-span-2">
                <span className="text-slate-400 block mb-1">Supabase User UUID (auth.users)</span>
                <span className="text-purple-300 font-mono text-[11px] select-all break-all">{user?.id || 'Loaded from Supabase Auth'}</span>
              </div>
            </div>
          </div>

          {/* Change Supabase Auth Password Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#00D4FF]" />
              <span>Update Supabase Admin Password</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Securely updates your Supabase Authentication credentials via supabase.auth.updateUser().
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  New Password (minimum 6 characters)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new strong password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmNewPw}
                  onChange={(e) => setConfirmNewPw(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] hover:opacity-95 transition-opacity cursor-pointer"
              >
                Update Supabase Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 9: Supabase SQL Setup */}
      {activeTab === 'schema' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Supabase PostgreSQL Schema Setup
              </h3>
              <p className="text-xs text-slate-400">
                Execute this SQL in your Supabase Project dashboard (SQL Editor) to configure tables and Row Level Security.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(supabaseSqlSchema);
                notify('SQL script copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
            >
              <Copy className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Copy SQL</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto">
            {supabaseSqlSchema}
          </pre>
        </div>
      )}
    </div>
  );
};
