import React, { useState } from 'react';
import { ScheduledExam, UserAccount } from '../types';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';
import { Calendar, PlusCircle, Clock, Trash2, AlertCircle } from 'lucide-react';

interface Props {
  user: UserAccount;
  onAddExam: (exam: Omit<ScheduledExam, 'id'>) => void;
  onDeleteExam: (id: string) => void;
}

export const SchedulerView: React.FC<Props> = ({ user, onAddExam, onDeleteExam }) => {
  const theme = getProgramTheme(user.program);
  const [selectedArea, setSelectedArea] = useState<string>(user.areas[0] || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    sound.playTap();
    onAddExam({
      area: selectedArea,
      title: title.trim(),
      date,
      time: time || undefined,
    });

    setTitle('');
    setDate('');
    setTime('');
  };

  // Sort upcoming exams chronologically
  const sortedExams = [...user.exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCountdownLabel = (examDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examDateStr);
    examDate.setMinutes(examDate.getMinutes() + examDate.getTimezoneOffset());
    examDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Concluded', color: 'bg-slate-100 dark:bg-slate-800 text-slate-400' };
    if (diffDays === 0) return { label: 'Today!', color: 'bg-rose-500 text-white animate-pulse' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-amber-500 text-white' };
    return { label: `In ${diffDays} days`, color: theme.classes.badge };
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Exam Scheduler</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track upcoming mockboard dates, school examinations, and timeline milestones
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          Schedule New Exam
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
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Exam Title / Type</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mockboard 3, Departmental Midterms"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Time (Optional)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl ${theme.classes.accentBg} text-white font-bold text-sm shadow-lg ${theme.classes.buttonShadow} transition-all active:scale-98`}
            >
              Add to Schedule
            </button>
          </div>
        </form>
      </div>

      {/* Upcoming Exams List */}
      <div className="space-y-3">
        {sortedExams.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">No scheduled exams yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Plan your mockboard dates to receive countdown reminders.</p>
          </div>
        ) : (
          sortedExams.map((exam) => {
            const dateObj = new Date(exam.date);
            dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
            const countdown = getCountdownLabel(exam.date);

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  {/* Date badge */}
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center font-black flex-shrink-0 border border-blue-500/20">
                    <span className="text-[10px] uppercase tracking-wider font-bold">
                      {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl leading-none mt-0.5">{dateObj.getDate()}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate max-w-[160px]">
                        {exam.area}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${countdown.color}`}>
                        {countdown.label}
                      </span>
                    </div>
                    <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate mt-0.5">
                      {exam.title}
                    </h4>
                    {exam.time && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {exam.time}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    onDeleteExam(exam.id);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex-shrink-0"
                  aria-label="Delete scheduled exam"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
