import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { BlogPost, initialBlogPosts } from '../data/blog';
import { Certificate, initialCertificates } from '../data/certificates';
import { HackathonEvent, initialHackathons } from '../data/hackathons';
import { SkillItem, SkillStatus, initialSkills } from '../data/skills';

export interface CodingStats {
  leetcode_solved: string;
  codechef_rating: string;
  hackerrank_badges: string;
  kaggle_tier: string;
}

export const DEFAULT_CODING_STATS: CodingStats = {
  leetcode_solved: '75+',
  codechef_rating: '1420 (Division 3)',
  hackerrank_badges: 'Problem Solving & C++',
  kaggle_tier: 'Active Contributor',
};

export interface FetchResult<T> {
  data: T;
  fromSupabase: boolean;
  tableMissing: boolean;
  error: string | null;
}

export interface MutationResult<T = unknown> {
  data: T | null;
  error: string | null;
  tableMissing?: boolean;
  schemaNotice?: string | null;
}

/**
 * Compresses an uploaded image File into a compact Data URL so camera/mobile photos
 * save quickly and reliably in Supabase and sync smoothly across Mobile and PC.
 */
export function fileToCompressedDataUrl(
  file: File,
  maxDimension = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }

    // Preserve lightweight SVGs or small images directly
    if (file.type === 'image/svg+xml' || file.size <= 160 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

function isMissingTableError(error: { code?: string; message?: string; status?: number } | null): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    error.status === 404 ||
    msg.includes('could not find the table') ||
    msg.includes('does not exist')
  );
}

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'PGRST204' ||
    code === '42703' ||
    msg.includes('could not find the') ||
    (msg.includes('column') && msg.includes('schema cache'))
  );
}

function formatSupabaseError(error: { code?: string; message?: string } | null, fallback: string): string {
  if (!error?.message) return fallback;
  const msg = error.message;
  if (msg.toLowerCase().includes('row-level security')) {
    return `${msg} — Please ensure your user is in public.admin_users and RLS policies are applied (see Supabase SQL tab).`;
  }
  return msg;
}

