import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export type ProjectCategory =
  | 'AI / Machine Learning'
  | 'Web Development'
  | 'Cybersecurity'
  | 'Hardware / IoT';

export type ProjectStatus =
  | 'In Development'
  | 'Completed Prototype'
  | 'Live Production'
  | 'Concept / Research';

export interface DbProject {
  id: string;
  title: string;
  short_description: string;
  description: string;
  category: ProjectCategory | string;
  technologies: string[];
  image_url?: string | null;
  screenshots?: string[] | null;
  video_url?: string | null;
  github_url?: string | null;
  live_demo_url?: string | null;
  status: ProjectStatus | string;
  completion_date?: string | null;
  featured: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectFormInput {
  title: string;
  short_description: string;
  description: string;
  category: ProjectCategory | string;
  technologies: string[];
  image_url: string;
  screenshots: string[];
  video_url: string;
  github_url: string;
  live_demo_url: string;
  status: ProjectStatus | string;
  completion_date: string;
  featured: boolean;
  is_published: boolean;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'AI / Machine Learning',
  'Web Development',
  'Cybersecurity',
  'Hardware / IoT',
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  'In Development',
  'Completed Prototype',
  'Live Production',
  'Concept / Research',
];

/**
 * Validates HTTP(S) URLs.
 * Optionally permits data:image/* URIs for main/screenshot image uploads.
 */
export function isValidUrl(raw: string | null | undefined, allowDataImage = false): boolean {
  if (!raw || !raw.trim()) return false;
  const trimmed = raw.trim();

  if (allowDataImage && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(trimmed)) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeOptionalUrl(raw: string | null | undefined, allowDataImage = false): string | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  return isValidUrl(trimmed, allowDataImage) ? trimmed : null;
}

export function validateProjectInput(input: ProjectFormInput): string | null {
  if (!input.title.trim()) {
    return 'Project title is required.';
  }
  if (!input.short_description.trim()) {
    return 'Short description is required.';
  }
  if (!input.description.trim()) {
    return 'Detailed description is required.';
  }
  if (!input.category.trim()) {
    return 'Project category is required.';
  }
  if (!input.status.trim()) {
    return 'Project status is required.';
  }

  if (input.image_url.trim() && !isValidUrl(input.image_url, true)) {
    return 'Main image URL must start with https://, http://, or be a valid uploaded image.';
  }

  for (const shot of input.screenshots) {
    if (shot.trim() && !isValidUrl(shot, true)) {
      return `Invalid screenshot URL detected: "${shot}". URLs must start with http:// or https://.`;
    }
  }

  if (input.video_url.trim() && !isValidUrl(input.video_url, false)) {
    return 'Video demonstration URL must be a valid http:// or https:// link.';
  }

  if (input.github_url.trim() && !isValidUrl(input.github_url, false)) {
    return 'GitHub URL must be a valid http:// or https:// link.';
  }

  if (input.live_demo_url.trim() && !isValidUrl(input.live_demo_url, false)) {
    return 'Live demo URL must be a valid http:// or https:// link.';
  }

  return null;
}

/**
 * Fetches published projects for public visitors.
 * RLS policy enforces is_published = true for anon users, and we also filter explicitly.
 */
export async function fetchPublishedProjects(): Promise<{
  data: DbProject[];
  error: string | null;
}> {
  if (!isSupabaseConfigured) {
    return { data: [], error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchPublishedProjects error:', error.message);
      return { data: [], error: error.message };
    }

    return {
      data: ((data ?? []) as DbProject[]).map(normalizeDbProject),
      error: null,
    };
  } catch (err: any) {
    console.error('Unexpected fetchPublishedProjects error:', err);
    return { data: [], error: err?.message || 'Unable to load projects from Supabase.' };
  }
}

/**
 * Fetches all projects (published and unpublished) for verified administrators.
 */
export async function fetchAllProjectsAdmin(): Promise<{
  data: DbProject[];
  error: string | null;
}> {
  if (!isSupabaseConfigured) {
    return { data: [], error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchAllProjectsAdmin error:', error.message);
      return { data: [], error: error.message };
    }

    return {
      data: ((data ?? []) as DbProject[]).map(normalizeDbProject),
      error: null,
    };
  } catch (err: any) {
    console.error('Unexpected fetchAllProjectsAdmin error:', err);
    return { data: [], error: err?.message || 'Unable to load admin projects.' };
  }
}

/**
 * Creates a new project record in public.projects.
 * Protected by Supabase RLS requiring membership in public.admin_users.
 */
export async function createProject(input: ProjectFormInput): Promise<{
  data: DbProject | null;
  error: string | null;
}> {
  const validationError = validateProjectInput(input);
  if (validationError) {
    return { data: null, error: validationError };
  }

  try {
    const payload = buildMutationPayload(input);
    const { data, error } = await supabase
      .from('projects')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase createProject error:', error.message);
      return { data: null, error: error.message };
    }

    return { data: normalizeDbProject(data as DbProject), error: null };
  } catch (err: any) {
    console.error('Unexpected createProject error:', err);
    return { data: null, error: err?.message || 'Failed to create project.' };
  }
}

/**
 * Updates an existing project record in public.projects.
 */
export async function updateProject(
  id: string,
  input: ProjectFormInput
): Promise<{
  data: DbProject | null;
  error: string | null;
}> {
  if (!id) {
    return { data: null, error: 'Missing project ID for update.' };
  }

  const validationError = validateProjectInput(input);
  if (validationError) {
    return { data: null, error: validationError };
  }

  try {
    const payload = {
      ...buildMutationPayload(input),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateProject error:', error.message);
      return { data: null, error: error.message };
    }

    return { data: normalizeDbProject(data as DbProject), error: null };
  } catch (err: any) {
    console.error('Unexpected updateProject error:', err);
    return { data: null, error: err?.message || 'Failed to update project.' };
  }
}

