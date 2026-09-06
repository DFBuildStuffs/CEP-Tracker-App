import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  User,
  Plus,
  ShieldCheck,
  Trash2,
  KeyRound,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  activeUserId: string | null;
  initialMode?: 'select' | 'create' | 'login';
  onSelectUser: (user: UserAccount) => void;
  onCreateAccount: (newUser: UserAccount) => void;
  onDeleteAccount: (userId: string) => void;
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

// Official Google G SVG icon
export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const GoogleAuthAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  initialMode = 'select',
  onSelectUser,
  onCreateAccount,
  onDeleteAccount,
}) => {
  // Navigation mode: 'select' (choice between Create vs Login), 'create' (wizard), 'login' (account list), 'pin' (verify pin)
  const [mode, setMode] = useState<'select' | 'create' | 'login' | 'pin'>(initialMode);
  const [selectedUserForPin, setSelectedUserForPin] = useState<UserAccount | null>(null);

  // PIN Entry state for login
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinErrorMessage, setPinErrorMessage] = useState('');

  // Create Account Wizard States
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [googleEmail, setGoogleEmail] = useState('bigwasdominic@gmail.com');
  const [username, setUsername] = useState('Engr. Dominic Cruz');
  const [program, setProgram] = useState<ProgramType>('BSECE');
  const [passTarget, setPassTarget] = useState<number>(65);
  const [maintTarget, setMaintTarget] = useState<number>(45);
  const [createPin, setCreatePin] = useState('123456');
  const [createPinConfirm, setCreatePinConfirm] = useState('123456');
  const [numAreas, setNumAreas] = useState<number>(4);
  const [areaNames, setAreaNames] = useState<string[]>(PROGRAM_DEFAULTS['BSECE']);
  const [createError, setCreateError] = useState<string | null>(null);

  // Manual login with Google email & username
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [isManualLogin, setIsManualLogin] = useState(false);

  if (!isOpen) return null;

  const currentTheme = getProgramTheme(program);

  // Reset wizard on program change
  const handleProgramChange = (prog: ProgramType) => {
    setProgram(prog);
    const defaults = PROGRAM_DEFAULTS[prog] || ['Area 1', 'Area 2', 'Area 3'];
    setNumAreas(defaults.length);
    setAreaNames(defaults);
  };

  // Step 1 Validation -> Proceed to Step 2 (Number of Areas)
  const handleNextFromStep1 = () => {
    setCreateError(null);
    if (!googleEmail.trim()) {
      setCreateError('Please enter your Google account email.');
      return;
    }
    if (!username.trim()) {
      setCreateError('Please write your scholar username.');
      return;
    }
    if (!/^\d{6}$/.test(createPin)) {
      setCreateError('PIN must be exactly 6 numeric digits.');
      return;
    }
    if (createPin !== createPinConfirm) {
      setCreateError('PIN confirmation does not match.');
      return;
    }
    if (passTarget <= maintTarget) {
      setCreateError('Passing target must be strictly greater than maintenance target.');
      return;
    }

    sound.playTap();
    setCreateStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3 (Customize Area Names)
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
    setCreateStep(3);
  };

  const handleAreaNameChange = (idx: number, val: string) => {
    const updated = [...areaNames];
    updated[idx] = val;
    setAreaNames(updated);
  };

  // Step 3: Finalize Account Creation
  const handleFinalizeCreate = () => {
    if (areaNames.some((a) => !a.trim())) {
      setCreateError('Please give a valid name for all areas.');
      return;
    }

    sound.playMilestone();

    const newUser: UserAccount = {
      id: `google_${Date.now()}`,
      userName: username.trim(),
      email: googleEmail.trim(),
      avatar: 'graduate',
      authProvider: 'google',
      program,
      passTarget,
      maintTarget,
      pin: createPin,
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
          message: `Google Account successfully linked for ${program} CEP Licensure Tracking.`,
          type: 'streak',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
      soundEnabled: true,
      pushEnabled: true,
    };

    areaNames.forEach((a) => {
      newUser.studyHours[a] = 0;
      newUser.mockHours[a] = 0;
      newUser.cepRecords[a] = [];
    });

    onCreateAccount(newUser);
    onClose();
  };

  // Initiate PIN prompt for an existing user
  const handleSelectUserForLogin = (user: UserAccount) => {
    sound.playTap();
    setSelectedUserForPin(user);
    setEnteredPin('');
    setPinError(false);
    setPinErrorMessage('');
    setMode('pin');
  };

  // Manual Google Login form submission
  const handleManualLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    // Check if account already exists
    const matched = users.find(
      (u) => u.email?.toLowerCase() === manualEmail.trim().toLowerCase()
    );

    if (matched) {
      handleSelectUserForLogin(matched);
    } else {
      // Prompt creation with prefilled Google email
      setGoogleEmail(manualEmail.trim());
      if (manualName.trim()) setUsername(manualName.trim());
      setMode('create');
      setCreateStep(1);
    }
  };

  // PIN Keypad digit press
  const handlePinKeyPress = (digit: string) => {
    if (!selectedUserForPin || enteredPin.length >= 6) return;
    sound.playKeypad();
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);

    // Auto verify when 6 digits are typed
    if (newPin.length === 6) {
      if (newPin === selectedUserForPin.pin) {
        sound.playMilestone();
        setTimeout(() => {
          onSelectUser(selectedUserForPin);
          onClose();
        }, 150);
      } else {
        sound.playTap();
        setPinError(true);
        setPinErrorMessage('Incorrect PIN. Please try again.');
        setTimeout(() => {
          setPinError(false);
          setEnteredPin('');
        }, 600);
      }
    }
  };

  const handleDeletePinDigit = () => {
    sound.playTap();
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8 overflow-hidden text-slate-900 dark:text-white">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="w-1/3 bg-blue-600" />
          <div className="w-1/3 bg-emerald-500" />
          <div className="w-1/3 bg-orange-500" />
        </div>

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* MODE 1: SELECT - Choose Create Account or Login Existing Account (Google) */}
        {/* ========================================================================= */}
        {mode === 'select' && (
          <div className="space-y-6 pt-2">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mx-auto mb-3">
                <GoogleIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Google Scholar Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Create a new board exam curriculum or sign in to your existing Google profile with your 6-digit PIN.
              </p>
            </div>

            {/* Two Primary Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Create Account */}
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setMode('create');
                  setCreateStep(1);
                }}
                className="p-5 rounded-2xl border-2 border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-900/30 text-left transition-all group flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-blue-600 dark:text-blue-400">
                    Create Account
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Set up username, enter 6-digit PIN, program track, and customize your CEP areas.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400 mt-4">
                  <span>Start Setup</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Login Existing Account */}
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setMode('login');
                }}
                className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Login Existing Account
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Choose an existing Google profile and unlock your review logs with your PIN.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-slate-700 dark:text-slate-300 mt-4">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Quick List of Saved Accounts if any exist */}
            {users.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Quick Switch ({users.length})
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Unlimited Profiles
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {users.map((u) => {
                    const isActive = u.id === activeUserId;
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUserForLogin(u)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isActive
                            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                            {u.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs truncate">{u.userName}</h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {u.email || 'Google Account'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {u.program}
                          </span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                            <KeyRound className="w-3 h-3" /> PIN
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: CREATE - Full 3-Step Wizard: Username, PIN, Program, Areas, Names */}
        {/* ========================================================================= */}
        {mode === 'create' && (
          <div className="space-y-4 pt-1">
            {/* Header with Back to Choice */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  if (createStep > 1) {
                    setCreateStep((prev) => (prev - 1) as any);
                  } else {
                    setMode('select');
                  }
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {/* Step indicator */}
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s === createStep
                        ? 'w-7 bg-blue-600'
                        : s < createStep
                        ? 'w-2 bg-emerald-500'
                        : 'w-2 bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {createError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 text-center">
                {createError}
              </div>
            )}

            {/* STEP 1: Google Account, Username, PIN & Program */}
            {createStep === 1 && (
              <div className="space-y-3.5">
                <div className="text-center">
                  <h3 className="text-xl font-black">Create Scholar Account</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect Google identity, choose PIN & engineering track
                  </p>
                </div>

                {/* Google Identity Header Chip */}
                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center gap-2.5">
                  <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <label className="block text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      Google Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="e.g. bigwasdominic@gmail.com"
                      className="w-full bg-transparent font-bold text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Scholar's Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Engr. Dominic Cruz"
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PIN and Confirm PIN */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-blue-500" /> Enter 6-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      inputMode="numeric"
                      value={createPin}
                      onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-black text-base tracking-widest text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      inputMode="numeric"
                      value={createPinConfirm}
                      onChange={(e) => setCreatePinConfirm(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-black text-base tracking-widest text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Program Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Engineering Program
                  </label>
                  <select
                    value={program}
                    onChange={(e) => handleProgramChange(e.target.value as ProgramType)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BSCE">BSCE (Civil Engineering)</option>
                    <option value="BSABE">BSABE (Agricultural & Biosystems Engineering)</option>
                    <option value="BSECE">BSECE (Electronics Engineering)</option>
                    <option value="Custom">Custom Engineering Track</option>
                  </select>
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
                      className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-black text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-black text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="w-full mt-3 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-98"
                >
                  <span>Continue to Areas Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Number of Areas */}
            {createStep === 2 && (
              <div className="space-y-5 py-2">
                <div className="text-center">
                  <h3 className="text-xl font-black">How Many Board Areas?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select the number of board exam subjects you need to conquer
                  </p>
                </div>

                <div className="py-4 text-center">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={numAreas}
                    onChange={(e) =>
                      setNumAreas(Math.min(8, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="w-28 p-3.5 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 text-center font-black text-4xl text-blue-600 dark:text-blue-400 mx-auto block shadow-inner"
                  />
                  <span className="text-xs font-bold text-slate-400 mt-2 block">
                    Curriculum Areas (1 - 8)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <span>Next: Name Your Areas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 3: Customize Area Names */}
            {createStep === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-black">Name Your CEP Areas</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pre-filled with official board subjects for {program}
                  </p>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
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
                        placeholder={`Name of Area ${idx + 1}`}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleFinalizeCreate}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Account with Google</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: LOGIN - Select Existing Google Account or Enter Google Email       */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <div className="space-y-5 pt-1">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setMode('select');
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <span className="text-[11px] font-bold text-blue-500">Google Authentication</span>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-black">Login Existing Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your Google profile to unlock with PIN
              </p>
            </div>

            {/* List of Existing Accounts */}
            {users.length > 0 ? (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isActive = u.id === activeUserId;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUserForLogin(u)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                          {u.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-sm truncate">{u.userName}</h4>
                            {isActive && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{u.email || 'Google Scholar'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {u.program}
                        </span>

                        <span className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Enter PIN
                        </span>

                        {users.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete profile for ${u.userName}?`)) {
                                onDeleteAccount(u.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                No existing accounts found. Please create an account below.
              </div>
            )}

            {/* Option to toggle manual Google email entry */}
            {!isManualLogin ? (
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualLogin(true)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-all"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>Use Another Google Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setMode('create');
                    setCreateStep(1);
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Account</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleManualLoginSubmit}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GoogleIcon className="w-4 h-4" /> Enter Google Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManualLogin(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  type="email"
                  required
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="Google Email (e.g. bigwasdominic@gmail.com)"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Scholar Name (optional)"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition-all"
                >
                  Continue with Google
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 4: PIN - Enter 6-Digit PIN to unlock selected Google Account          */}
        {/* ========================================================================= */}
        {mode === 'pin' && selectedUserForPin && (
          <div className="space-y-4 pt-1 text-center">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setEnteredPin('');
                  setMode('login');
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Accounts
              </button>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Security Verification
              </span>
            </div>

            {/* Profile Pill */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xl mx-auto shadow-md">
              {selectedUserForPin.userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {selectedUserForPin.userName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedUserForPin.email || 'Google Scholar'} • {selectedUserForPin.program}
              </p>
            </div>

            {pinErrorMessage && (
              <div className="text-xs font-bold text-rose-500 dark:text-rose-400">
                {pinErrorMessage}
              </div>
            )}

            {/* 6-Digit Indicator Dots */}
            <motion.div
              animate={pinError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex justify-center space-x-3 my-3"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    i < enteredPin.length
                      ? pinError
                        ? 'bg-rose-500 border-rose-500 scale-110'
                        : 'bg-blue-600 border-blue-600 scale-110 shadow-sm shadow-blue-500/40'
                      : 'border-slate-300 dark:border-slate-700 bg-transparent'
                  }`}
                />
              ))}
            </motion.div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinKeyPress(digit)}
                  className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 font-black text-lg text-slate-900 dark:text-white shadow-sm transition-all"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEnteredPin('')}
                className="h-12 rounded-2xl text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white active:scale-95 transition-all"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handlePinKeyPress('0')}
                className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 font-black text-lg text-slate-900 dark:text-white shadow-sm transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDeletePinDigit}
                className="h-12 rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-500 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Backspace"
              >
                ⌫
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
