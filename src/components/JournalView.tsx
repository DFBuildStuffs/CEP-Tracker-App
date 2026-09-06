import React, { useState, useMemo } from 'react';
import { JournalEntry, UserAccount } from '../types';
import { sound } from '../utils/sound';
import {
  BookOpen,
  PlusCircle,
  Search,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Tag,
} from 'lucide-react';

interface Props {
  user: UserAccount;
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onDeleteEntry: (id: string) => void;
}

export const JournalView: React.FC<Props> = ({ user, onAddEntry, onDeleteEntry }) => {
  const [selectedArea, setSelectedArea] = useState<string>(user.areas[0] || '');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [solution, setSolution] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !difficulty.trim() || !solution.trim()) return;

    sound.playTap();

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddEntry({
      area: selectedArea,
      topic: topic.trim(),
      difficulty: difficulty.trim(),
      solution: solution.trim(),
      tags: tags.length > 0 ? tags : undefined,
    });

    setTopic('');
    setDifficulty('');
    setSolution('');
    setTagsText('');
  };

  const filteredEntries = useMemo(() => {
    return user.journalEntries.filter((entry) => {
      const matchesArea = filterArea === 'all' || entry.area === filterArea;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        entry.topic.toLowerCase().includes(q) ||
        entry.difficulty.toLowerCase().includes(q) ||
        entry.solution.toLowerCase().includes(q) ||
        (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(q)));
      return matchesArea && matchesSearch;
    });
  }, [user.journalEntries, filterArea, searchQuery]);

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Engineering Journal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Document complex formulas, misconceptions, and verified exam solutions
            </p>
          </div>
        </div>
      </div>

      {/* New Journal Entry Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          New Learning Takeaway
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">CEP Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {user.areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Topic / Concept</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Kirchhoff's Laws / Soil Mechanics"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              Difficulties Encountered / Mistake Made
            </label>
            <textarea
              required
              rows={2}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              placeholder="What made this problem tricky or confusing?"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-medium text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              Correct Solution / Key Insight
            </label>
            <textarea
              required
              rows={2}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="What formula, unit check, or principle solves this consistently?"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-medium text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="w-full sm:w-80">
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Tags: Calculus, Electronics (comma separated)"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-98"
            >
              Save to Journal
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, formulas, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="w-full sm:w-auto p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Areas</option>
          {user.areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">No journal entries found</p>
            <p className="text-xs text-slate-400 mt-0.5">Record key difficulties and takeaways while studying.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px] border border-blue-500/20">
                      {entry.area}
                    </span>
                    <span className="text-xs text-slate-400">{entry.date}</span>
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white mt-1.5">{entry.topic}</h4>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    onDeleteEntry(entry.id);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Difficulties vs Solution Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Difficulties / Confusion
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {entry.difficulty}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                    <Lightbulb className="w-3.5 h-3.5" /> Verified Solution / Takeaway
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {entry.solution}
                  </p>
                </div>
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {entry.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
