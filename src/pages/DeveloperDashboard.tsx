import React, { useState, useEffect } from 'react';
import {
  Activity,
  Github,
  Terminal,
  ExternalLink,
  RefreshCw,
  Award,
  BarChart2,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

interface GitHubProfile {
  login: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  bio?: string;
  avatar_url?: string;
}

interface PlatformMetric {
  id: string;
  name: string;
  handle: string;
  url: string;
  status: 'Live API' | 'Verified Source' | 'Direct Profile';
  icon: string;
  metrics: { label: string; value: string | number }[];
  note: string;
}

export const DeveloperDashboard: React.FC = () => {
  const [githubData, setGithubData] = useState<GitHubProfile | null>(null);
  const [loadingGithub, setLoadingGithub] = useState<boolean>(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const fetchGithub = async () => {
    setLoadingGithub(true);
    setGithubError(null);
    try {
      // Check cache first (valid for 30 minutes)
      const cached = localStorage.getItem('adithyan_github_cache');
      const cachedTime = localStorage.getItem('adithyan_github_cache_time');

      if (cached && cachedTime && Date.now() - Number(cachedTime) < 30 * 60 * 1000) {
        setGithubData(JSON.parse(cached));
        setLastSyncTime(new Date(Number(cachedTime)).toLocaleTimeString());
        setLoadingGithub(false);
        return;
      }

      const res = await fetch('https://api.github.com/users/Adithyan49');
      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}`);
      }
      const data: GitHubProfile = await res.json();
      setGithubData(data);
      const now = Date.now();
      localStorage.setItem('adithyan_github_cache', JSON.stringify(data));
      localStorage.setItem('adithyan_github_cache_time', String(now));
      setLastSyncTime(new Date(now).toLocaleTimeString());
    } catch (err: any) {
      console.warn('GitHub fetch notice:', err.message);
      setGithubError(err.message || 'Unable to sync live data at this moment.');
      // Attempt to load stale cache if available
      const cached = localStorage.getItem('adithyan_github_cache');
      if (cached) {
        setGithubData(JSON.parse(cached));
      }
    } finally {
      setLoadingGithub(false);
    }
  };

  useEffect(() => {
    fetchGithub();
  }, []);

  // Check for admin manual overrides if stored
  const customMetricsStr = localStorage.getItem('adithyan_custom_coding_metrics');
  const customOverrides = customMetricsStr ? JSON.parse(customMetricsStr) : {};

  const platforms: PlatformMetric[] = [
    {
      id: 'leetcode',
      name: 'LeetCode',
      handle: 'adithyan_adhi',
      url: 'https://leetcode.com/u/adithyan_adhi/',
      status: 'Direct Profile',
      icon: 'Terminal',
      metrics: [
        { label: 'Platform Status', value: 'Active Practice' },
        { label: 'Language', value: 'C++ & Python' },
        { label: 'Focus', value: 'Data Structures' },
        { label: 'Solved (Tracked)', value: customOverrides.leetcode_solved || 'In Progress' }
      ],
      note: 'Algorithmic focus on array partitioning, pointers, and recursive problem sets.'
    },
    {
      id: 'hackerrank',
      name: 'HackerRank',
      handle: 'adithyan_r2026a1',
      url: 'https://www.hackerrank.com/profile/adithyan_r2026a1',
      status: 'Direct Profile',
      icon: 'Award',
      metrics: [
        { label: 'Language Tracks', value: 'C++ / Python' },
        { label: 'Problem Solving', value: 'Active' },
        { label: 'Badges Earned', value: customOverrides.hackerrank_badges || 'Verified' }
      ],
      note: 'Focused on standard library problem resolution and core syntactic tests.'
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      handle: 'plush_plume_54',
      url: 'https://www.codechef.com/users/plush_plume_54',
      status: 'Direct Profile',
      icon: 'Code2',
      metrics: [
        { label: 'Contest Division', value: 'Active Participant' },
        { label: 'Rating (Current)', value: customOverrides.codechef_rating || 'Active' },
        { label: 'Primary Language', value: 'C++' }
      ],
      note: 'Timed competitive contests focusing on logic execution and space bounds.'
    },
    {
      id: 'kaggle',
      name: 'Kaggle',
      handle: 'adithyanraids',
      url: 'https://www.kaggle.com/adithyanraids',
      status: 'Direct Profile',
      icon: 'BarChart2',
      metrics: [
        { label: 'Discipline', value: 'Data Science & ML' },
        { label: 'Notebooks', value: 'Exploratory' },
        { label: 'Kaggle Tier', value: customOverrides.kaggle_tier || 'Contributor' }
      ],
      note: 'Studying tabular prediction datasets, exploratory EDA, and feature evaluation.'
    },
    {
      id: 'geeksforgeeks',
      name: 'GeeksforGeeks',
      handle: 'adithyanr2pr2',
      url: 'https://www.geeksforgeeks.org/profile/adithyanr2pr2',
      status: 'Direct Profile',
      icon: 'Terminal',
      metrics: [
        { label: 'Theory Tracks', value: 'DSA Foundations' },
        { label: 'Coding Practice', value: 'Ongoing' }
      ],
      note: 'Mastery of fundamental computer science concepts and standard algorithms.'
    },
    {
      id: 'unstop',
      name: 'Unstop',
      handle: 'adithyan70944',
      url: 'https://unstop.com/u/adithyan70944',
      status: 'Direct Profile',
      icon: 'Award',
      metrics: [
        { label: 'Collegiate Events', value: 'Hackathons' },
        { label: 'Status', value: 'Active Competitor' }
      ],
      note: 'Participation in engineering innovation sprints and collegiate challenges.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Telemetry & Coding Activity</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Developer <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Live metrics and official coding profiles across GitHub, competitive programming hubs, and data science platforms.
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3">
          {lastSyncTime && (
            <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Synced {lastSyncTime}</span>
            </div>
          )}
          <button
            onClick={fetchGithub}
            disabled={loadingGithub}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-[#7C5CFC] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingGithub ? 'animate-spin text-[#00D4FF]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* GitHub Live Integration Highlight Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-10 border border-purple-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#00D4FF] p-0.5 shadow-lg shadow-purple-950/40">
              <div className="w-full h-full bg-[#0D1425] rounded-[14px] flex items-center justify-center">
                <Github className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  GitHub Profile
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                  Live GitHub API
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-mono mt-0.5">
                github.com/Adithyan49
              </p>
            </div>
          </div>

          <a
            href="https://github.com/Adithyan49"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] hover:opacity-95 transition-opacity"
          >
            <span>Visit Official GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* GitHub Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Public Repositories</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono tabular-nums">
              {githubData ? githubData.public_repos : '—'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Followers</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono tabular-nums">
              {githubData ? githubData.followers : '—'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Following</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono tabular-nums">
              {githubData ? githubData.following : '—'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Public Gists</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono tabular-nums">
              {githubData ? githubData.public_gists : '0'}
            </p>
          </div>
        </div>

        {githubError && (
          <div className="mt-4 text-xs text-amber-400/90 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{githubError}</span>
          </div>
        )}
      </div>

      {/* Other Coding & Competitive Platforms Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-2">
          Competitive Programming & Analytics Portals
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Direct links to official profiles with authentic verified progress metrics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="text-[#00D4FF] font-mono">{platform.handle}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {platform.status}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#A78BFA] transition-colors">
                  {platform.name}
                </h4>

                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  {platform.note}
                </p>

                {/* Metrics */}
                <div className="space-y-2 py-3 border-y border-slate-800/80">
                  {platform.metrics.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="font-semibold text-white">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Link Button */}
              <div className="pt-4">
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <span>Open {platform.name}</span>
                  <ExternalLink className="w-3 h-3 text-[#7C5CFC]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
