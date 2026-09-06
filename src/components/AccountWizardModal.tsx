import React, { useState } from 'react';
import { UserAccount, ProgramType } from '../types';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Lock,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: (newUser: UserAccount) => void;
}

const PROGRAM_DEFAULTS: Record<string, string[]> = {
  BSABE: [
    'Agricultural Mechanization & Power',
    'Soil & Water Conservation Engineering',
    'Rural Electrification & Structures',
  ],
  BSCE: [
    'Mathematics, Surveying & Transportation',
    'Hydraulics & Geotechnical Engineering',
    'Structural Engineering & Construction',
  ],
  BSECE: [
    'Mathematics & Basic Engineering',
    'Electronic Systems & Devices',
    'Telecommunications & Network Systems',
    'General Engineering & Applied Sciences',
  ],
  Custom: ['Area 1', 'Area 2', 'Area 3'],
};

export const AccountWizardModal: React.FC<Props> = ({ isOpen, onClose, onCreateAccount }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [program, setProgram] = useState<ProgramType>('BSECE');
  const [passTarget, setPassTarget] = useState<number>(65);
  const [maintTarget, setMaintTarget] = useState<number>(45);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [numAreas, setNumAreas] = useState<number>(4);
  const [areaNames, setAreaNames] = useState<string[]>(PROGRAM_DEFAULTS['BSECE']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTheme = getProgramTheme(program);

  const handleProgramChange = (prog: ProgramType) => {
    setProgram(prog);
    const defaults = PROGRAM_DEFAULTS[prog] || ['Area 1', 'Area 2', 'Area 3'];
    setNumAreas(defaults.length);
    setAreaNames(defaults);
  };

  const handleNextFromStep1 = () => {
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage('Please enter your scholar name.');
      return;
    }
    if (passTarget <= maintTarget) {
      setErrorMessage('Passing target must be strictly greater than maintenance target.');
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setErrorMessage('PIN must be exactly 6 numeric digits.');
      return;
    }
    if (pin !== pinConfirm) {
      setErrorMessage('PIN confirmation does not match.');
      return;
    }

    sound.playTap();
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    sound.playTap();
    const current = [...areaNames];
    if (current.length < numAreas) {
      while (current.length < numAreas) {
        current.push(`Area ${current.length + 1}`);
      }
    } else if (current.length > numAreas) {
      current.splice(numAreas);
    }
    setAreaNames(current);
    setStep(3);
  };

  const handleAreaNameChange = (idx: number, val: string) => {
    const updated = [...areaNames];
    updated[idx] = val;
    setAreaNames(updated);
  };

  const handleFinalize = () => {
    if (areaNames.some((a) => !a.trim())) {
      setErrorMessage('Please name all areas.');
      return;
    }

    sound.playMilestone();

    const newAccount: UserAccount = {
      id: `user_${Date.now()}`,
      userName: name.trim(),
      avatar: 'graduate',
      program,
      passTarget,
      maintTarget,
      pin,
      areas: areaNames.map((a) => a.trim()),
      themeMode: 'dark',
      studyHours: {},
      mockHours: {},
      cepRecords: {},
      journalEntries: [],
      exams: [],
      streak: { count: 0, lastStudyDate: null },
      hasCompletedAll: false,
      notifications: [
        {
          id: `welcome_${Date.now()}`,
          title: 'Welcome to your CEP Tracker! 🎓',
          message: `Best of luck with your review, ${name.trim()}! Log sessions and hit milestones.`,
          type: 'pass_initial',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
      soundEnabled: true,
      pushEnabled: true,
    };

    areaNames.forEach((a) => {
      newAccount.studyHours[a] = 0;
      newAccount.mockHours[a] = 0;
      newAccount.cepRecords[a] = [];
    });

    onCreateAccount(newAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-blue-600' : s < step ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 text-center">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: Basic Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Create Scholar Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Initialize your board exam tracking space</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Scholar's Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Engineering Program
              </label>
              <select
                value={program}
                onChange={(e) => handleProgramChange(e.target.value as ProgramType)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BSCE">BSCE (Civil Engineering)</option>
                <option value="BSABE">BSABE (Agricultural & Biosystems Engineering)</option>
                <option value="BSECE">BSECE (Electronics Engineering)</option>
                <option value="Custom">Custom Engineering Program</option>
              </select>

              {/* Program Track Indicator */}
              <div className="mt-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${currentTheme.classes.badgeDot}`} />
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    {currentTheme.displayName}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Curriculum Track
                </span>
              </div>
            </div>

            {/* Benchmark Targets */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Passing Target (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={passTarget}
                  onChange={(e) => setPassTarget(parseInt(e.target.value) || 65)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-black text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Maint. Target (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maintTarget}
                  onChange={(e) => setMaintTarget(parseInt(e.target.value) || 45)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-black text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* PIN Security */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-500" /> 6-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-black text-base tracking-widest text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Confirm PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-black text-base tracking-widest text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleNextFromStep1}
              className="w-full mt-4 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all"
            >
              <span>Continue to Areas Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Number of Areas */}
        {step === 2 && (
          <div className="space-y-6">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">How Many Areas?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select the number of board exam subjects you need to conquer
              </p>
            </div>

            <div className="py-6 text-center">
              <input
                type="number"
                min="1"
                max="8"
                value={numAreas}
                onChange={(e) => setNumAreas(Math.min(8, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-32 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 text-center font-black text-4xl text-blue-600 dark:text-blue-400 mx-auto block shadow-inner"
              />
              <span className="text-xs font-bold text-slate-400 mt-2 block">Areas required (1 - 8)</span>
            </div>

            <button
              onClick={handleNextFromStep2}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all"
            >
              <span>Next: Customize Area Names</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: Customize Area Names */}
        {step === 3 && (
          <div className="space-y-4">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="text-center mb-3">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Name Your CEP Areas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pre-filled with standard board subjects for {program}
              </p>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {areaNames.map((area, idx) => (
                <div key={idx}>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Area {idx + 1}
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => handleAreaNameChange(idx, e.target.value)}
                    placeholder={`e.g. Subject ${idx + 1}`}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleFinalize}
              className="w-full mt-4 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Initialize CEP Tracker</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
