import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Save,
  BarChart3,
  BookOpen,
  Video,
  Image as ImageIcon,
  KeyRound,
  Upload,
  Calendar,
  Users
} from 'lucide-react';
import { fetchContactMessages, ContactMessage, supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { initialProjects, Project } from '../data/projects';
import { initialSkills, SkillItem, SkillStatus } from '../data/skills';
import { initialHackathons, HackathonEvent } from '../data/hackathons';
import { initialCertificates, Certificate } from '../data/certificates';
import { initialBlogPosts, BlogPost } from '../data/blog';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (pageId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onNavigate }) => {
  const { user, signOut: authSignOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'blog' | 'certificates' | 'hackathons' | 'projects' | 'skills' | 'messages' | 'stats' | 'security' | 'schema'
  >('blog');

  // Helper to convert any selected file to Base64 image
  const handleFileToBase64 = (file: File, callback: (base64: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Blog posts state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('adithyan_custom_blog_posts');
    return saved ? JSON.parse(saved) : initialBlogPosts;
  });

  // Certificates state
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('adithyan_custom_certificates');
    return saved ? JSON.parse(saved) : initialCertificates;
  });

  // Hackathons state
  const [hackathons, setHackathons] = useState<HackathonEvent[]>(() => {
    const saved = localStorage.getItem('adithyan_custom_hackathons');
    return saved ? JSON.parse(saved) : initialHackathons;
  });

  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('adithyan_custom_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  // Skills state
  const [skills, setSkills] = useState<SkillItem[]>(() => {
    const saved = localStorage.getItem('adithyan_custom_skills');
    return saved ? JSON.parse(saved) : initialSkills;
  });

  // Coding stats state
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('adithyan_custom_coding_metrics');
    return saved
      ? JSON.parse(saved)
      : {
          leetcode_solved: '75+',
          codechef_rating: '1420 (Division 3)',
          hackerrank_badges: 'Problem Solving & C++',
          kaggle_tier: 'Active Contributor',
        };
  });

  // Password management state
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await fetchContactMessages();
      setMessages(data);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 1. Add Blog Post
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: 'AI, Machine Learning, Engineering',
    imageUrl: '',
    videoUrl: '',
    linkedInPostUrl: '',
  });

  const handleAddBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post: BlogPost = {
      id: 'blog_' + Date.now(),
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      author: {
        name: 'Adithyan',
        role: 'AI & Data Science Student · Sri Eshwar College',
        avatarText: 'A',
      },
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      readTime: '3 min read',
      tags: newPost.tags.split(',').map((t) => t.trim()).filter(Boolean),
      imageUrl: newPost.imageUrl.trim() || undefined,
      videoUrl: newPost.videoUrl.trim() || undefined,
      likes: 0,
      linkedInPostUrl: newPost.linkedInPostUrl.trim() || undefined,
    };

    const updated = [post, ...blogPosts];
    setBlogPosts(updated);
    localStorage.setItem('adithyan_custom_blog_posts', JSON.stringify(updated));
    setNewPost({
      title: '',
      content: '',
      tags: 'AI, Machine Learning, Engineering',
      imageUrl: '',
      videoUrl: '',
      linkedInPostUrl: '',
    });
    notify(`Published new post: "${post.title}"`);
  };

  const handleDeletePost = (id: string) => {
    const updated = blogPosts.filter((p) => p.id !== id);
    setBlogPosts(updated);
    localStorage.setItem('adithyan_custom_blog_posts', JSON.stringify(updated));
    notify('Blog post removed.');
  };

  // 2. Add Certificate with Photo & Video
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

  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.title.trim() || !newCert.issuingOrganization.trim()) return;

    const cert: Certificate = {
      id: 'cert_' + Date.now(),
      title: newCert.title.trim(),
      issuingOrganization: newCert.issuingOrganization.trim(),
      completionDate: newCert.completionDate.trim(),
      description: newCert.description.trim() || 'Verified course completion and accredited skill verification.',
      credentialUrl: newCert.credentialUrl.trim() || undefined,
      imageUrl: newCert.imageUrl.trim() || undefined,
      videoUrl: newCert.videoUrl.trim() || undefined,
      category: newCert.category,
    };

    const updated = [cert, ...certificates];
    setCertificates(updated);
    localStorage.setItem('adithyan_custom_certificates', JSON.stringify(updated));
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
    notify(`Certificate "${cert.title}" uploaded.`);
  };

  const handleDeleteCertificate = (id: string) => {
    const updated = certificates.filter((c) => c.id !== id);
    setCertificates(updated);
    localStorage.setItem('adithyan_custom_certificates', JSON.stringify(updated));
    notify('Certificate deleted.');
  };

  // 3. Add Hackathon with Photo & Video
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

  const handleAddHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHackathon.name.trim()) return;

    const eventItem: HackathonEvent = {
      id: 'hack_' + Date.now(),
      name: newHackathon.name.trim(),
      description: newHackathon.description.trim(),
      date: newHackathon.date.trim(),
      participationStatus: newHackathon.participationStatus.trim(),
      role: newHackathon.role.trim(),
      teamMembers: newHackathon.teamMembers.split(',').map((t) => t.trim()).filter(Boolean),
      technologiesUsed: newHackathon.technologiesUsed.split(',').map((t) => t.trim()).filter(Boolean),
      projectDetails: newHackathon.projectDetails.trim() || 'Prototyped full-stack engineering solution.',
      keyLearnings: newHackathon.keyLearnings.split(',').map((l) => l.trim()).filter(Boolean),
      result: newHackathon.result.trim() || undefined,
      imageUrl: newHackathon.imageUrl.trim() || undefined,
      videoUrl: newHackathon.videoUrl.trim() || undefined,
    };

    const updated = [eventItem, ...hackathons];
    setHackathons(updated);
    localStorage.setItem('adithyan_custom_hackathons', JSON.stringify(updated));
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
    notify(`Hackathon "${eventItem.name}" recorded.`);
  };

  const handleDeleteHackathon = (id: string) => {
    const updated = hackathons.filter((h) => h.id !== id);
    setHackathons(updated);
    localStorage.setItem('adithyan_custom_hackathons', JSON.stringify(updated));
    notify('Hackathon removed.');
  };

  // 4. Add Project with Photo & Video
  const [newProject, setNewProject] = useState({
    name: '',
    category: 'AI / Machine Learning' as const,
    shortDescription: '',
    detailedDescription: '',
    technologies: '',
    status: 'In Development' as const,
    githubUrl: '',
    liveDemoUrl: '',
    videoUrl: '',
    image: '',
  });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const proj: Project = {
      id: 'proj_' + Date.now(),
      name: newProject.name.trim(),
      category: newProject.category,
      shortDescription: newProject.shortDescription.trim(),
      detailedDescription: newProject.detailedDescription.trim() || newProject.shortDescription.trim(),
      technologies: newProject.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      status: newProject.status,
      githubUrl: newProject.githubUrl.trim() || undefined,
      liveDemoUrl: newProject.liveDemoUrl.trim() || undefined,
      image: newProject.image.trim() || undefined,
      videoUrl: newProject.videoUrl.trim() || undefined,
      features: ['Integrated technical algorithms', 'Modular architecture'],
      architectureOverview: 'Engineered with clean component hierarchy and optimal execution pathways.',
    };

    const updated = [proj, ...projects];
    setProjects(updated);
    localStorage.setItem('adithyan_custom_projects', JSON.stringify(updated));
    setNewProject({
      name: '',
      category: 'AI / Machine Learning',
      shortDescription: '',
      detailedDescription: '',
      technologies: '',
      status: 'In Development',
      githubUrl: '',
      liveDemoUrl: '',
      videoUrl: '',
      image: '',
    });
    notify(`Project "${proj.name}" added successfully.`);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem('adithyan_custom_projects', JSON.stringify(updated));
    notify('Project deleted.');
  };

  // 5. Add Skill with Photo & Video
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Programming Languages' as const,
    status: 'Practising' as SkillStatus,
    description: '',
    keyTopics: '',
    imageUrl: '',
    videoUrl: '',
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    const item: SkillItem = {
      id: 'skill_' + Date.now(),
      name: newSkill.name.trim(),
      category: newSkill.category,
      status: newSkill.status,
      description: newSkill.description.trim(),
      keyTopics: newSkill.keyTopics.split(',').map((t) => t.trim()).filter(Boolean),
      imageUrl: newSkill.imageUrl.trim() || undefined,
      videoUrl: newSkill.videoUrl.trim() || undefined,
    };

    const updated = [...skills, item];
    setSkills(updated);
    localStorage.setItem('adithyan_custom_skills', JSON.stringify(updated));
    setNewSkill({
      name: '',
      category: 'Programming Languages',
      status: 'Practising',
      description: '',
      keyTopics: '',
      imageUrl: '',
      videoUrl: '',
    });
    notify(`Skill "${item.name}" registered.`);
  };

  const handleDeleteSkill = (id: string) => {
    const updated = skills.filter((s) => s.id !== id);
    setSkills(updated);
    localStorage.setItem('adithyan_custom_skills', JSON.stringify(updated));
    notify('Skill removed.');
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

  // Supabase PostgreSQL Schema & Security Policies
  const supabaseSqlSchema = `-- Execute this SQL script in your Supabase Project (SQL Editor):

-- 1. Administrator Membership Table (REQUIRED FOR ADMIN ACCESS)
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Blog & Engineering Dispatches Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'AI & Systems',
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    video_url TEXT,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Certificates & Accreditations Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    completion_date TEXT,
    description TEXT,
    credential_url TEXT,
    image_url TEXT,
    video_url TEXT,
    category TEXT DEFAULT 'Academics',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- admin_users: Only authenticated users can view their own membership status
CREATE POLICY "Admins can view their own membership"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- contact_messages: Public can submit inquiries; only verified admins can view them
CREATE POLICY "Allow public inquiries insert"
    ON public.contact_messages
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow admin to read inquiries"
    ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- blog_posts: Public can read; only verified admins can publish or modify
CREATE POLICY "Allow public read blog posts"
    ON public.blog_posts
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow admin to manage blog posts"
    ON public.blog_posts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- certificates: Public can read; only verified admins can upload or edit
CREATE POLICY "Allow public read certificates"
    ON public.certificates
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow admin to manage certificates"
    ON public.certificates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- 7. Grant Admin Role to Your Supabase User Account:
-- Replace 'YOUR_USER_ID_UUID_HERE' with your auth.users UUID from Supabase Authentication:
-- INSERT INTO public.admin_users (user_id) VALUES ('YOUR_USER_ID_UUID_HERE') ON CONFLICT DO NOTHING;
`;

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
          <CheckCircle2 className="w-4 h-4 text-[#00D4FF]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto mb-8">
        {[
          { id: 'blog', label: `Blog (${blogPosts.length})`, icon: BookOpen },
          { id: 'certificates', label: `Certificates (${certificates.length})`, icon: Award },
          { id: 'hackathons', label: `Hackathons (${hackathons.length})`, icon: Trophy },
          { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
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
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
              >
                Publish Post
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-bold text-white mb-2">Live Blog Posts ({blogPosts.length})</h3>
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
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
              >
                Save Certificate & Media
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-bold text-white mb-2">Uploaded Certificates ({certificates.length})</h3>
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
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
              >
                Record Hackathon Experience
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-bold text-white mb-2">Hackathon Events ({hackathons.length})</h3>
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
          </div>
        </div>
      )}

      {/* TAB 4: Projects & Media */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 h-fit">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00D4FF]" />
              <span>Add Project & Video Demonstration</span>
            </h3>

            <form onSubmit={handleAddProject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neural Vision Scanner"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="AI / Machine Learning">AI / Machine Learning</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Hardware / IoT">Hardware / IoT</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  required
                  placeholder="One sentence description..."
                  value={newProject.shortDescription}
                  onChange={(e) => setNewProject({ ...newProject, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Technologies (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Python, PyTorch, React, OpenCV"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              {/* Project Picture Upload */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[11px] font-mono text-[#00D4FF] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload Project Banner Picture</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileToBase64(e.target.files[0], (b64) => setNewProject({ ...newProject, image: b64 }));
                    }
                  }}
                  className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-white"
                />
                <input
                  type="url"
                  placeholder="Or paste image link..."
                  value={newProject.image}
                  onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
                {newProject.image && (
                  <div className="w-full aspect-video max-h-[140px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={newProject.image} alt="Project banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Video Demo Link */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>Video Demo URL / Embed (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... or loom.com/..."
                  value={newProject.videoUrl}
                  onChange={(e) => setNewProject({ ...newProject, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">GitHub URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/Adithyan49/..."
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
              >
                Publish Project & Media
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-bold text-white mb-2">Projects in Portfolio ({projects.length})</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-[#00D4FF] block mb-0.5">
                      {p.category} · {p.status}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{p.shortDescription}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
              >
                Save Skill
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-bold text-white mb-2">Current Skills ({skills.length})</h3>
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

      {/* TAB 7: Coding Stats */}
      {activeTab === 'stats' && (
        <div className="max-w-xl glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-2">Configure Public Coding Metrics</h3>
          <p className="text-xs text-slate-400 mb-6">
            Update genuine verified milestones to display on the Developer Dashboard.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem('adithyan_custom_coding_metrics', JSON.stringify(stats));
              notify('Coding statistics updated across dashboard.');
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

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Dashboard Statistics</span>
            </button>
          </form>
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
