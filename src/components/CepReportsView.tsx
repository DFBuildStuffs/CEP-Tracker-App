import React, { useState } from 'react';
import { CEPExamRecord, UserAccount } from '../types';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';
import {
  ClipboardCheck,
  PlusCircle,
  Award,
  CheckCircle2,
  AlertCircle,
  Trash2,
  HelpCircle,
} from 'lucide-react';

interface Props {
  user: UserAccount;
  onAddRecord: (area: string, record: Omit<CEPExamRecord, 'id'>) => void;
  onDeleteLatestRecord: (area: string) => void;
}

export const CepReportsView: React.FC<Props> = ({ user, onAddRecord, onDeleteLatestRecord }) => {
  const theme = getProgramTheme(user.program);
  const [selectedArea, setSelectedArea] = useState<string>(user.areas[0] || '');
  const [items, setItems] = useState<string>('50');
  const [score, setScore] = useState<string>('');
  const [showRuleHelp, setShowRuleHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numItems = parseInt(items);
    const numScore = parseInt(score);

    if (isNaN(numItems) || numItems < 1) return;
    if (isNaN(numScore) || numScore < 0 || numScore > numItems) return;

    sound.playTap();

    const records = user.cepRecords[selectedArea] || [];
    let hasPassedInitial = false;
    records.forEach((rec) => {
      if (!hasPassedInitial && rec.pct >= user.passTarget) hasPassedInitial = true;
      else if (hasPassedInitial && rec.pct < user.maintTarget) hasPassedInitial = false;
    });

    const target = hasPassedInitial ? user.maintTarget : user.passTarget;
    const pct = Math.round((numScore / numItems) * 100);
    const isPass = pct >= target;

    const isSpecial = records.length >= 6;
    const specialIndex = isSpecial ? records.length - 5 : undefined;

    onAddRecord(selectedArea, {
      examNum: records.length + 1,
      isSpecial,
      specialIndex,
      items: numItems,
      score: numScore,
      pct,
      target,
      isPass,
      date: new Date().toISOString().split('T')[0],
    });

    setScore('');
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">CEP Exam Reports</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record official area exams with automatic passing target rules
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRuleHelp(!showRuleHelp)}
            className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Rules: {user.passTarget}% / {user.maintTarget}%</span>
          </button>
        </div>

        {/* Explain Rule Details */}
        {showRuleHelp && (
          <div className="mt-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
            <p className="font-bold text-blue-600 dark:text-blue-400">CEP Competency Evaluation Criteria:</p>
            <p>• <strong>Initial Pass Target:</strong> Must score at least <strong>{user.passTarget}%</strong> on an exam to qualify as passing.</p>
            <p>• <strong>Maintenance Target:</strong> Once passing has been achieved, subsequent exams only require <strong>{user.maintTarget}%</strong> to maintain pass status.</p>
            <p>• <strong>Conquering an Area:</strong> Complete all 6 scheduled exams with passing status maintained.</p>
          </div>
        )}
      </div>

      {/* Record Exam Result Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          Log Exam Result
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Select Area</label>
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
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Total Items</label>
            <input
              type="number"
              min="1"
              required
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="50"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Your Score</label>
            <input
              type="number"
              min="0"
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="38"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl ${theme.classes.accentBg} text-white font-bold text-sm shadow-lg ${theme.classes.buttonShadow} transition-all active:scale-98`}
            >
              Record Exam Score
            </button>
          </div>
        </form>
      </div>

      {/* CEP Area Trackers */}
      <div className="space-y-4">
        {user.areas.map((area) => {
          const records = user.cepRecords[area] || [];
          let hasPassedInitial = false;
          records.forEach((rec) => {
            if (!hasPassedInitial && rec.pct >= user.passTarget) hasPassedInitial = true;
            else if (hasPassedInitial && rec.pct < user.maintTarget) hasPassedInitial = false;
          });

          const isPassed = records.length >= 6 && hasPassedInitial;
          const isFailed = records.length >= 6 && !hasPassedInitial;
          const targetNext = hasPassedInitial ? user.maintTarget : user.passTarget;

          return (
            <div
              key={area}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                isPassed
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50 shadow-sm'
                  : isFailed
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {/* Header inside area card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{area}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {records.length} logged exam{records.length === 1 ? '' : 's'} • Target next: {targetNext}%
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {isPassed ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-sm">
                      <Award className="w-3.5 h-3.5" /> AREA CONQUERED 🎉
                    </span>
                  ) : isFailed ? (
                    <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" /> SPECIAL EXAM NEEDED
                    </span>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.classes.badge}`}>
                      Target: {targetNext}%
                    </span>
                  )}

                  {records.length > 0 && (
                    <button
                      onClick={() => onDeleteLatestRecord(area)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete latest recorded exam"
                      aria-label="Delete latest recorded exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Exam Bubbles Row */}
              <div className="flex items-center overflow-x-auto pb-2 pt-1 gap-2 sm:gap-3 scrollbar-none">
                {Array.from({ length: Math.max(6, records.length) }).map((_, idx) => {
                  const record = records[idx];
                  const label = idx < 6 ? `E${idx + 1}` : `S${idx - 5}`;

                  if (record) {
                    return (
                      <div key={idx} className="flex flex-col items-center flex-shrink-0 group relative">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-black text-xs sm:text-sm shadow-md transition-transform group-hover:scale-105 ${
                            record.isPass
                              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                              : 'bg-rose-500 text-white shadow-rose-500/20'
                          }`}
                        >
                          <span>{label}</span>
                        </div>
                        <span className="text-[11px] font-extrabold mt-1 text-slate-700 dark:text-slate-300">
                          {record.pct}%
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {record.score}/{record.items}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="flex flex-col items-center flex-shrink-0 opacity-45">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-400">
                        {label}
                      </div>
                      <span className="text-[11px] font-semibold mt-1 text-slate-400">-</span>
                      <span className="text-[9px] text-slate-400">-</span>
                    </div>
                  );
                })}
              </div>

              {isPassed && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Area successfully passed with valid benchmark requirements!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
