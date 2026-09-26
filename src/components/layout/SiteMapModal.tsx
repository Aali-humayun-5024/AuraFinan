// AuraFinance OS — Searchable Visual Site Map Modal
// Hierarchical topology of all 6 application domains + instant filter and jump navigation
// Accessible via ⌘M / Ctrl+M

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { playClickSound, playSuccessSound } from '../../services/soundService';
import {
  Search,
  X,
  Compass,
  LayoutDashboard,
  Layers,
  BookOpen,
  GraduationCap,
  Scale,
  Users,
  Shield,
  Settings,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Coins,
  FileSpreadsheet,
  Lock,
  FileText,
  Activity,
} from 'lucide-react';

interface SiteMapNode {
  title: string;
  description: string;
  viewId: string;
  tag?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SiteMapDomain {
  domainId: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  nodes: SiteMapNode[];
}

export const SITE_MAP_TOPOLOGY: SiteMapDomain[] = [
  {
    domainId: 'srs-modules',
    title: 'BudgetBasics Educational Modules (TechWiz 7 SRS)',
    description: 'NextGen BudgetBee student financial awareness, calculators & interactive tools',
    icon: LayoutDashboard,
    accentColor: 'from-amber-500 to-yellow-500',
    nodes: [
      {
        title: '50/30/20 Budget Rule & Calculator',
        description: 'Golden split for student allowance into 50% Needs, 30% Wants, and 20% Savings.',
        viewId: '50-30-20',
        tag: 'SRS 1.6.3',
        icon: LayoutDashboard,
      },
      {
        title: 'Budgeting Basics 101 & Interactive Quiz',
        description: 'Fixed vs. variable expenses, sample student budget table, and 5-question test.',
        viewId: 'budgeting-basics',
        tag: 'SRS 1.6.1',
        icon: BookOpen,
      },
      {
        title: 'Needs vs. Wants Decision Tree',
        description: 'Interactive item classifier and 4-step cool-off purchase guide.',
        viewId: 'needs-vs-wants',
        tag: 'SRS 1.6.2',
        icon: Shield,
      },
      {
        title: 'Savings Goals & Timeline Estimator',
        description: 'Calculate target amounts, monthly contributions, and estimated months to target.',
        viewId: 'savings-goals',
        tag: 'SRS 1.6.4',
        icon: Target,
      },
      {
        title: 'Student Expense Planner',
        description: 'Daily expense entries across 7 categories with live balance calculation.',
        viewId: 'expense-planner',
        tag: 'SRS 1.6.5',
        icon: FileSpreadsheet,
      },
      {
        title: 'Common Student Money Mistakes',
        description: 'Impulse buying, latte factor, and zombie subscriptions scenarios and solutions.',
        viewId: 'money-mistakes',
        tag: 'SRS 1.6.6',
        icon: Activity,
      },
      {
        title: 'Infographics & Learning Gallery',
        description: 'Original visual diagrams of budget cycles, compound interest, and saving challenges.',
        viewId: 'infographics',
        tag: 'SRS 1.6.7',
        icon: Sparkles,
      },
      {
        title: 'AI Chatbot Assistant (BudgetBee)',
        description: 'Rule-based and smart AI assistant with suggested student finance prompts.',
        viewId: 'ai-chatbot',
        tag: 'SRS 1.6.8',
        icon: Activity,
      },
      {
        title: 'Resource Search & Topic Filters',
        description: 'Search learning content by keyword, filter by topic, and sort by relevance.',
        viewId: 'search-resources',
        tag: 'SRS 1.6.9',
        icon: Search,
      },
      {
        title: 'Feedback, About Us & Inquiries',
        description: 'Client-side validated 5-star review form, contact information, and project scope.',
        viewId: 'feedback-contact',
        tag: 'SRS 1.6.10',
        icon: FileText,
      },
    ],
  },
  {
    domainId: 'core-deck',
    title: 'Core Deck',
    description: 'Executive liquidity, cash flow dynamics & real-time visual telemetry',
    icon: LayoutDashboard,
    accentColor: 'from-emerald-500 to-teal-500',
    nodes: [
      {
        title: 'Net Cash Flow & Executive KPIs',
        description: 'Single-source-of-truth closing balance, net cash position, and inflow velocity.',
        viewId: 'dashboard',
        tag: 'Live Telemetry',
        icon: LayoutDashboard,
      },
      {
        title: 'Cash-Flow Particle Stream & Waterfall',
        description: 'Interactive mathematical Sankey canvas mapping live ledger velocity across 50/30/20 streams.',
        viewId: 'cash-flow-engine',
        tag: 'Dual Hybrid',
        icon: Layers,
      },
      {
        title: '50/30/20 Capital Equilibrium Engine',
        description: 'Needs, Wants, and Savings partition calculator with variance alert sentinel.',
        viewId: 'dashboard',
        tag: 'Budget SSOT',
        icon: Activity,
      },
      {
        title: 'Dynamic Time Machine Simulation',
        description: 'Compound wealth velocity forward projection with Monte Carlo scenarios.',
        viewId: 'time-machine',
        tag: 'Simulator',
        icon: Sparkles,
      },
    ],
  },
  {
    domainId: 'gaap-ledger',
    title: 'GAAP Double-Entry Ledger',
    description: 'Institutional-grade accounting, debit-credit equality & audit trails',
    icon: BookOpen,
    accentColor: 'from-blue-500 to-indigo-500',
    nodes: [
      {
        title: 'General Journal & OCR Desk',
        description: 'Multimodal receipt scanner with atomic balance validation and automatic posting.',
        viewId: 'general-ledger',
        tag: 'Double-Entry',
        icon: BookOpen,
      },
      {
        title: 'Chart of Accounts Dynamic Trial Balance',
        description: 'Real-time equality verification of all 5 account classes with zero tolerance for variance.',
        viewId: 'general-ledger',
        tag: 'CPA Grade',
        icon: Scale,
      },
      {
        title: 'Real-Time Balance Sheet & Financial Statements',
        description: 'Categorized Asset, Liability, and Equity statement derived directly from journal entries.',
        viewId: 'general-ledger',
        tag: 'Statement',
        icon: FileSpreadsheet,
      },
      {
        title: 'Ledger Audit Trail & Integrity Sentinel',
        description: 'Cryptographically consistent journal sequencing with zero cloud exposure.',
        viewId: 'general-ledger',
        tag: 'Immutable',
        icon: Shield,
      },
    ],
  },
  {
    domainId: 'academic-suite',
    title: 'Academic Suite & Case Labs',
    description: 'Pedagogical finance simulators: Accounting, Costing, NPV/IRR & Tax',
    icon: GraduationCap,
    accentColor: 'from-purple-500 to-violet-500',
    nodes: [
      {
        title: 'Financial Accounting Interactive Lab',
        description: 'Interactive journal simulator with step-by-step T-Account visualization.',
        viewId: 'academic-suite',
        tag: 'Edu Lab',
        icon: GraduationCap,
      },
      {
        title: 'Cost & Management Variance Analyzer',
        description: 'Standard vs actual cost divergence calculations and break-even margin curves.',
        viewId: 'academic-suite',
        tag: 'Management',
        icon: Activity,
      },
      {
        title: 'Corporate Finance (NPV, IRR & DCF)',
        description: 'Discounted Cash Flow, Net Present Value, and Internal Rate of Return modeling engines.',
        viewId: 'academic-suite',
        tag: 'Valuation',
        icon: TrendingUp,
      },
      {
        title: 'Taxation & Regulatory Audit Sandbox',
        description: 'Withholding tax brackets, GST estimation, and deduction calculators.',
        viewId: 'academic-suite',
        tag: 'Tax Desk',
        icon: FileText,
      },
    ],
  },
  {
    domainId: 'commodities',
    title: 'Commodities & Real Assets',
    description: 'Gold, silver, platinum bullion valuations and localized daily bazaar indices',
    icon: Coins,
    accentColor: 'from-amber-500 to-orange-500',
    nodes: [
      {
        title: 'Precious Metals Bullion Vault (Gold / Silver / Pt)',
        description: 'Zero-discrepancy conversion between South Asian Tolas, Grams, and Troy Ounces.',
        viewId: 'dashboard',
        tag: 'Account 1060',
        icon: Coins,
      },
      {
        title: 'Daily Bazaar & Rashan Price Tracker',
        description: 'Per-unit staples index across 12+ cities with 1-tap quick expense logging.',
        viewId: 'daily-bazaar',
        tag: 'Local Bazaar',
        icon: Scale,
      },
      {
        title: 'Inflation & Purchasing Power Sentinel',
        description: 'Historical commodity purchasing power variance and wholesale arbitrage scanner.',
        viewId: 'bazaar-sentinel',
        tag: 'Price Radar',
        icon: Activity,
      },
    ],
  },
  {
    domainId: 'decentralized-banking',
    title: 'Decentralized & Peer Banking',
    description: 'Informal rotary savings circles, group ledger splits & IOU WhatsApp links',
    icon: Users,
    accentColor: 'from-cyan-500 to-blue-500',
    nodes: [
      {
        title: 'Kameti & Chit Fund Rotary Ledger',
        description: 'Rotary peer savings circle tracker with draw schedule, payout matrix, and dividend accounting.',
        viewId: 'split-ledger',
        tag: 'Rotary Dial',
        icon: Users,
      },
      {
        title: 'Peer-to-Peer IOU & Bill Splitter',
        description: 'Debt settlement coordinator with automated WhatsApp reminder generator.',
        viewId: 'split-ledger',
        tag: 'WhatsApp Sync',
        icon: ExternalLink,
      },
      {
        title: 'Impulse Buy Interceptor & 48h Lock',
        description: 'Psychological circuit breaker with cooling-off timer before non-essential outlays.',
        viewId: 'impulse-interceptor',
        tag: 'Behavioral',
        icon: Shield,
      },
    ],
  },
  {
    domainId: 'security-settings',
    title: 'Security, Vault & Settings',
    description: '24H bank statement generator, client-side encryption & persona studio',
    icon: Settings,
    accentColor: 'from-slate-500 to-zinc-600',
    nodes: [
      {
        title: '1-Click 24-Hour Bank Statement PDF Generator',
        description: 'Institutional-grade, audit-ready financial statement generated entirely in browser memory.',
        viewId: 'settings',
        tag: 'PDF Export',
        icon: FileText,
      },
      {
        title: 'AES-GCM 256-Bit Encrypted Vault Backup',
        description: 'Zero-cloud, PBKDF2-derived client-side vault export and restore from JSON.',
        viewId: 'settings',
        tag: 'Web Crypto',
        icon: Lock,
      },
      {
        title: 'Persona Architect Studio',
        description: 'Custom financial universe creator with bespoke income, expense, and currency presets.',
        viewId: 'dashboard',
        tag: 'Custom Persona',
        icon: Sparkles,
      },
    ],
  },
];

export const SiteMapModal: React.FC = () => {
  const { siteMapModalOpen, setSiteMapModalOpen, setActiveView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: ⌘M / Ctrl+M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setSiteMapModalOpen(!siteMapModalOpen);
      }
      if (e.key === 'Escape' && siteMapModalOpen) {
        setSiteMapModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [siteMapModalOpen, setSiteMapModalOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (siteMapModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [siteMapModalOpen]);

  // Filtered nodes based on query
  const filteredTopology = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SITE_MAP_TOPOLOGY;

    return SITE_MAP_TOPOLOGY.map((domain) => {
      const matchingNodes = domain.nodes.filter(
        (node) =>
          node.title.toLowerCase().includes(q) ||
          node.description.toLowerCase().includes(q) ||
          (node.tag && node.tag.toLowerCase().includes(q))
      );
      return {
        ...domain,
        nodes: matchingNodes,
      };
    }).filter((domain) => domain.nodes.length > 0);
  }, [searchQuery]);

  const handleNavigate = (viewId: string) => {
    playClickSound();
    setActiveView(viewId);
    setSiteMapModalOpen(false);
    playSuccessSound();
  };

  return (
    <AnimatePresence>
      {siteMapModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSiteMapModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[88vh] rounded-3xl
              bg-white/95 dark:bg-[#0A0E1A]/95 backdrop-blur-3xl
              border border-slate-200/90 dark:border-white/[0.12]
              shadow-[0_24px_64px_rgba(0,0,0,0.6)]
              flex flex-col overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/90 dark:border-white/[0.08] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25 shrink-0">
                  <Compass size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      AuraFinance OS Visual Site Map & Architecture Topology
                    </h2>
                    <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/25">
                      6 Domains • 21 Sub-Engines
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Explore the complete client-side system hierarchy or search to jump instantly.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSiteMapModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                title="Close (Esc or ⌘M)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Omnibox Filter Input */}
            <div className="px-5 py-3 border-b border-slate-200/90 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] flex items-center gap-2.5">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topology (e.g. 'Trial Balance', 'Sankey', 'Gold Tola', 'Kameti', 'NPV', 'PDF')..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Topology Tree Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
              {filteredTopology.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Compass size={36} className="mx-auto mb-2 opacity-40 animate-pulse" />
                  <p className="text-sm font-semibold">No matching modules or sub-engines found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try searching for 'General Journal', 'Precious Metals', or '50/30/20'
                  </p>
                </div>
              ) : (
                filteredTopology.map((domain) => {
                  const DomainIcon = domain.icon;
                  return (
                    <div key={domain.domainId} className="space-y-3">
                      {/* Domain Header */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${domain.accentColor} text-white flex items-center justify-center shadow-xs shrink-0`}
                        >
                          <DomainIcon size={14} />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                            {domain.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {domain.description}
                          </p>
                        </div>
                      </div>

                      {/* Domain Node Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 sm:pl-3 border-l-2 border-slate-200/80 dark:border-white/[0.08] ml-3.5">
                        {domain.nodes.map((node, nodeIdx) => {
                          const NodeIcon = node.icon;
                          return (
                            <div
                              key={nodeIdx}
                              onClick={() => handleNavigate(node.viewId)}
                              className="group p-3.5 rounded-2xl transition-all duration-200 cursor-pointer
                                bg-white/80 dark:bg-[#0D121E]/60 backdrop-blur-xl
                                border border-slate-200/90 dark:border-white/[0.08]
                                hover:border-slate-300 dark:hover:border-white/[0.2]
                                hover:shadow-md hover:-translate-y-0.5"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 group-hover:text-cyan-500 transition-colors">
                                    <NodeIcon size={14} />
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                    {node.title}
                                  </h4>
                                </div>
                                {node.tag && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                                    {node.tag}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal pl-8">
                                {node.description}
                              </p>
                              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold pl-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Jump to View</span>
                                <ArrowRight size={11} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Stage with Keyboard Hint */}
            <div className="px-5 py-3 border-t border-slate-200/90 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[10px] font-mono">
                  ⌘M
                </kbd>{' '}
                to open Site Map from anywhere
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                100% Client-Side Topology
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SiteMapModal;
