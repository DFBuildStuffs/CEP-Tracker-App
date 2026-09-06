import React, { useState } from 'react';
import { UserAccount, ProgramType } from '../types';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';
import {
  GraduationCap,
  ArrowRight,
  Check,
  User,
  Trash2,
  LogIn,
  Layers,
  Percent,
  Plus,
  Minus,
} from 'lucide-react';

interface Props {
  savedUsers: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
  onCreateProfile: (newUser: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

const PROGRAM_DEFAULTS: Record<string, string[]> = {
  BSCE: [
    'Mathematics, Surveying & Transportation',
    'Hydraulics & Geotechnical Engineering',
    'Structural Engineering & Construction',
  ],
  BSABE: [
    'Agricultural Mechanization & Power',
    'Soil & Water Conservation Engineering',
    'Rural Electrification & Structures',
  ],
  BSECE: [
    'Mathematics & Basic Engineering',
    'Electronic Systems & Devices',
    'Telecommunications & Network Systems',
    'General Engineering & Applied Sciences',
  ],
  Custom: ['Area 1', 'Area 2', 'Area 3'],
};

export const InitialProfileCreationView: React.FC<Props> = ({
  savedUsers,
  onSelectUser,
  onCreateProfile,
  onDeleteUser,
}) => {
  // Create profile form fields
  const [username, setUsername] = useState('Engr. Dominic Cruz');
  const [program, setProgram] = useState<ProgramType>('BSECE');
  const [numAreas, setNumAreas] = useState<number>(4);
  const [areaNames, setAreaNames] = useState<string[]>(PROGRAM_DEFAULTS['BSECE']);
  const [passGrade, setPassGrade] = useState<number>(65);
  const [maintGrade, setMaintGrade] = useState<number>(45);
  const [formError, setFormError] = useState<string | null>(null);

  const theme = getProgramTheme(program);

  // When program changes, update default areas
  const handleProgramChange = (prog: ProgramType) => {
    setProgram(prog);
    const defaults = PROGRAM_DEFAULTS[prog] || ['Area 1', 'Area 2', 'Area 3'];
    setNumAreas(defaults.length);
    setAreaNames([...defaults]);
  };

  // Adjust number of areas dynamically
  const handleNumAreasChange = (newCount: number) => {
    const clamped = Math.min(8, Math.max(1, newCount));
    setNumAreas(clamped);

    const updated = [...areaNames];
    if (updated.length < clamped) {
      while (updated.length < clamped) {
        updated.push(`Area ${updated.length + 1}`);
      }
    } else if (updated.length > clamped) {
      updated.splice(clamped);
    }
    setAreaNames(updated);
  };

  const handleAreaNameChange = (index: number, val: string) => {
    const updated = [...areaNames];
    updated[index] = val;
    setAreaNames(updated);
  };

  // Form submission: proceed to home screen
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim()) {
      setFormError('Please enter your username.');
      return;
    }

    if (passGrade <= maintGrade) {
      setFormError('Passing grade target must be higher than maintaining grade target.');
      return;
    }

    if (areaNames.some((a) => !a.trim())) {
      setFormError('Please make sure all area names are filled in.');
      return;
    }

    sound.playMilestone();

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      userName: username.trim(),
      email: `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@cep.edu`,
      avatar: 'graduate',
      authProvider: 'local',
      program,
      passTarget: passGrade,
      maintTarget: maintGrade,
      pin: '123456',
      areas: areaNames.map((a) => a.trim()),
      themeMode: 'dark',
      studyHours: {},
      mockHours: {},
      cepRecords: {},
      journalEntries: [],
      exams: [],
      streak: { count: 1, lastStudyDate: Date.now() },
      hasCompletedAll: false,
      notifications: [
        {
          id: `welcome_${Date.now()}`,
          title: `Welcome, ${username.trim()}! 🎓`,
          message: `Your ${program} Competency Enhancement Program tracker is ready. Log study hours and record mock exams to conquer your board license.`,
          type: 'streak',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
      soundEnabled: true,
      pushEnabled: true,
    };

    areaNames.forEach((a) => {
      newUser.studyHours[a.trim()] = 0;
      newUser.mockHours[a.trim()] = 0;
      newUser.cepRecords[a.trim()] = [];
    });

    onCreateProfile(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 sm:p-6 py-10 selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* CEP Tracker Header & Tagline */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-2">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            CEP Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
            Competency Enhancement Program Licensure Examination Review & Progression Tracker
          </p>
        </div>

        {/* Create Profile Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-700/80 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Create Profile
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set up your board curriculum to proceed to your home screen
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              New Scholar
            </span>
          </div>

          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-bold text-center">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Engr. Dominic Cruz"
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-700 font-bold text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 2. Program */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Program
              </label>
              <select
                value={program}
                onChange={(e) => handleProgramChange(e.target.value as ProgramType)}
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-700 font-bold text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="BSCE">BSCE (Civil Engineering)</option>
                <option value="BSABE">BSABE (Agricultural & Biosystems Engineering)</option>
                <option value="BSECE">BSECE (Electronics Engineering)</option>
                <option value="Custom">Custom Engineering Track</option>
              </select>
            </div>

            {/* 3. Number of Areas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Number of Areas
                </label>
                <span className="text-xs font-black text-blue-400">
                  {numAreas} Subject Area{numAreas > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleNumAreasChange(numAreas - 1)}
                  disabled={numAreas <= 1}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min="1"
                  max="8"
                  value={numAreas}
                  onChange={(e) => handleNumAreasChange(parseInt(e.target.value) || 1)}
                  className="flex-1 p-3 rounded-2xl bg-slate-900 border border-slate-700 font-black text-center text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => handleNumAreasChange(numAreas + 1)}
                  disabled={numAreas >= 8}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4. Names of Areas */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Names of Areas
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {areaNames.map((area, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={area}
                      onChange={(e) => handleAreaNameChange(idx, e.target.value)}
                      placeholder={`Area ${idx + 1} Name`}
                      className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Passing and Maintaining Grade */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  Passing Grade (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={passGrade}
                  onChange={(e) => setPassGrade(parseInt(e.target.value) || 65)}
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 font-black text-center text-sm text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 block text-center mt-1">
                  Initial Pass Benchmark
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  Maintaining Grade (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={maintGrade}
                  onChange={(e) => setMaintGrade(parseInt(e.target.value) || 45)}
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 font-black text-center text-sm text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-500 block text-center mt-1">
                  Subsequent Exams Minimum
                </span>
              </div>
            </div>

            {/* Proceed to Home Screen Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all"
              >
                <span>Proceed to Home Screen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Existing Accounts Section (Allows instant login or deleting existing accounts) */}
        {savedUsers.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Or Sign In to an Existing Profile ({savedUsers.length})
              </h3>
              <span className="text-[10px] text-slate-500">Tap to load</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {savedUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    sound.playTap();
                    onSelectUser(u);
                  }}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                      {u.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-white truncate">{u.userName}</h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {u.program} • {u.areas.length} Areas • Pass: {u.passTarget}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-1">
                      <LogIn className="w-3 h-3" /> Login
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete profile for "${u.userName}"?`)) {
                          sound.playTap();
                          onDeleteUser(u.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete profile"
                      aria-label="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
