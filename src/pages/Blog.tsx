import React, { useState } from 'react';
import {
  BookOpen,
  ThumbsUp,
  Share2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Calendar,
  Clock,
  Check,
  Linkedin
} from 'lucide-react';
import { initialBlogPosts, BlogPost } from '../data/blog';

interface BlogProps {
  onNavigate: (pageId: string) => void;
}

export const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Read custom posts if created via Admin
  const savedPosts = localStorage.getItem('adithyan_custom_blog_posts');
  const postsList: BlogPost[] = savedPosts ? JSON.parse(savedPosts) : initialBlogPosts;

  // Track liked post IDs in localStorage
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('adithyan_liked_posts');
    return saved ? JSON.parse(saved) : {};
  });

  const handleLike = (postId: string) => {
    const isCurrentlyLiked = likedPosts[postId];
    const updated = { ...likedPosts, [postId]: !isCurrentlyLiked };
    setLikedPosts(updated);
    localStorage.setItem('adithyan_liked_posts', JSON.stringify(updated));
  };

  const handleShare = (post: BlogPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Collect all unique tags
  const allTags = ['All', ...Array.from(new Set(postsList.flatMap((p) => p.tags)))];

  const filteredPosts = selectedTag === 'All'
    ? postsList
    : postsList.filter((p) => p.tags.includes(selectedTag));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-10 text-left">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Engineering Dispatch & Reflections</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Engineering <span className="text-gradient">Blog & Insights</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Technical thoughts, hackathon breakdowns, AI/ML learnings, and architectural notes published directly from Adithyan&apos;s workspace.
        </p>
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 overflow-x-auto mb-8 max-w-full">
        {allTags.map((tag) => {
          const isActive = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6366F1] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Posts Stream (LinkedIn style card format) */}
      <div className="space-y-6">
        {filteredPosts.map((post) => {
          const isLiked = likedPosts[post.id];
          const totalLikes = post.likes + (isLiked ? 1 : 0);

          return (
            <article
              key={post.id}
              className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-xl"
            >
              {/* Post Author Bar */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#00D4FF] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {post.author.avatarText}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white tracking-tight leading-tight">
                      {post.author.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">
                      {post.author.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono shrink-0">
                  <span>{post.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight leading-snug hover:text-[#A78BFA] transition-colors">
                {post.title}
              </h2>

              {/* Content Body */}
              <div className="text-sm sm:text-base text-slate-300 whitespace-pre-line leading-relaxed mb-6 font-normal">
                {post.content}
              </div>

              {/* Optional Post Image / Video Media */}
              {post.imageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden border border-slate-800 max-h-[380px]">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono text-[#00D4FF] bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800"
                  >
                    #{t.replace(/\s+/g, '')}
                  </span>
                ))}
              </div>

              {/* Footer Engagement Bar */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isLiked
                        ? 'bg-purple-950/70 border border-purple-600/60 text-[#00D4FF] shadow-sm'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#00D4FF]' : ''}`} />
                    <span>{totalLikes} Likes</span>
                  </button>

                  <button
                    onClick={() => handleShare(post)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    {copiedId === post.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>

                {post.linkedInPostUrl && (
                  <a
                    href={post.linkedInPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-[#00D4FF] transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span className="hidden sm:inline">Connect on LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
