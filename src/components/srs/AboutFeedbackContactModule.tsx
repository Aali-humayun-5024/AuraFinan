// BudgetBasics — About Us, Feedback, and Contact Us Module
// Complies with TechWiz 7 SRS Section 1.6.10:
// - Information on website purpose and creators (TechWiz 7, Theme: NextGen BudgetBee)
// - Validated feedback form: name, email, rating (1-5 stars), comments
// - Contact details: email, phone, social links, validated contact form
// - Client-side validation only with prominent confirmation alerts

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  MessageSquare,
  Mail,
  Phone,
  Star,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Award,
  Send,
  Heart,
  Share2,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AboutFeedbackContactModule() {
  const [activeTab, setActiveTab] = useState<'about' | 'feedback' | 'contact'>('about');

  // Feedback Form State
  const [fbName, setFbName] = useState('');
  const [fbEmail, setFbEmail] = useState('');
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbCategory, setFbCategory] = useState('Usability');
  const [fbComments, setFbComments] = useState('');
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbSuccess, setFbSuccess] = useState<boolean>(false);

  // Contact Form State
  const [ctName, setCtName] = useState('');
  const [ctEmail, setCtEmail] = useState('');
  const [ctSubject, setCtSubject] = useState('');
  const [ctMessage, setCtMessage] = useState('');
  const [ctError, setCtError] = useState<string | null>(null);
  const [ctSuccess, setCtSuccess] = useState<boolean>(false);

  // Validate Email
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle Feedback Submission (Client-Side Validation Only as per SRS 1.6.10)
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFbError(null);

    if (!fbName.trim()) {
      setFbError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(fbEmail)) {
      setFbError('Please provide a valid email address.');
      return;
    }
    if (!fbComments.trim()) {
      setFbError('Please write your thoughts or suggestions in the comments box.');
      return;
    }

    setFbSuccess(true);
    confetti({ particleCount: 60, spread: 60 });
    setTimeout(() => {
      setFbName('');
      setFbEmail('');
      setFbComments('');
      setFbSuccess(false);
    }, 4000);
  };

  // Handle Contact Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCtError(null);

    if (!ctName.trim()) {
      setCtError('Please enter your name.');
      return;
    }
    if (!isValidEmail(ctEmail)) {
      setCtError('Please enter a valid email address.');
      return;
    }
    if (!ctMessage.trim()) {
      setCtError('Please enter your message.');
      return;
    }

    setCtSuccess(true);
    setTimeout(() => {
      setCtName('');
      setCtEmail('');
      setCtSubject('');
      setCtMessage('');
      setCtSuccess(false);
    }, 4000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          <Info size={14} /> Community & Contact
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About Us, Feedback & Student Inquiries
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Learn about the vision behind BudgetBasics, provide peer feedback to improve the educational platform, or connect directly with our developer team.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'about'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300'
            }`}
          >
            <Award size={14} /> About BudgetBasics
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'feedback'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300'
            }`}
          >
            <MessageSquare size={14} /> Rate & Feedback
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'contact'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300'
            }`}
          >
            <Mail size={14} /> Contact Us
          </button>
        </div>
      </div>

      {/* TAB 1: ABOUT US */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-2xl">
                🐝
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  BudgetBasics — NextGen BudgetBee
                </h2>
                <p className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Personal Finance & Budgeting Platform
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>BudgetBasics</strong> was conceived to solve a critical real-world dilemma: millions of students begin handling pocket allowances, university stipends, or part-time earnings without a clear, relatable mental framework to track where their money goes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-cyan-600 font-bold uppercase">Mission</span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Student Literacy</h4>
                <p className="text-[11px] text-slate-500">Demystify budgeting through interactive calculators, visual trees, and games.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Architecture</span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Single Page App</h4>
                <p className="text-[11px] text-slate-500">Zero backend server or login friction—runs 100% locally inside the browser.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-amber-600 font-bold uppercase">Standards</span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">50/30/20 Standard</h4>
                <p className="text-[11px] text-slate-500">Strict mathematical alignment with recognized personal wealth principles.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VALIDATED FEEDBACK FORM */}
      {activeTab === 'feedback' && (
        <form
          onSubmit={handleFeedbackSubmit}
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 space-y-5 shadow-xs"
        >
          <div className="border-b border-slate-100 dark:border-white/5 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-500" />
              Submit Student Feedback
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rate your learning experience and help us refine our educational modules.
            </p>
          </div>

          {fbError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold">
              <AlertTriangle size={15} /> {fbError}
            </div>
          )}

          {fbSuccess && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 size={18} />
              <span>Thank you! Your feedback has been validated successfully and logged in your browser session.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fbName}
                onChange={(e) => setFbName(e.target.value)}
                placeholder="e.g. Aali Humayun"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={fbEmail}
                onChange={(e) => setFbEmail(e.target.value)}
                placeholder="e.g. student@university.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
              />
            </div>

            {/* Rating Stars */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Overall Experience Rating (1 - 5 Stars)
              </label>
              <div className="flex items-center gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFbRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      size={20}
                      className={star <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 ms-2">
                  {fbRating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Feedback Category</label>
              <select
                value={fbCategory}
                onChange={(e) => setFbCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
              >
                <option value="Usability">Usability & Ease of Understanding</option>
                <option value="50/30/20 Calculator">50/30/20 Budget Calculator</option>
                <option value="Interactive Games">Needs vs Wants Game</option>
                <option value="Visual Infographics">Visual Infographics</option>
                <option value="Feature Suggestion">Feature Suggestion</option>
              </select>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Detailed Comments & Suggestions <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={fbComments}
              onChange={(e) => setFbComments(e.target.value)}
              placeholder="Tell us what you liked, what was confusing, or what topic we should add next..."
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={14} /> Submit Validated Feedback
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CONTACT US */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Details Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Contact Channels</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Have questions regarding student finance curriculum or project specifications?
            </p>

            <div className="space-y-3 text-xs pt-2">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Mail size={16} className="text-amber-500 shrink-0" />
                <span className="font-mono">support@budgetbasics.edu</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Phone size={16} className="text-emerald-500 shrink-0" />
                <span className="font-mono">+1 (800) 555-BUDGET</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Globe size={16} className="text-cyan-500 shrink-0" />
                <span>NextGen BudgetBee Portal</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Social Media Links:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="#portal"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
                  title="Web Portal"
                >
                  <Globe size={16} />
                </a>
                <a
                  href="#share"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
                  title="Share Platform"
                >
                  <Share2 size={16} />
                </a>
                <a
                  href="#community"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
                  title="Student Community"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <form
            onSubmit={handleContactSubmit}
            className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 space-y-4 shadow-xs"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Send Us a Direct Message</h3>

            {ctError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold">
                <AlertTriangle size={15} /> {ctError}
              </div>
            )}

            {ctSuccess && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 size={18} />
                <span>Message validated! In this client-side educational SPA, your inquiry has been simulated successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  value={ctName}
                  onChange={(e) => setCtName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={ctEmail}
                  onChange={(e) => setCtEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject</label>
              <input
                type="text"
                value={ctSubject}
                onChange={(e) => setCtSubject(e.target.value)}
                placeholder="Inquiry Subject"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                rows={3}
                value={ctMessage}
                onChange={(e) => setCtMessage(e.target.value)}
                placeholder="How can our student team assist you?"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} /> Send Message
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
