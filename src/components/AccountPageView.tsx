import React, { useState, useEffect } from 'react';
import { UserAccount, ProgramType } from '../types';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Layers,
  Percent,
  Plus,
  Minus,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  UserPlus,
  KeyRound,
} from 'lucide-react';

interface Props {
  savedUsers: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
  onCreateAccount: (newUser: UserAccount) => void;
  onDeleteAccount: (userId: string) => void;
}

const PROGRAM_DEFAULTS: Record<string, string[]> = {
  BSCE: [
    'Applied Mathematics, Surveying & Transportation Engineering',
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

export const AccountPageView: React.FC<Props> = ({
  savedUsers,
  onSelectUser,
  onCreateAccount,
  onDeleteAccount,
}) => {
  // Mode: 'list' (select existing or click add) or 'create' (wizard)
  const [viewMode, setViewMode] = useState<'list' | 'create'>(
    savedUsers.length > 0 ? 'list' : 'create'
  );

  useEffect(() => {
    if (savedUsers.length === 0 && viewMode !== 'create') {
      setViewMode('create');
      setWizardStep(1);
    }
  }, [savedUsers.length, viewMode]);

  // Selected account for PIN prompt
  const [pinPromptUser, setPinPromptUser] = useState<UserAccount | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Delete account confirmation dialog state
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Wizard Step: 1: Username, 2: Pin, 3: Program, 4: Number of areas, 5: Names of areas, 6: Passing and Maintaining Grades
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Form Fields for new account
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [newPinConfirm, setNewPinConfirm] = useState<string>('');
  const [showNewPin, setShowNewPin] = useState<boolean>(false);
  const [newProgram, setNewProgram] = useState<ProgramType>('BSCE');
  const [newNumAreas, setNewNumAreas] = useState<number>(3);
  const [newAreaNames, setNewAreaNames] = useState<string[]>(PROGRAM_DEFAULTS['BSCE']);
  const [newPassGrade, setNewPassGrade] = useState<number>(65);
  const [newMaintGrade, setNewMaintGrade] = useState<number>(45);
  const [wizardError, setWizardError] = useState<string | null>(null);

  const activeTheme = getProgramTheme(newProgram);

  // Handler for changing program in wizard
  const handleProgramSelect = (prog: ProgramType) => {
    setNewProgram(prog);
    const defaults = PROGRAM_DEFAULTS[prog] || ['Area 1', 'Area 2', 'Area 3'];
    setNewNumAreas(defaults.length);
    setNewAreaNames([...defaults]);
  };

  // Handler for changing number of areas
  const handleNumAreasChange = (count: number) => {
    const clamped = Math.min(8, Math.max(1, count));
    setNewNumAreas(clamped);

    const updated = [...newAreaNames];
    if (updated.length < clamped) {
      while (updated.length < clamped) {
        updated.push(`Area ${updated.length + 1}`);
      }
    } else if (updated.length > clamped) {
      updated.splice(clamped);
    }
    setNewAreaNames(updated);
  };

  const handleAreaNameChange = (index: number, val: string) => {
    const updated = [...newAreaNames];
    updated[index] = val;
    setNewAreaNames(updated);
  };

  // Click on existing account card -> open PIN dialog
  const handleCardClick = (u: UserAccount) => {
    sound.playTap();
    setPinPromptUser(u);
    setEnteredPin('');
    setPinError(null);
    setShowPin(false);
  };

  // Validate entered PIN and log in
  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinPromptUser) return;

    // PIN check (fallback to 123456 if none set)
    const expectedPin = pinPromptUser.pin || '123456';
    if (enteredPin === expectedPin) {
      sound.playMilestone();
      onSelectUser(pinPromptUser);
      setPinPromptUser(null);
    } else {
      sound.playTap();
      setPinError('Incorrect PIN. Please check and try again.');
    }
  };

  // Step 1: Validate Username & proceed to PIN
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError(null);
    if (!newUsername.trim()) {
      setWizardError('Please enter a username.');
      return;
    }
    sound.playTap();
    setWizardStep(2);
  };

  // Step 2: Validate PIN & proceed to Program
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError(null);
    if (!newPin || newPin.length < 4) {
      setWizardError('PIN must be at least 4 digits.');
      return;
    }
    if (newPin !== newPinConfirm) {
      setWizardError('PIN confirmation does not match.');
      return;
    }
    sound.playTap();
    setWizardStep(3);
  };

  // Step 3: Proceed to Number of areas
  const handleStep3Next = () => {
    sound.playTap();
    setWizardStep(4);
  };

  // Step 4: Proceed to Names of areas
  const handleStep4Next = () => {
    sound.playTap();
    setWizardStep(5);
  };

  // Step 5: Validate Area names & proceed to Grades
  const handleStep5Next = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError(null);
    if (newAreaNames.some((a) => !a.trim())) {
      setWizardError('Please provide a title for every area.');
      return;
    }
    sound.playTap();
    setWizardStep(6);
  };

  // Step 6: Final Submission -> Create Account
  const handleStep6Finish = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError(null);
    if (newPassGrade <= newMaintGrade) {
      setWizardError('Passing grade target must be higher than maintaining grade target.');
      return;
    }

    sound.playMilestone();

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      userName: newUsername.trim(),
      email: `${newUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@cep.edu`,
      avatar: 'graduate',
      authProvider: 'local',
      program: newProgram,
      passTarget: newPassGrade,
      maintTarget: newMaintGrade,
      pin: newPin.trim(),
      areas: newAreaNames.map((a) => a.trim()),
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
          title: `Welcome, ${newUsername}! 🎓`,
          message: `Account created for ${newProgram} CEP Licensure Tracking. Start your review today!`,
          type: 'streak',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
      soundEnabled: true,
      pushEnabled: true,
    };

    onCreateAccount(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans relative selection:bg-blue-600 selection:text-white">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding Header */}
      <div className="max-w-4xl w-full mx-auto pt-4 sm:pt-6 pb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>CEP Tracker</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Licensure Edition
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Competency Enhancement Program Review & Licensure Mastery
            </p>
          </div>
        </div>

        {/* If in create wizard and existing accounts exist, allow returning to accounts list */}
        {savedUsers.length > 0 && viewMode === 'create' && (
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setViewMode('list');
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black text-xs flex items-center gap-1.5 transition-all active:scale-98"
          >
            <User className="w-4 h-4" />
            <span>Back to Accounts ({savedUsers.length})</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full mx-auto my-auto py-6 relative z-10">
        {/* ===================== MODE 1: EXISTING ACCOUNTS LIST ===================== */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white">Select Scholar Account</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Choose your profile to unlock with your 4-6 digit PIN, or add a new scholar track.
              </p>
            </div>

            {/* Grid of Existing Accounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedUsers.map((u) => {
                const uTheme = getProgramTheme(u.program);
                return (
                  <div
                    key={u.id}
                    className="relative group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-5 shadow-lg transition-all flex flex-col justify-between text-left cursor-pointer active:scale-98"
                    onClick={() => handleCardClick(u)}
                  >
                    {/* TRASH BIN ICON: In the upper right of the existing account icon/card */}
                    <button
                      type="button"
                      title="Permanently Delete Account"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playTap();
                        setUserToDelete(u);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500 text-slate-400 hover:text-white border border-slate-700/60 hover:border-rose-500 transition-all z-20 shadow-sm"
                      aria-label={`Delete account for ${u.userName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      {/* Avatar Icon with Initials */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className={`w-12 h-12 rounded-2xl ${uTheme.classes.accentBg} text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0`}
                        >
                          {u.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 pr-8">
                          <h3 className="font-extrabold text-base text-white truncate group-hover:text-blue-400 transition-colors">
                            {u.userName}
                          </h3>
                          <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${uTheme.classes.badge} mt-0.5`}>
                            {uTheme.code} Track
                          </span>
                        </div>
                      </div>

                      {/* Account Specs */}
                      <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span>Targets:</span>
                          <span className="font-bold text-slate-300">
                            Pass {u.passTarget}% • Maint {u.maintTarget}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Board Areas:</span>
                          <span className="font-bold text-slate-300">{u.areas.length} Areas</span>
                        </div>
                      </div>
                    </div>

                    {/* Login Tap Indicator */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Enter PIN to Access
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}

              {/* Add Account Card inside the grid */}
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setViewMode('create');
                  setWizardStep(1);
                  setWizardError(null);
                }}
                className="bg-slate-900/40 hover:bg-slate-900 border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all group min-h-[170px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-black transition-all mb-2 shadow-sm">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-white group-hover:text-blue-400 transition-colors">
                  Add New Account
                </h4>
                <p className="text-xs text-slate-500 mt-1">Configure tracks, areas, and benchmark grades</p>
              </button>
            </div>
          </div>
        )}

        {/* ===================== MODE 2: ADD ACCOUNT SEQUENCED WIZARD ===================== */}
        {/* Sequence: Add account --> Username --> Pin --> Program --> Number of areas --> Names of areas --> Passing and Maintaining Grades */}
        {viewMode === 'create' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Step Breadcrumbs */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6 flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Scholar Account • Step {wizardStep} of 6
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {wizardStep === 1 && 'Step 1: Set Username'}
                  {wizardStep === 2 && 'Step 2: Create PIN'}
                  {wizardStep === 3 && 'Step 3: Select Program'}
                  {wizardStep === 4 && 'Step 4: Number of Areas'}
                  {wizardStep === 5 && 'Step 5: Names of Areas'}
                  {wizardStep === 6 && 'Step 6: Passing & Maintaining Grades'}
                </h2>
              </div>

              {/* Step indicator pills */}
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className={`w-7 h-2 rounded-full transition-all ${
                      wizardStep === s
                        ? 'bg-blue-500 w-9'
                        : wizardStep > s
                        ? 'bg-emerald-500'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Wizard Error Banner */}
            {wizardError && (
              <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{wizardError}</span>
              </div>
            )}

            {/* STEP 1: USERNAME */}
            {wizardStep === 1 && (
              <form onSubmit={handleStep1Next} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Scholar Username / Engineering Handle
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. Engr. Dominic Cruz"
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-500"
                      autoFocus
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    This name will appear on all your exam reports, CEP milestones, and dashboard stats.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  {savedUsers.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Accounts</span>
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-98"
                  >
                    <span>Next: Set PIN</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PIN */}
            {wizardStep === 2 && (
              <form onSubmit={handleStep2Next} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Set Security PIN (4 to 6 Digits)
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Your PIN protects your mock records and personal notes when switching profiles.
                  </p>
                  <div className="relative">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4-6 digit numeric PIN"
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:tracking-normal placeholder:text-slate-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Confirm PIN
                  </label>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={6}
                    value={newPinConfirm}
                    onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter PIN"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:tracking-normal placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setWizardStep(1);
                    }}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-98"
                  >
                    <span>Next: Select Program</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PROGRAM */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Select Your PRC Licensure Discipline
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    Selecting your program track automatically prepares official subject areas and benchmarks.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {(['BSCE', 'BSABE', 'BSECE', 'Custom'] as ProgramType[]).map((prog) => {
                      const pTheme = getProgramTheme(prog);
                      const isSelected = newProgram === prog;
                      return (
                        <button
                          key={prog}
                          type="button"
                          onClick={() => handleProgramSelect(prog)}
                          className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? `${pTheme.classes.heroCardBg} border-blue-500 ring-2 ring-blue-500 shadow-lg`
                              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-extrabold text-base text-white">{pTheme.code}</span>
                              {isSelected && <Check className="w-5 h-5 text-white" />}
                            </div>
                            <p className="text-xs text-slate-200 font-medium">{pTheme.displayName}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-2 block">
                            {PROGRAM_DEFAULTS[prog]?.length || 3} Default Subjects
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setWizardStep(2);
                    }}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStep3Next}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-98"
                  >
                    <span>Next: Number of Areas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: NUMBER OF AREAS */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    How Many Board Subject Areas to Track?
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    Specify the number of examination modules (1 to 8). You can rename each subject in the next step.
                  </p>

                  <div className="flex items-center space-x-4 bg-slate-800/80 p-5 rounded-3xl border border-slate-700 max-w-sm mx-auto justify-center">
                    <button
                      type="button"
                      onClick={() => handleNumAreasChange(newNumAreas - 1)}
                      disabled={newNumAreas <= 1}
                      className="w-12 h-12 rounded-2xl bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white flex items-center justify-center font-black transition-all active:scale-95"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <div className="text-center px-4">
                      <span className="text-4xl font-black text-white">{newNumAreas}</span>
                      <span className="block text-xs font-bold text-slate-400 mt-0.5">Subject Areas</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNumAreasChange(newNumAreas + 1)}
                      disabled={newNumAreas >= 8}
                      className="w-12 h-12 rounded-2xl bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white flex items-center justify-center font-black transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {[3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleNumAreasChange(cnt)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          newNumAreas === cnt
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {cnt} Areas
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setWizardStep(3);
                    }}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStep4Next}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-98"
                  >
                    <span>Next: Names of Areas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: NAMES OF AREAS */}
            {wizardStep === 5 && (
              <form onSubmit={handleStep5Next} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Names of Board Subject Areas ({newAreaNames.length})
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    Confirm or customize the descriptive titles for each of your board licensure examination areas.
                  </p>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                    {newAreaNames.map((areaTitle, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={areaTitle}
                          onChange={(e) => handleAreaNameChange(idx, e.target.value)}
                          placeholder={`Area ${idx + 1} Subject Title`}
                          className="flex-1 px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setWizardStep(4);
                    }}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-98"
                  >
                    <span>Next: Passing & Maintaining Grades</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 6: PASSING AND MAINTAINING GRADES */}
            {wizardStep === 6 && (
              <form onSubmit={handleStep6Finish} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Set Passing & Maintaining Grade Targets
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    Under CEP guidelines, hitting your Passing Target grants initial clearance; subsequent exams require staying above your Maintaining Target.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Passing Target */}
                    <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Passing Target
                        </span>
                        <span className="text-2xl font-black text-emerald-400">{newPassGrade}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="85"
                        value={newPassGrade}
                        onChange={(e) => setNewPassGrade(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-2">
                        Target score to achieve initial clearance in an area (Standard: 65%).
                      </p>
                    </div>

                    {/* Maintaining Target */}
                    <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" /> Maintaining Target
                        </span>
                        <span className="text-2xl font-black text-blue-400">{newMaintGrade}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="60"
                        value={newMaintGrade}
                        onChange={(e) => setNewMaintGrade(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-2">
                        Target score to maintain cleared status across 6 exams (Standard: 45%).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setWizardStep(5);
                    }}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-blue-500/30 transition-all active:scale-98"
                  >
                    <span>Complete & Proceed to Home Screen</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ===================== MODAL: ENTER PIN TO LOGIN ===================== */}
      {pinPromptUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl relative text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
              <KeyRound className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-white">Enter Account PIN</h3>
            <p className="text-xs text-slate-400 mt-1">
              Unlock records for <span className="font-bold text-white">{pinPromptUser.userName}</span>
            </p>

            <form onSubmit={handleVerifyPin} className="mt-5 space-y-4">
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value.replace(/\D/g, ''));
                    setPinError(null);
                  }}
                  placeholder="Enter 4-6 digit PIN"
                  className="w-full text-center px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white font-black text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 font-bold">{pinError}</p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPinPromptUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md shadow-blue-500/20"
                >
                  Unlock & Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DELETE CONFIRMATION WARNING ===================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-900/60 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold flex-shrink-0 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Permanently Delete Account?</h3>
                <p className="text-xs text-rose-400 font-semibold">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-4 rounded-2xl border border-slate-800">
              Are you sure you want to permanently delete the profile for{' '}
              <span className="font-bold text-white">"{userToDelete.userName}"</span>? All recorded mock exam scores, scheduled exams, review timers, and streak milestones will be completely removed from your device.
            </p>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onDeleteAccount(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-slate-500 pt-4 relative z-10">
        CEP Licensure Mastery • Powered by Google AI Studio
      </div>
    </div>
  );
};
