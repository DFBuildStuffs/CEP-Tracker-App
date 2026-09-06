import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/sound';
import { Sparkles, Shuffle, Quote, Copy, Check } from 'lucide-react';

const DAILY_QUOTES = [
  { text: "Success is the sum of small efforts repeated day after day.", author: "Robert Collier" },
  { text: "Preparation today creates opportunities tomorrow.", author: "Board Exam Mantra" },
  { text: "Every page you master is a step closer to the professional engineering license.", author: "CEP Scholar" },
  { text: "Discipline is choosing what you want most over what you want now.", author: "Abraham Lincoln" },
  { text: "Stay focused; the reward of signing your name with 'Engr.' is worth every sacrifice.", author: "PRC Aspirant" },
  { text: "Progress, not perfection, is the goal of daily review.", author: "Mindset" },
  { text: "Believe in your preparation and trust your mathematical intuition.", author: "Engineering Faculty" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The more questions you solve today, the more confident you'll be on board exam day.", author: "Review Coach" },
  { text: "Consistency turns review dreams into licensed realities.", author: "Topnotcher Advice" },
  { text: "Difficult practice problems often lead to the highest board ratings.", author: "Reviewer Proverb" },
];

export const MotivationsView: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleNextQuote = () => {
    sound.playTap();
    let next;
    do {
      next = Math.floor(Math.random() * DAILY_QUOTES.length);
    } while (next === quoteIndex && DAILY_QUOTES.length > 1);
    setQuoteIndex(next);
  };

  const handleCopy = () => {
    const q = DAILY_QUOTES[quoteIndex];
    navigator.clipboard.writeText(`"${q.text}" — ${q.author}`);
    setCopied(true);
    sound.playTap();
    setTimeout(() => setCopied(false), 2000);
  };

  const current = DAILY_QUOTES[quoteIndex];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center relative overflow-hidden transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/20 shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Daily Motivations</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Fuel your determination. Maintain your study stamina for the board exams.
        </p>

        {/* Quote Box with AnimatePresence */}
        <div className="my-8 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 relative min-h-[160px] flex flex-col justify-center">
          <Quote className="w-8 h-8 text-blue-500/20 absolute top-4 left-4" />
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed italic">
                "{current.text}"
              </p>
              <p className="text-xs font-black text-blue-600 dark:text-blue-400 mt-4 uppercase tracking-wider">
                — {current.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleNextQuote}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all active:scale-98"
          >
            <Shuffle className="w-4 h-4" />
            <span>Inspire Me Again</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Quote'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
