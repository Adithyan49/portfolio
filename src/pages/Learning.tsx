import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Milestone,
  Calendar
} from 'lucide-react';
import { initialCourses, initialMilestones, Course, LearningMilestone } from '../data/learning';

export const Learning: React.FC = () => {
  const [courseFilter, setCourseFilter] = useState<'All' | 'Completed' | 'In Progress'>('All');

  const savedCourses = localStorage.getItem('adithyan_custom_courses');
  const coursesList: Course[] = savedCourses ? JSON.parse(savedCourses) : initialCourses;

  const savedMilestones = localStorage.getItem('adithyan_custom_milestones');
  const milestonesList: LearningMilestone[] = savedMilestones ? JSON.parse(savedMilestones) : initialMilestones;

  const filteredCourses = courseFilter === 'All'
    ? coursesList
    : coursesList.filter((c) => c.status === courseFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Continuous Skill Evolution</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Learning <span className="text-gradient">Journey</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
          Structured roadmap tracking academic coursework, algorithm mastery, and machine learning research milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Vertical Milestones Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
            <Milestone className="w-5 h-5 text-[#7C5CFC]" />
            <span>Growth Milestones & Timeline</span>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l border-slate-800 space-y-8">
            {milestonesList.map((m, index) => {
              const isAchieved = m.status === 'Achieved';
              return (
                <div key={m.id} className="relative group">
                  {/* Timeline Node */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-125 ${
                      isAchieved
                        ? 'bg-[#7C5CFC] border-[#00D4FF] shadow-sm shadow-purple-500/50'
                        : 'bg-slate-900 border-slate-600'
                    }`}
                  />

                  {/* Milestone Card */}
                  <div className="glass-panel rounded-2xl p-6 group-hover:border-[#7C5CFC]/40 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-2 font-mono">
                      <span className="text-[#00D4FF]">{m.period}</span>
                      <span>{m.status}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#A78BFA] transition-colors">
                      {m.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                      {m.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                      {m.skillsAcquired.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Coursework & Technical Study Focus (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <BookOpen className="w-5 h-5 text-[#00D4FF]" />
              <span>Curriculum & Courses</span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
              {(['All', 'In Progress', 'Completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCourseFilter(filter)}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                    courseFilter === filter
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredCourses.map((course) => {
              const isCompleted = course.status === 'Completed';
              return (
                <div
                  key={course.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span className="text-[#A78BFA]">{course.focusArea}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isCompleted
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2">
                    {course.title}
                  </h4>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                    {course.topicsCovered.map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Academic Ethos Note */}
          <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-300 leading-relaxed">
            <span className="text-[#00D4FF] font-semibold block mb-1">
              Methodology Focus:
            </span>
            Emphasizing algorithm fundamentals, pointer arithmetic, and clean code principles before moving toward higher-level ML abstraction layers.
          </div>
        </div>
      </div>
    </div>
  );
};
