import React from 'react';
import { UserAccount } from '../types';
import { TabId } from './BottomTabBar';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';
import {
  Play,
  ClipboardCheck,
  BarChart3,
  Clock,
  Trophy,
  Flame,
  Calendar,
  ArrowRight,
  Sparkles,
  Bot,
  UserPlus,
  LogIn,
  KeyRound,
} from 'lucide-react';
import { GoogleIcon } from './GoogleAuthAccountModal';

interface Props {
  user: UserAccount;
  onNavigate: (tab: TabId) => void;
  onOpenNotifications: () => void;
  onOpenAccountModal?: (initialMode?: 'select' | 'create' | 'login') => void;
}

export const HomeView: React.FC<Props> = ({
  user,
  onNavigate,
  onOpenAccountModal,
}) => {
  const theme = getProgramTheme(user.program);

  // Compute hours and passed areas
  let totalStudy = 0;
  let totalMock = 0;
  let passedAreasCount = 0;

  user.areas.forEach((area) => {
    totalStudy += user.studyHours[area] || 0;
    totalMock += user.mockHours[area] || 0;

    const records = user.cepRecords[area] || [];
    let hasPassedInitial = false;
    records.forEach((rec) => {
      if (!hasPassedInitial && rec.pct >= user.passTarget) hasPassedInitial = true;
      else if (hasPassedInitial && rec.pct < user.maintTarget) hasPassedInitial = false;
    });
    if (records.length >= 6 && hasPassedInitial) {
      passedAreasCount++;
    }
  });

  const totalHours = (totalStudy + totalMock).toFixed(1);

  // Find next upcoming exam
  const sortedExams = [...user.exams]
    .filter((e) => new Date(e.date).getTime() >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextExam = sortedExams[0];

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Card */}
      <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${theme.classes.heroCardBg}`}>
        <div className={`absolute top-0 right-0 w-80 h-80 ${theme.classes.heroOrb} rounded-full blur-3xl pointer-events-none`} />

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.classes.badge}`}>
              <Sparkles className="w-3.5 h-3.5" />
              {theme.code} Track
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Hello, {user.userName}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-300 mt-2 max-w-lg leading-relaxed">
            {theme.subTitle}. Track study intervals, log area examinations, explore interactive analytics, and conquer your board milestones.
          </p>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => {
                sound.playTap();
                onNavigate('timer');
              }}
              className={`px-6 py-3 rounded-2xl ${theme.classes.accentBg} font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg ${theme.classes.buttonShadow} transition-all active:scale-98`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Review Session</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onNavigate('reports');
              }}
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-colors"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-300" />
              <span>Log Exam Score</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onNavigate('analytics');
              }}
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-sky-300" />
              <span>Interactive Visuals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Hours */}
        <div
          onClick={() => {
            sound.playTap();
            onNavigate('analytics');
          }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-700 cursor-pointer transition-all flex items-center space-x-4"
        >
          <div className={`w-14 h-14 rounded-2xl ${theme.classes.accentBgSubtle} flex items-center justify-center font-bold flex-shrink-0`}>
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Logged Time</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{totalHours} hrs</span>
            <span className="text-[10px] font-semibold text-slate-500">Study + Mockboards</span>
          </div>
        </div>

        {/* CEP Conquered Progress */}
        <div
          onClick={() => {
            sound.playTap();
            onNavigate('reports');
          }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 cursor-pointer transition-all flex items-center space-x-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-500/20">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Areas Conquered</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
              {passedAreasCount} / {user.areas.length} Passed
            </span>
            <span className="text-[10px] font-semibold text-slate-500">All 6 exams passed</span>
          </div>
        </div>

        {/* Daily Streak */}
        <div
          onClick={() => {
            sound.playTap();
            onNavigate('timer');
          }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-500/50 cursor-pointer transition-all flex items-center space-x-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold flex-shrink-0 border border-orange-500/20">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Study Streak</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
              {user.streak.count} Day{user.streak.count === 1 ? '' : 's'}
            </span>
            <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">Keep flame alive 🔥</span>
          </div>
        </div>
      </div>

      {/* Gemini AI Coach Quick Banner */}
      <div
        onClick={() => {
          sound.playTap();
          onNavigate('gemini');
        }}
        className="bg-gradient-to-r from-blue-900/10 via-emerald-900/10 to-orange-900/10 dark:from-blue-950/40 dark:via-emerald-950/40 dark:to-orange-950/40 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-sm group"
      >
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-2xl ${theme.classes.accentBgSubtle} flex items-center justify-center font-bold flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.classes.badge}`}>
                Gemini AI Assistant
              </span>
              <span className="text-xs font-semibold text-slate-400">Have questions?</span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate mt-0.5">
              Ask your {theme.code} Board Exam & CEP Coach
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Instant step-by-step math, formula derivations, and passing strategy review
            </p>
          </div>
        </div>

        <button
          type="button"
          className={`px-4 py-2.5 rounded-xl ${theme.classes.accentBg} text-xs font-extrabold text-white shadow-sm flex items-center gap-1.5 flex-shrink-0`}
        >
          <span>Ask</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Profile Management Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-2xl ${theme.classes.accentBg} text-white flex items-center justify-center flex-shrink-0 shadow-md font-bold`}>
            {user.userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                Active Profile
              </span>
              <span className="text-xs text-slate-400 font-semibold">{user.program} Track</span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate mt-0.5">
              {user.userName}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              Target Pass: {user.passTarget}% • Maint: {user.maintTarget}% • {user.areas.length} Areas
            </p>
          </div>
        </div>

        {/* Action Button: Manage Profile & Switch Account */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              if (onOpenAccountModal) onOpenAccountModal();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-blue-500" />
            <span>Manage Profile & Accounts</span>
          </button>
        </div>
      </div>

      {/* Next Upcoming Exam Notice if present */}
      {nextExam && (
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 rounded-3xl p-5 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl ${theme.classes.accentBg} flex items-center justify-center font-bold flex-shrink-0 shadow-md ${theme.classes.buttonShadow}`}>
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.classes.accentBg}`}>
                  Next Exam
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{nextExam.date}</span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate mt-0.5">
                {nextExam.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{nextExam.area}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onNavigate('scheduler');
            }}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-extrabold text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-1 flex-shrink-0"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CEP Area Mastery List Snapshot */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">CEP Area Progress</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Exam status across your board subjects</p>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onNavigate('reports');
            }}
            className={`text-xs font-bold ${theme.classes.accentText} hover:underline flex items-center gap-1`}
          >
            <span>All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {user.areas.map((area) => {
            const records = user.cepRecords[area] || [];
            let hasPassedInitial = false;
            records.forEach((rec) => {
              if (!hasPassedInitial && rec.pct >= user.passTarget) hasPassedInitial = true;
              else if (hasPassedInitial && rec.pct < user.maintTarget) hasPassedInitial = false;
            });
            const isPassed = records.length >= 6 && hasPassedInitial;
            const progressPct = Math.min(100, Math.round((records.length / 6) * 100));

            return (
              <div
                key={area}
                onClick={() => {
                  sound.playTap();
                  onNavigate('reports');
                }}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md">
                    {area}
                  </span>
                  {isPassed ? (
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Conquered 🎉</span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">{records.length} / 6 Exams</span>
                  )}
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isPassed ? theme.classes.progressBarConquered : theme.classes.progressBar}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
