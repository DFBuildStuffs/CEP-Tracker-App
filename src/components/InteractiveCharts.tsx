import React, { useState, useMemo } from 'react';
import { UserAccount } from '../types';
import { getProgramTheme } from '../utils/programTheme';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, Clock, Filter, Award, CheckCircle2 } from 'lucide-react';

interface Props {
  user: UserAccount;
}

export const InteractiveCharts: React.FC<Props> = ({ user }) => {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [timeViewMode, setTimeViewMode] = useState<'both' | 'study' | 'mock'>('both');

  const theme = getProgramTheme(user.program);
  const isDark = user.themeMode === 'dark';

  // Compute overall CEP completion statistics
  const stats = useMemo(() => {
    let totalExams = 0;
    let passedExams = 0;
    let areasCompleted = 0;
    let totalStudy = 0;
    let totalMock = 0;

    user.areas.forEach((area) => {
      const records = user.cepRecords[area] || [];
      totalExams += records.length;
      records.forEach((r) => {
        if (r.isPass) passedExams++;
      });

      // Area pass check
      let hasPassedInitial = false;
      records.forEach((rec) => {
        if (!hasPassedInitial && rec.pct >= user.passTarget) hasPassedInitial = true;
        else if (hasPassedInitial && rec.pct < user.maintTarget) hasPassedInitial = false;
      });
      if (records.length >= 6 && hasPassedInitial) {
        areasCompleted++;
      }

      totalStudy += user.studyHours[area] || 0;
      totalMock += user.mockHours[area] || 0;
    });

    const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
    const readinessScore = Math.min(
      100,
      Math.round(
        (areasCompleted / Math.max(1, user.areas.length)) * 50 +
          (passRate / 100) * 30 +
          Math.min(20, (totalStudy / 50) * 20)
      )
    );

    return {
      totalExams,
      passedExams,
      passRate,
      areasCompleted,
      totalAreas: user.areas.length,
      totalStudy: totalStudy.toFixed(1),
      totalMock: totalMock.toFixed(1),
      readinessScore,
    };
  }, [user]);

  // Transform exam data for Recharts Trendline
  const progressionData = useMemo(() => {
    const maxExamIndex = 8;
    const points: Array<{
      examLabel: string;
      [key: string]: number | string | null;
    }> = [];

    for (let i = 1; i <= maxExamIndex; i++) {
      const label = i <= 6 ? `Exam ${i}` : `Special ${i - 6}`;
      const row: { examLabel: string; [key: string]: number | string | null } = { examLabel: label };

      let hasAnyData = false;
      user.areas.forEach((area) => {
        if (selectedArea !== 'all' && selectedArea !== area) return;
        const records = user.cepRecords[area] || [];
        const record = records[i - 1];
        if (record) {
          row[area] = record.pct;
          hasAnyData = true;
        } else {
          row[area] = null;
        }
      });

      if (hasAnyData) {
        points.push(row);
      }
    }

    return points;
  }, [user, selectedArea]);

  // Hours comparison chart data
  const hoursData = useMemo(() => {
    return user.areas.map((area) => {
      const shortName = area.length > 18 ? area.substring(0, 16) + '…' : area;
      return {
        name: shortName,
        fullName: area,
        studyHours: Number((user.studyHours[area] || 0).toFixed(1)),
        mockHours: Number((user.mockHours[area] || 0).toFixed(1)),
        total: Number(((user.studyHours[area] || 0) + (user.mockHours[area] || 0)).toFixed(1)),
      };
    });
  }, [user]);

  // Program-specific color lines for progression chart
  const programPalette = useMemo(() => {
    switch (theme.code) {
      case 'BSCE':
        // Orange / Black / Yellow combinations
        return ['#f97316', '#eab308', '#ea580c', '#ca8a04', '#c2410c', '#facc15'];
      case 'BSABE':
        // Shades of Green & White combinations
        return ['#059669', '#10b981', '#34d399', '#047857', '#15803d', '#6ee7b7'];
      case 'BSECE':
      default:
        // Shades of Blue & Black combinations
        return ['#2563eb', '#0284c7', '#38bdf8', '#1d4ed8', '#4338ca', '#60a5fa'];
    }
  }, [theme.code]);

  const studyBarColor = theme.chartColors.studyBar;
  const mockBarColor = theme.chartColors.mockBar;

  const tooltipStyle = isDark
    ? {
        backgroundColor: '#090d16',
        borderColor: '#334155',
        borderRadius: '1rem',
        color: '#f8fafc',
        fontSize: '12px',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
      }
    : {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderRadius: '1rem',
        color: '#0f172a',
        fontSize: '12px',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      };

  return (
    <div className="space-y-6 pb-6">
      {/* Top Header Card */}
      <div className={`rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden ${theme.classes.heroCardBg}`}>
        <div className={`absolute -right-6 -bottom-6 w-40 h-40 ${theme.classes.heroOrb} rounded-full blur-2xl pointer-events-none`} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full ${theme.classes.badge} text-xs font-bold uppercase tracking-wider mb-2`}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{theme.code} Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Board Exam Analytics</h2>
            <p className="text-slate-200 dark:text-slate-300 text-xs sm:text-sm mt-1 max-w-lg">
              {theme.displayName} competency tracking across all CEP areas, performance curves, and time investments.
            </p>
          </div>

          {/* Readiness Gauge Widget */}
          <div className="bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-4 flex items-center space-x-4 min-w-[190px]">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-current transition-all duration-1000 ease-out"
                  style={{ color: theme.secondaryHex }}
                  strokeDasharray={`${stats.readinessScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-black text-sm text-white">{stats.readinessScore}%</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 block">Readiness</span>
              <span className="text-base font-extrabold text-white">
                {stats.readinessScore >= 80 ? 'Mastery 🔥' : stats.readinessScore >= 50 ? 'On Track 📈' : 'Building Up 💪'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 dark:bg-black/30 rounded-2xl p-3">
            <span className="text-[10px] font-bold uppercase text-white/70 block">Areas Conquered</span>
            <span className="text-xl font-black text-white">
              {stats.areasCompleted} / {stats.totalAreas}
            </span>
          </div>
          <div className="bg-white/10 dark:bg-black/30 rounded-2xl p-3">
            <span className="text-[10px] font-bold uppercase text-white/70 block">Passing Rate</span>
            <span className="text-xl font-black text-white">{stats.passRate}%</span>
          </div>
          <div className="bg-white/10 dark:bg-black/30 rounded-2xl p-3">
            <span className="text-[10px] font-bold uppercase text-white/70 block">Study Hours</span>
            <span className="text-xl font-black text-white">{stats.totalStudy}h</span>
          </div>
          <div className="bg-white/10 dark:bg-black/30 rounded-2xl p-3">
            <span className="text-[10px] font-bold uppercase text-white/70 block">Mockboard Drill</span>
            <span className="text-xl font-black text-white">{stats.totalMock}h</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Progression Curve (Exams 1 to 6+) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Award className={`w-5 h-5 ${theme.classes.accentText}`} />
              Score Progression Curve (%)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target Pass ({user.passTarget}%) and Retention Maintenance ({user.maintTarget}%) lines
            </p>
          </div>

          {/* Area Filter Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All CEP Areas</option>
              {user.areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {progressionData.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <TrendingUp className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-xs font-bold">No exam scores logged yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Log scores in the Reports tab to plot your progression curve.</p>
          </div>
        ) : (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData} margin={{ top: 10, right: 25, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} />
                <XAxis dataKey="examLabel" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: number | string | null, name: string) => [
                    typeof val === 'number' ? `${val}%` : 'N/A',
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {/* Target Benchmarks */}
                <ReferenceLine
                  y={user.passTarget}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: `Pass ${user.passTarget}%`, fill: '#10b981', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={user.maintTarget}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: `Maint ${user.maintTarget}%`, fill: '#f59e0b', fontSize: 10, position: 'right' }}
                />

                {user.areas
                  .filter((a) => selectedArea === 'all' || selectedArea === a)
                  .map((area, idx) => (
                    <Line
                      key={area}
                      type="monotone"
                      dataKey={area}
                      name={area}
                      stroke={programPalette[idx % programPalette.length]}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#0f172a' : '#ffffff' }}
                      activeDot={{ r: 7 }}
                      connectNulls
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart 2: Time Investment Breakdown (Study vs Mockboard) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className={`w-5 h-5 ${theme.classes.accentText}`} />
              Time Allocation by Area (Hours)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare focus hours vs simulated mockboard exam drills
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setTimeViewMode('both')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeViewMode === 'both'
                  ? `${theme.classes.accentBg} shadow-sm`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setTimeViewMode('study')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeViewMode === 'study'
                  ? `${theme.classes.accentBg} shadow-sm`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Study
            </button>
            <button
              onClick={() => setTimeViewMode('mock')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeViewMode === 'mock'
                  ? `${theme.classes.accentBg} shadow-sm`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mock
            </button>
          </div>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hoursData} margin={{ top: 10, right: 15, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} />
              <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} angle={-15} textAnchor="end" />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val: number | string | null, name: string) => [
                  typeof val === 'number' ? `${val} hrs` : val,
                  name === 'studyHours' ? 'Study Hours' : 'Mockboard Hours',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {(timeViewMode === 'both' || timeViewMode === 'study') && (
                <Bar dataKey="studyHours" name="Study Hours" fill={studyBarColor} radius={[6, 6, 0, 0]} />
              )}
              {(timeViewMode === 'both' || timeViewMode === 'mock') && (
                <Bar dataKey="mockHours" name="Mockboard Hours" fill={mockBarColor} radius={[6, 6, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Mastery Cards Grid */}
      <div>
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Award className={`w-4 h-4 ${theme.classes.accentText}`} />
          Area Mastery Snapshot
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.areas.map((area) => {
            const records = user.cepRecords[area] || [];
            let hasPassedInitial = false;
            records.forEach((rec) => {
              if (!hasPassedInitial && rec.pct >= user.passTarget) hasPassedInitial = true;
              else if (hasPassedInitial && rec.pct < user.maintTarget) hasPassedInitial = false;
            });
            const isPassed = records.length >= 6 && hasPassedInitial;
            const avgScore =
              records.length > 0
                ? Math.round(records.reduce((acc, r) => acc + r.pct, 0) / records.length)
                : 0;

            return (
              <div
                key={area}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                      {area}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {records.length} / 6 Exams Logged
                    </span>
                  </div>
                  {isPassed ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Passed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold flex-shrink-0">
                      In Progress
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">Avg. Score:</span>
                  <span
                    className={`font-black ${
                      avgScore >= user.passTarget
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : avgScore >= user.maintTarget
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {avgScore}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isPassed ? theme.classes.progressBarConquered : theme.classes.progressBar
                    }`}
                    style={{ width: `${Math.min(100, Math.round((records.length / 6) * 100))}%` }}
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
