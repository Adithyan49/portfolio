export interface Certificate {
  id: string;
  title: string;
  issuingOrganization: string;
  completionDate: string;
  description: string;
  credentialUrl?: string;
  fileUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  category: 'Academics' | 'Programming' | 'AI & ML' | 'Hackathons';
}

/**
 * Initial certificates list:
 * In accordance with instructions, we do not invent fake certificates.
 * When Adithyan uploads real certificates via the admin dashboard,
 * they will be saved to Supabase / localStorage and appear here.
 */
export const initialCertificates: Certificate[] = [
  {
    id: 'cert-placeholder-notice',
    title: 'HackerRank Problem Solving & Language Verification',
    issuingOrganization: 'HackerRank (adithyan_r2026a1)',
    completionDate: '2026',
    description: 'Practical skill verification badges and assessments for basic problem solving and algorithmic reasoning.',
    credentialUrl: 'https://www.hackerrank.com/profile/adithyan_r2026a1',
    category: 'Programming'
  }
];