/**
 * Deletes a project record from public.projects.
 */
export async function deleteProject(id: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  if (!id) {
    return { success: false, error: 'Missing project ID.' };
  }

  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      console.error('Supabase deleteProject error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Unexpected deleteProject error:', err);
    return { success: false, error: err?.message || 'Failed to delete project.' };
  }
}

/**
 * Toggles featured or is_published status directly.
 */
export async function updateProjectFlags(
  id: string,
  patch: Partial<Pick<DbProject, 'featured' | 'is_published'>>
): Promise<{
  data: DbProject | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: normalizeDbProject(data as DbProject), error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to update project flags.' };
  }
}

/**
 * Core initial portfolio projects (strictly factual, no invented links or dates).
 */
export const CORE_PORTFOLIO_PROJECTS: ProjectFormInput[] = [
  {
    title: 'AgriSaarthi AI',
    short_description:
      'AI-powered agricultural assistant focusing on crop selection, soil and weather factors, irrigation and farming risks.',
    description:
      'AgriSaarthi AI is an AI-powered agricultural assistant designed to help farmers make informed decisions by analyzing crop selection suitability, soil and weather factors, irrigation schedules, and potential farming risks.',
    category: 'AI / Machine Learning',
    technologies: ['Python', 'Machine Learning', 'Data Analytics', 'Agronomic Models'],
    image_url: '',
    screenshots: [],
    video_url: '',
    github_url: '',
    live_demo_url: '',
    status: 'In Development',
    completion_date: '',
    featured: true,
    is_published: true,
  },
  {
    title: 'QShield',
    short_description:
      'Quantum-inspired cybersecurity and digital-signature application exploring forgery, impersonation, replay attacks and channel manipulation.',
    description:
      'QShield is a quantum-inspired cybersecurity and digital-signature software project exploring defense mechanisms against forgery, impersonation, replay attacks, and channel manipulation.',
    category: 'Cybersecurity',
    technologies: ['C++', 'Cryptography', 'Digital Signatures', 'Security Analysis'],
    image_url: '',
    screenshots: [],
    video_url: '',
    github_url: '',
    live_demo_url: '',
    status: 'In Development',
    completion_date: '',
    featured: true,
    is_published: true,
  },
  {
    title: 'Smart Blind Stick',
    short_description:
      'Arduino-based assistive prototype using an ultrasonic sensor and buzzer to detect and alert users about nearby obstacles.',
    description:
      'Smart Blind Stick is an Arduino-based assistive hardware prototype utilizing an ultrasonic distance sensor and buzzer actuator to detect nearby obstacles in real time and alert users.',
    category: 'Hardware / IoT',
    technologies: ['Arduino', 'C++', 'Ultrasonic Sensor', 'Embedded Systems'],
    image_url: '',
    screenshots: [],
    video_url: '',
    github_url: '',
    live_demo_url: '',
    status: 'Completed Prototype',
    completion_date: '',
    featured: false,
    is_published: true,
  },
  {
    title: 'Personal Portfolio',
    short_description:
      'Interactive developer portfolio showcasing my technical skills, projects and learning journey.',
    description:
      'Personal Portfolio is an interactive developer portfolio built with React, Framer Motion, Tailwind CSS, and Supabase to showcase technical skills, engineering projects, certifications, and learning milestones.',
    category: 'Web Development',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Supabase'],
    image_url: '',
    screenshots: [],
    video_url: '',
    github_url: '',
    live_demo_url: '',
    status: 'Live Production',
    completion_date: '',
    featured: true,
    is_published: true,
  },
];

/**
 * Inserts only missing core projects into public.projects (prevents duplicate titles).
 */
export async function seedMissingInitialProjects(existingProjects: DbProject[]): Promise<{
  insertedCount: number;
  error: string | null;
}> {
  const existingTitles = new Set(
    existingProjects.map((p) => p.title.trim().toLowerCase())
  );

  const missing = CORE_PORTFOLIO_PROJECTS.filter(
    (item) => !existingTitles.has(item.title.trim().toLowerCase())
  );

  if (missing.length === 0) {
    return { insertedCount: 0, error: null };
  }

  try {
    const payloads = missing.map(buildMutationPayload);
    const { data, error } = await supabase
      .from('projects')
      .insert(payloads)
      .select();

    if (error) {
      return { insertedCount: 0, error: error.message };
    }

    return { insertedCount: (data ?? []).length, error: null };
  } catch (err: any) {
    return { insertedCount: 0, error: err?.message || 'Failed to add initial projects.' };
  }
}

function buildMutationPayload(input: ProjectFormInput) {
  return {
    title: input.title.trim(),
    short_description: input.short_description.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    technologies: input.technologies.map((t) => t.trim()).filter(Boolean),
    image_url: sanitizeOptionalUrl(input.image_url, true),
    screenshots: input.screenshots
      .map((s) => sanitizeOptionalUrl(s, true))
      .filter((s): s is string => Boolean(s)),
    video_url: sanitizeOptionalUrl(input.video_url, false),
    github_url: sanitizeOptionalUrl(input.github_url, false),
    live_demo_url: sanitizeOptionalUrl(input.live_demo_url, false),
    status: input.status.trim(),
    completion_date: input.completion_date.trim() || null,
    featured: Boolean(input.featured),
    is_published: Boolean(input.is_published),
  };
}

function normalizeDbProject(row: DbProject): DbProject {
  return {
    ...row,
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    screenshots: Array.isArray(row.screenshots) ? row.screenshots : [],
    featured: Boolean(row.featured),
    is_published: row.is_published !== false,
  };
}
