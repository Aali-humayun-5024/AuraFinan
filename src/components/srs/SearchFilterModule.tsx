// BudgetBasics — Search, Sort, and Filter Module
// Complies with TechWiz 7 SRS Section 1.6.9:
// - Search learning content by keywords (saving, needs, expenses, goals, mistakes)
// - Filter tips, examples, or infographics by topic
// - Sort by: Newest, A-Z, Most Relevant
// - Clear empty state message when no matching content is found

import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, BookOpen, AlertCircle, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface ResourceItem {
  id: string;
  title: string;
  topic: 'Saving' | 'Needs' | 'Expenses' | 'Goals' | 'Budgeting' | 'Infographics' | 'Mistakes';
  description: string;
  keywords: string[];
  type: 'Guide' | 'Calculator' | 'Checklist' | 'Rule' | 'Infographic';
  dateAdded: string;
  viewId: string;
}

const RESOURCES_DATABASE: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'The 50/30/20 Rule Calculator & Interactive Breakdown',
    topic: 'Budgeting',
    type: 'Calculator',
    description: 'Learn how to partition student allowances into 50% Needs, 30% Wants, and 20% Savings with live interactive charts.',
    keywords: ['50/30/20', 'budgeting', 'golden ratio', 'allowance', 'calculator', 'formula'],
    dateAdded: '2026-09-26',
    viewId: '50-30-20',
  },
  {
    id: 'res-2',
    title: 'Needs vs. Wants: The 4-Step Decision Flowchart',
    topic: 'Needs',
    type: 'Guide',
    description: 'A mental decision tree to filter impulse buying and classify purchases before spending cash.',
    keywords: ['needs', 'wants', 'decision tree', 'impulse', 'delay', '48 hours'],
    dateAdded: '2026-09-25',
    viewId: 'needs-vs-wants',
  },
  {
    id: 'res-3',
    title: 'Student Savings Goal & Timeline Estimator',
    topic: 'Goals',
    type: 'Calculator',
    description: 'Calculate target amounts, monthly contributions, and estimated months to achieve financial milestones.',
    keywords: ['goals', 'saving', 'target', 'timeline', 'emergency fund', 'laptop'],
    dateAdded: '2026-09-24',
    viewId: 'savings-goals',
  },
  {
    id: 'res-4',
    title: 'Student Daily Expense Planner Ledger',
    topic: 'Expenses',
    type: 'Checklist',
    description: 'Log and monitor 7 daily expense categories with live remaining balance calculation.',
    keywords: ['expenses', 'tracking', 'daily', 'food', 'transport', 'planner'],
    dateAdded: '2026-09-23',
    viewId: 'expense-planner',
  },
  {
    id: 'res-5',
    title: '5 Common Student Money Mistakes & How to Avoid Them',
    topic: 'Mistakes',
    type: 'Guide',
    description: 'Detailed analysis of impulse shopping, ignoring the latte factor, and unused auto-renewing subscriptions.',
    keywords: ['mistakes', 'impulse', 'latte factor', 'subscriptions', 'overdraft'],
    dateAdded: '2026-09-22',
    viewId: 'money-mistakes',
  },
  {
    id: 'res-6',
    title: 'Visual Learning Gallery & Financial Infographics',
    topic: 'Infographics',
    type: 'Infographic',
    description: 'High-resolution visual graphics detailing budget cycles, compounding curves, and 30-day saving challenges.',
    keywords: ['infographics', 'visual', 'charts', 'compounding', 'challenge'],
    dateAdded: '2026-09-21',
    viewId: 'infographics',
  },
  {
    id: 'res-7',
    title: 'The 30-Day Zero-Waste Micro-Saving Challenge',
    topic: 'Saving',
    type: 'Checklist',
    description: 'A gamified step-by-step calendar challenge to bank $465 in 30 days.',
    keywords: ['saving', 'challenge', 'habit', 'micro-saving', 'streak'],
    dateAdded: '2026-09-20',
    viewId: 'infographics',
  },
];

export default function SearchFilterModule() {
  const { setActiveView } = useAppStore();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'relevant' | 'newest' | 'az'>('relevant');

  const filteredResources = useMemo(() => {
    return RESOURCES_DATABASE.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTopic = selectedTopic === 'All' || item.topic === selectedTopic;

      return matchesSearch && matchesTopic;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      if (sortBy === 'az') {
        return a.title.localeCompare(b.title);
      }
      return 0; // Most relevant keeps order
    });
  }, [searchTerm, selectedTopic, sortBy]);

  const topicsList = ['All', 'Budgeting', 'Needs', 'Saving', 'Expenses', 'Goals', 'Mistakes', 'Infographics'];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
          <Search size={14} /> SRS Requirement 1.6.9
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Search, Sort, and Filter Learning Resources
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Find financial guides, calculators, infographics, and habit checklists by keyword, topic category, or publication order.
        </p>
      </div>

      {/* Search & Controls Bar */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tips, goals, expenses, 50/30/20, mistakes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
            />
          </div>

          {/* Sort By Controls */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl text-xs font-semibold">
            <span className="text-slate-400 px-2 text-[11px]">Sort:</span>
            <button
              onClick={() => setSortBy('relevant')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sortBy === 'relevant'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Most Relevant
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sortBy === 'newest'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('az')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sortBy === 'az'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>

        {/* Topic Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Tag size={12} /> Topics:
          </span>
          {topicsList.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedTopic === topic
                  ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              #{topic}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Clear */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredResources.length} of {RESOURCES_DATABASE.length} resources</span>
        {(searchTerm || selectedTopic !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTopic('All');
            }}
            className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Empty State Message (SRS Requirement 1.6.9) */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 space-y-3">
          <AlertCircle size={36} className="mx-auto text-amber-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            No matching learning content found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We could not find any guide, calculator, or infographic matching "{searchTerm}". Try searching for keywords like <strong>saving</strong>, <strong>needs</strong>, <strong>50/30/20</strong>, or <strong>goals</strong>.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTopic('All');
            }}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-xs"
          >
            Reset Search
          </button>
        </div>
      ) : (
        /* Results Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 space-y-3 hover:border-amber-400 transition-all flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
                    {res.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{res.dateAdded}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">#{res.topic}</span>
                <button
                  onClick={() => setActiveView(res.viewId)}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Open Resource</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