function formatMonthYear(iso?: string | null): string {
  if (!iso) {
    return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min read`;
}

// ============================================================================
// 1. BLOG POSTS (public.blog_posts)
// ============================================================================

function mapDbRowToBlogPost(row: any): BlogPost {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    content: String(row.content || ''),
    author: {
      name: 'Adithyan',
      role: 'AI & Data Science Student · Sri Eshwar College',
      avatarText: 'A',
    },
    date: row.post_date || formatMonthYear(row.created_at),
    readTime: row.read_time || estimateReadTime(String(row.content || '')),
    tags: Array.isArray(row.tags) ? row.tags : [],
    imageUrl: row.image_url || undefined,
    videoUrl: row.video_url || undefined,
    likes: typeof row.likes === 'number' ? row.likes : 0,
    linkedInPostUrl: row.linked_in_post_url || undefined,
  };
}

export async function fetchBlogPosts(): Promise<FetchResult<BlogPost[]>> {
  if (!isSupabaseConfigured) {
    return { data: initialBlogPosts, fromSupabase: false, tableMissing: false, error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return { data: initialBlogPosts, fromSupabase: false, tableMissing: true, error: null };
      }
      return { data: [], fromSupabase: false, tableMissing: false, error: error.message };
    }

    return {
      data: (data ?? []).map(mapDbRowToBlogPost),
      fromSupabase: true,
      tableMissing: false,
      error: null,
    };
  } catch (err: any) {
    return { data: [], fromSupabase: false, tableMissing: false, error: err?.message || 'Unable to load blog posts.' };
  }
}

export interface BlogPostCreateInput {
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  linkedInPostUrl?: string;
  date?: string;
  readTime?: string;
  likes?: number;
}

export async function createBlogPost(input: BlogPostCreateInput, customId?: string): Promise<MutationResult<BlogPost>> {
  const id = customId || `blog_${Date.now()}`;
  const fullPayload = {
    id,
    title: input.title.trim(),
    content: input.content.trim(),
    tags: input.tags.map((t) => t.trim()).filter(Boolean),
    image_url: input.imageUrl?.trim() || null,
    video_url: input.videoUrl?.trim() || null,
    likes: input.likes ?? 0,
    linked_in_post_url: input.linkedInPostUrl?.trim() || null,
    post_date: input.date || formatMonthYear(),
    read_time: input.readTime || estimateReadTime(input.content),
  };

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(fullPayload)
      .select()
      .single();

    if (!error && data) {
      return { data: mapDbRowToBlogPost(data), error: null };
    }

    if (isMissingTableError(error)) {
      return { data: null, error: 'Table public.blog_posts does not exist in Supabase.', tableMissing: true };
    }

    // Fallback to live baseline columns if optional columns (linked_in_post_url, post_date, read_time) are not yet added
    if (isMissingColumnError(error)) {
      const corePayload = {
        id,
        title: fullPayload.title,
        content: fullPayload.content,
        tags: fullPayload.tags,
        image_url: fullPayload.image_url,
        video_url: fullPayload.video_url,
        likes: fullPayload.likes,
      };
      const { data: retryData, error: retryErr } = await supabase
        .from('blog_posts')
        .insert(corePayload)
        .select()
        .single();

      if (!retryErr && retryData) {
        return {
          data: mapDbRowToBlogPost(retryData),
          error: null,
          schemaNotice: input.linkedInPostUrl
            ? 'Post saved to Supabase! Run the SQL script in the Supabase SQL tab to enable saving LinkedIn post URLs across devices.'
            : null,
        };
      }
      return { data: null, error: formatSupabaseError(retryErr, 'Failed to save blog post.') };
    }

    return { data: null, error: formatSupabaseError(error, 'Failed to publish blog post.') };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to save blog post.' };
  }
}

export async function deleteBlogPost(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseError(error, 'Failed to delete blog post.') };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete blog post.' };
  }
}

export async function seedInitialBlogPosts(existing: BlogPost[]): Promise<{ insertedCount: number; error: string | null }> {
  const existingTitles = new Set(existing.map((p) => p.title.trim().toLowerCase()));
  const missing = initialBlogPosts.filter((p) => !existingTitles.has(p.title.trim().toLowerCase()));
  if (missing.length === 0) return { insertedCount: 0, error: null };

  let insertedCount = 0;
  for (const post of missing) {
    const res = await createBlogPost(
      {
        title: post.title,
        content: post.content,
        tags: post.tags,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        linkedInPostUrl: post.linkedInPostUrl,
        date: post.date,
        readTime: post.readTime,
        likes: post.likes,
      },
      post.id
    );
    if (res.error) {
      return { insertedCount, error: res.error };
    }
    insertedCount += 1;
  }
  return { insertedCount, error: null };
}

// ============================================================================
// 2. CERTIFICATES (public.certificates)
// ============================================================================

const VALID_CERT_CATEGORIES: Certificate['category'][] = [
  'Academics',
  'Programming',
  'AI & ML',
  'Hackathons',
];

function mapDbRowToCertificate(row: any): Certificate {
  const rawCat = String(row.category || 'Academics') as Certificate['category'];
  const category = VALID_CERT_CATEGORIES.includes(rawCat) ? rawCat : 'Academics';
  return {
    id: String(row.id),
    title: String(row.title || ''),
    issuingOrganization: String(row.issuing_organization || ''),
    completionDate: String(row.completion_date || ''),
    description: String(row.description || ''),
    credentialUrl: row.credential_url || undefined,
    imageUrl: row.image_url || undefined,
    videoUrl: row.video_url || undefined,
    category,
  };
}

export async function fetchCertificates(): Promise<FetchResult<Certificate[]>> {
  if (!isSupabaseConfigured) {
    return { data: initialCertificates, fromSupabase: false, tableMissing: false, error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return { data: initialCertificates, fromSupabase: false, tableMissing: true, error: null };
      }
      return { data: [], fromSupabase: false, tableMissing: false, error: error.message };
    }

    return {
      data: (data ?? []).map(mapDbRowToCertificate),
      fromSupabase: true,
      tableMissing: false,
      error: null,
    };
  } catch (err: any) {
    return { data: [], fromSupabase: false, tableMissing: false, error: err?.message || 'Unable to load certificates.' };
  }
}

export interface CertificateCreateInput {
  title: string;
  issuingOrganization: string;
  completionDate: string;
  description: string;
  credentialUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  category: Certificate['category'];
}

export async function createCertificate(
  input: CertificateCreateInput,
  customId?: string
): Promise<MutationResult<Certificate>> {
  const id = customId || `cert_${Date.now()}`;
  const fullPayload = {
    id,
    title: input.title.trim(),
    issuing_organization: input.issuingOrganization.trim(),
    completion_date: input.completionDate.trim(),
    description: input.description.trim() || 'Verified course completion and accredited skill verification.',
    credential_url: input.credentialUrl?.trim() || null,
    image_url: input.imageUrl?.trim() || null,
    video_url: input.videoUrl?.trim() || null,
    category: input.category,
  };

  try {
    const { data, error } = await supabase
      .from('certificates')
      .insert(fullPayload)
      .select()
      .single();

    if (!error && data) {
      return { data: mapDbRowToCertificate(data), error: null };
    }

    if (isMissingTableError(error)) {
      return { data: null, error: 'Table public.certificates does not exist in Supabase.', tableMissing: true };
    }

    if (isMissingColumnError(error)) {
      const corePayload = {
        id,
        title: fullPayload.title,
        issuing_organization: fullPayload.issuing_organization,
        completion_date: fullPayload.completion_date,
        description: fullPayload.description,
        credential_url: fullPayload.credential_url,
      };
      const { data: retryData, error: retryErr } = await supabase
        .from('certificates')
        .insert(corePayload)
        .select()
        .single();

      if (!retryErr && retryData) {
        return {
          data: mapDbRowToCertificate(retryData),
          error: null,
          schemaNotice:
            'Core certificate saved, but your Supabase certificates table is missing image_url / video_url / category columns. Run the SQL in the Supabase SQL tab so uploaded photos sync across devices!',
        };
      }
      return { data: null, error: formatSupabaseError(retryErr, 'Failed to save certificate.') };
    }

    return { data: null, error: formatSupabaseError(error, 'Failed to save certificate.') };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to save certificate.' };
  }
}

export async function deleteCertificate(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseError(error, 'Failed to delete certificate.') };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete certificate.' };
  }
}

export async function seedInitialCertificates(
  existing: Certificate[]
): Promise<{ insertedCount: number; error: string | null; schemaNotice?: string | null }> {
  const existingTitles = new Set(existing.map((c) => c.title.trim().toLowerCase()));
  const missing = initialCertificates.filter((c) => !existingTitles.has(c.title.trim().toLowerCase()));
  if (missing.length === 0) return { insertedCount: 0, error: null };

  let insertedCount = 0;
  let lastNotice: string | null = null;
  for (const cert of missing) {
    const res = await createCertificate(
      {
        title: cert.title,
        issuingOrganization: cert.issuingOrganization,
        completionDate: cert.completionDate,
        description: cert.description,
        credentialUrl: cert.credentialUrl,
        imageUrl: cert.imageUrl || cert.fileUrl,
        videoUrl: cert.videoUrl,
        category: cert.category,
      },
      cert.id
    );
    if (res.error) return { insertedCount, error: res.error };
    if (res.schemaNotice) lastNotice = res.schemaNotice;
    insertedCount += 1;
  }
  return { insertedCount, error: null, schemaNotice: lastNotice };
}

// ============================================================================
// 3. HACKATHONS (public.hackathons)
// ============================================================================

function mapDbRowToHackathon(row: any): HackathonEvent {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    description: String(row.description || ''),
    date: String(row.event_date || ''),
    participationStatus: String(row.participation_status || 'Participant'),
    role: String(row.role || ''),
    teamMembers: Array.isArray(row.team_members) ? row.team_members : undefined,
    technologiesUsed: Array.isArray(row.technologies_used) ? row.technologies_used : [],
    projectDetails: String(row.project_details || ''),
    keyLearnings: Array.isArray(row.key_learnings) ? row.key_learnings : [],
    result: row.result || undefined,
    imageUrl: row.image_url || undefined,
    videoUrl: row.video_url || undefined,
  };
}

export async function fetchHackathons(): Promise<FetchResult<HackathonEvent[]>> {
  if (!isSupabaseConfigured) {
    return { data: initialHackathons, fromSupabase: false, tableMissing: false, error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return { data: initialHackathons, fromSupabase: false, tableMissing: true, error: null };
      }
      return { data: [], fromSupabase: false, tableMissing: false, error: error.message };
    }

    return {
      data: (data ?? []).map(mapDbRowToHackathon),
      fromSupabase: true,
      tableMissing: false,
      error: null,
    };
  } catch (err: any) {
    return { data: [], fromSupabase: false, tableMissing: false, error: err?.message || 'Unable to load hackathons.' };
  }
}

export interface HackathonCreateInput {
  name: string;
  description: string;
  date: string;
  participationStatus: string;
  role: string;
  teamMembers: string[];
  technologiesUsed: string[];
  projectDetails: string;
  keyLearnings: string[];
  result?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export async function createHackathon(
  input: HackathonCreateInput,
  customId?: string
): Promise<MutationResult<HackathonEvent>> {
  const id = customId || `hack_${Date.now()}`;
  const payload = {
    id,
    name: input.name.trim(),
    description: input.description.trim(),
    event_date: input.date.trim(),
    participation_status: input.participationStatus.trim(),
    role: input.role.trim(),
    team_members: input.teamMembers.map((m) => m.trim()).filter(Boolean),
    technologies_used: input.technologiesUsed.map((t) => t.trim()).filter(Boolean),
    project_details: input.projectDetails.trim() || 'Prototyped full-stack engineering solution.',
    key_learnings: input.keyLearnings.map((l) => l.trim()).filter(Boolean),
    result: input.result?.trim() || null,
    image_url: input.imageUrl?.trim() || null,
    video_url: input.videoUrl?.trim() || null,
  };

  try {
    const { data, error } = await supabase
      .from('hackathons')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return {
          data: null,
          tableMissing: true,
          error: 'The public.hackathons table has not been created in Supabase yet. Run the script in the Supabase SQL tab first.',
        };
      }
      return { data: null, error: formatSupabaseError(error, 'Failed to save hackathon.') };
    }

    return { data: mapDbRowToHackathon(data), error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to save hackathon.' };
  }
}

export async function deleteHackathon(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('hackathons').delete().eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseError(error, 'Failed to delete hackathon.') };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete hackathon.' };
  }
}

export async function seedInitialHackathons(
  existing: HackathonEvent[]
): Promise<{ insertedCount: number; error: string | null }> {
  const existingNames = new Set(existing.map((h) => h.name.trim().toLowerCase()));
  const missing = initialHackathons.filter((h) => !existingNames.has(h.name.trim().toLowerCase()));
  if (missing.length === 0) return { insertedCount: 0, error: null };

  let insertedCount = 0;
  for (const h of missing) {
    const res = await createHackathon(
      {
        name: h.name,
        description: h.description,
        date: h.date,
        participationStatus: h.participationStatus,
        role: h.role,
        teamMembers: h.teamMembers || [],
        technologiesUsed: h.technologiesUsed,
        projectDetails: h.projectDetails,
        keyLearnings: h.keyLearnings,
        result: h.result,
        imageUrl: h.imageUrl,
        videoUrl: h.videoUrl,
      },
      h.id
    );
    if (res.error) return { insertedCount, error: res.error };
    insertedCount += 1;
  }
  return { insertedCount, error: null };
}

// ============================================================================
// 4. SKILLS (public.skills)
// ============================================================================

const VALID_SKILL_CATEGORIES: SkillItem['category'][] = [
  'Programming Languages',
  'Web Technologies',
  'AI & Machine Learning',
  'Tools & Platforms',
];

const VALID_SKILL_STATUSES: SkillStatus[] = ['Practising', 'Learning', 'Exploring'];

function mapDbRowToSkill(row: any): SkillItem {
  const rawCat = String(row.category || 'Programming Languages') as SkillItem['category'];
  const rawStatus = String(row.status || 'Practising') as SkillStatus;
  return {
    id: String(row.id),
    name: String(row.name || ''),
    category: VALID_SKILL_CATEGORIES.includes(rawCat) ? rawCat : 'Programming Languages',
    status: VALID_SKILL_STATUSES.includes(rawStatus) ? rawStatus : 'Practising',
    description: String(row.description || ''),
    keyTopics: Array.isArray(row.key_topics) ? row.key_topics : [],
    imageUrl: row.image_url || undefined,
    videoUrl: row.video_url || undefined,
  };
}

export async function fetchSkills(): Promise<FetchResult<SkillItem[]>> {
  if (!isSupabaseConfigured) {
    return { data: initialSkills, fromSupabase: false, tableMissing: false, error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return { data: initialSkills, fromSupabase: false, tableMissing: true, error: null };
      }
      return { data: [], fromSupabase: false, tableMissing: false, error: error.message };
    }

    return {
      data: (data ?? []).map(mapDbRowToSkill),
      fromSupabase: true,
      tableMissing: false,
      error: null,
    };
  } catch (err: any) {
    return { data: [], fromSupabase: false, tableMissing: false, error: err?.message || 'Unable to load skills.' };
  }
}

export interface SkillCreateInput {
  name: string;
  category: SkillItem['category'];
  status: SkillStatus;
  description: string;
  keyTopics: string[];
  imageUrl?: string;
  videoUrl?: string;
}

export async function createSkill(
  input: SkillCreateInput,
  customId?: string
): Promise<MutationResult<SkillItem>> {
  const id = customId || `skill_${Date.now()}`;
  const payload = {
    id,
    name: input.name.trim(),
    category: input.category,
    status: input.status,
    description: input.description.trim(),
    key_topics: input.keyTopics.map((t) => t.trim()).filter(Boolean),
    image_url: input.imageUrl?.trim() || null,
    video_url: input.videoUrl?.trim() || null,
  };

  try {
    const { data, error } = await supabase
      .from('skills')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return {
          data: null,
          tableMissing: true,
          error: 'The public.skills table has not been created in Supabase yet. Run the script in the Supabase SQL tab first.',
        };
      }
      return { data: null, error: formatSupabaseError(error, 'Failed to save skill.') };
    }

    return { data: mapDbRowToSkill(data), error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to save skill.' };
  }
}

export async function deleteSkill(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseError(error, 'Failed to delete skill.') };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete skill.' };
  }
}

export async function seedInitialSkills(
  existing: SkillItem[]
): Promise<{ insertedCount: number; error: string | null }> {
  const existingNames = new Set(existing.map((s) => s.name.trim().toLowerCase()));
  const missing = initialSkills.filter((s) => !existingNames.has(s.name.trim().toLowerCase()));
  if (missing.length === 0) return { insertedCount: 0, error: null };

  const payloads = missing.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    status: s.status,
    description: s.description,
    key_topics: s.keyTopics,
    image_url: s.imageUrl || null,
    video_url: s.videoUrl || null,
  }));

  try {
    const { data, error } = await supabase.from('skills').insert(payloads).select();
    if (error) {
      return { insertedCount: 0, error: formatSupabaseError(error, 'Failed to import initial skills.') };
    }
    return { insertedCount: (data ?? []).length, error: null };
  } catch (err: any) {
    return { insertedCount: 0, error: err?.message || 'Failed to import initial skills.' };
  }
}

// ============================================================================
// 5. CODING STATS (public.coding_stats)
// ============================================================================

export async function fetchCodingStats(): Promise<FetchResult<CodingStats>> {
  if (!isSupabaseConfigured) {
    return { data: DEFAULT_CODING_STATS, fromSupabase: false, tableMissing: false, error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('coding_stats')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        return { data: DEFAULT_CODING_STATS, fromSupabase: false, tableMissing: true, error: null };
      }
      return { data: DEFAULT_CODING_STATS, fromSupabase: false, tableMissing: false, error: error.message };
    }

    if (!data) {
      return { data: DEFAULT_CODING_STATS, fromSupabase: true, tableMissing: false, error: null };
    }

    return {
      data: {
        leetcode_solved: data.leetcode_solved || DEFAULT_CODING_STATS.leetcode_solved,
        codechef_rating: data.codechef_rating || DEFAULT_CODING_STATS.codechef_rating,
        hackerrank_badges: data.hackerrank_badges || DEFAULT_CODING_STATS.hackerrank_badges,
        kaggle_tier: data.kaggle_tier || DEFAULT_CODING_STATS.kaggle_tier,
      },
      fromSupabase: true,
      tableMissing: false,
      error: null,
    };
  } catch (err: any) {
    return { data: DEFAULT_CODING_STATS, fromSupabase: false, tableMissing: false, error: err?.message || 'Unable to load coding stats.' };
  }
}

export async function saveCodingStats(stats: CodingStats): Promise<MutationResult<CodingStats>> {
  try {
    const payload = {
      id: 'default',
      leetcode_solved: stats.leetcode_solved.trim(),
      codechef_rating: stats.codechef_rating.trim(),
      hackerrank_badges: stats.hackerrank_badges.trim(),
      kaggle_tier: stats.kaggle_tier.trim(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('coding_stats')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return {
          data: null,
          tableMissing: true,
          error: 'The public.coding_stats table has not been created in Supabase yet. Run the script in the Supabase SQL tab first.',
        };
      }
      return { data: null, error: formatSupabaseError(error, 'Failed to save coding stats.') };
    }

    return {
      data: {
        leetcode_solved: data.leetcode_solved,
        codechef_rating: data.codechef_rating,
        hackerrank_badges: data.hackerrank_badges,
        kaggle_tier: data.kaggle_tier,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to save coding stats.' };
  }
}

// ============================================================================
// COMPLETE IDEMPOTENT SUPABASE SQL MIGRATION SCRIPT
// ============================================================================

export const FULL_SUPABASE_SQL_SCHEMA = `-- Execute this complete script in your Supabase Project -> SQL Editor
-- Safe to run multiple times (idempotent) to enable full Mobile <-> PC sync.

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

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    technologies TEXT[] DEFAULT '{}',
    image_url TEXT,
    screenshots TEXT[] DEFAULT '{}',
    video_url TEXT,
    github_url TEXT,
    live_demo_url TEXT,
    status TEXT DEFAULT 'In Development',
    completion_date TEXT,
    featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Blog & Engineering Dispatches Table (+ upgrade any missing columns)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    video_url TEXT,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS linked_in_post_url TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS post_date TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS read_time TEXT;

-- 5. Certificates & Accreditations Table (+ upgrade image_url/video_url/category)
CREATE TABLE IF NOT EXISTS public.certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    completion_date TEXT,
    description TEXT,
    credential_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Academics';

-- 6. Hackathons & Competitions Table
CREATE TABLE IF NOT EXISTS public.hackathons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT,
    participation_status TEXT,
    role TEXT,
    team_members TEXT[] DEFAULT '{}',
    technologies_used TEXT[] DEFAULT '{}',
    project_details TEXT,
    key_learnings TEXT[] DEFAULT '{}',
    result TEXT,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Skills & Technologies Table
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    key_topics TEXT[] DEFAULT '{}',
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Developer Coding Stats Table
CREATE TABLE IF NOT EXISTS public.coding_stats (
    id TEXT PRIMARY KEY DEFAULT 'default',
    leetcode_solved TEXT,
    codechef_rating TEXT,
    hackerrank_badges TEXT,
    kaggle_tier TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_stats ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies (Public Read + Authenticated Admin Write)
DROP POLICY IF EXISTS "Admins can view their own membership" ON public.admin_users;
CREATE POLICY "Admins can view their own membership"
    ON public.admin_users FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public inquiries insert" ON public.contact_messages;
CREATE POLICY "Allow public inquiries insert"
    ON public.contact_messages FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin to read inquiries" ON public.contact_messages;
CREATE POLICY "Allow admin to read inquiries"
    ON public.contact_messages FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow public read published projects" ON public.projects;
CREATE POLICY "Allow public read published projects"
    ON public.projects FOR SELECT TO anon, authenticated
    USING (is_published = true);

DROP POLICY IF EXISTS "Allow admin to manage all projects" ON public.projects;
CREATE POLICY "Allow admin to manage all projects"
    ON public.projects FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow public read blog posts" ON public.blog_posts;
CREATE POLICY "Allow public read blog posts"
    ON public.blog_posts FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin to manage blog posts" ON public.blog_posts;
CREATE POLICY "Allow admin to manage blog posts"
    ON public.blog_posts FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow public read certificates" ON public.certificates;
CREATE POLICY "Allow public read certificates"
    ON public.certificates FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin to manage certificates" ON public.certificates;
CREATE POLICY "Allow admin to manage certificates"
    ON public.certificates FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow public read hackathons" ON public.hackathons;
CREATE POLICY "Allow public read hackathons"
    ON public.hackathons FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin to manage hackathons" ON public.hackathons;
CREATE POLICY "Allow admin to manage hackathons"
    ON public.hackathons FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow public read skills" ON public.skills;
CREATE POLICY "Allow public read skills"
    ON public.skills FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin to manage skills" ON public.skills;
CREATE POLICY "Allow admin to manage skills"
    ON public.skills FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow public read coding_stats" ON public.coding_stats;
CREATE POLICY "Allow public read coding_stats"
    ON public.coding_stats FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin to manage coding_stats" ON public.coding_stats;
CREATE POLICY "Allow admin to manage coding_stats"
    ON public.coding_stats FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));
`;
