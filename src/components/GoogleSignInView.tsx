import React, { useState } from 'react';
import { UserAccount, ProgramType } from '../types';
import { sound } from '../utils/sound';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Compass,
  Cpu,
  Tractor,
  Layers,
  X,
  Lock,
} from 'lucide-react';

interface Props {
  users: UserAccount[];
  activeUserId: string | null;
  onSelectUser: (user: UserAccount) => void;
  onCreateGoogleAccount: (account: {
    userName: string;
    email: string;
    program: ProgramType;
    passTarget: number;
    maintTarget: number;
  }) => void;
  onDeleteAccount: (id: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const PROGRAM_OPTIONS: Array<{
  type: ProgramType;
  name: string;
  code: string;
  badgeBg: string;
  borderHover: string;
  icon: any;
  colorHex: string;
  description: string;
}> = [
  {
    type: 'BSECE',
    name: 'Electronics Engineering',
    code: 'BSECE',
    badgeBg: 'bg-blue-600 text-white',
    borderHover: 'hover:border-blue-500',
    icon: Cpu,
    colorHex: '#2563eb',
    description: 'Mathematics, Electronic Systems & Devices, Telecomms, GEAS',
  },
  {
    type: 'BSCE',
    name: 'Civil Engineering',
    code: 'BSCE',
    badgeBg: 'bg-orange-600 text-white',
    borderHover: 'hover:border-orange-500',
    icon: Compass,
    colorHex: '#ea580c',
    description: 'Math & Surveying, Hydraulics & Geotech, Structural Engineering',
  },
  {
    type: 'BSABE',
    name: 'Agricultural & Biosystems Engineering',
    code: 'BSABE',
    badgeBg: 'bg-emerald-600 text-white',
    borderHover: 'hover:border-emerald-500',
    icon: Tractor,
    colorHex: '#059669',
    description: 'Mechanization, Soil & Water Conservation, Rural Structures',
  },
];

export const GoogleSignInView: React.FC<Props> = ({
  users,
  activeUserId,
  onSelectUser,
  onCreateGoogleAccount,
  onDeleteAccount,
  onClose,
  isModal = false,
}) => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newEmail, setNewEmail] = useState('bigwasdominic@gmail.com');
  const [newName, setNewName] = useState('Engr. Dominic Cruz');
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>('BSECE');
  const [passTarget, setPassTarget] = useState(65);
  const [maintTarget, setMaintTarget] = useState(45);

  const handleGoogleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    sound.playMilestone();
    onCreateGoogleAccount({
      userName: newName.trim(),
      email: newEmail.trim(),
      program: selectedProgram,
      passTarget,
      maintTarget,
    });

    setIsAddingAccount(false);
  };

  const handleQuickGoogleSignIn = (user: UserAccount) => {
    sound.playTap();
    onSelectUser(user);
    if (onClose) onClose();
  };

  const getProgramBadge = (program: string) => {
    if (program === 'BSCE') {
      return 'bg-orange-500 text-white border-orange-400/30';
    }
    if (program === 'BSABE') {
      return 'bg-emerald-600 text-white border-emerald-400/30';
    }
    return 'bg-blue-600 text-white border-blue-400/30';
  };

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg overflow-y-auto'
          : 'min-h-screen w-full bg-[#090d16] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden'
      }`}
    >
      {/* Dynamic Background Ambient Gradients: Blue, Green, Orange, Black */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blue Orb (BSECE) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/25 rounded-full blur-[120px]" />
        {/* Green Orb (BSABE) */}
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-[130px]" />
        {/* Orange Orb (BSCE) */}
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-orange-600/25 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 my-6">
        {/* Modal Close Button if opened as modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 border border-slate-700/60 transition-colors z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-8">
          {/* Multi-color Program Pill Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 shadow-xl mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
              BSECE • BSCE • BSABE Licensure
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>CEP Examination Tracker</span>
          </h1>

          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Modern Google Sign-In with unlimited scholar profiles, real-time push analytics, and Gemini AI coaching.
          </p>
        </div>

        {/* Main Content Card with High Contrast: Black Card, White Details, Blue/Green/Orange Accents */}
        <div className="bg-[#0f172a]/95 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Top accent bar showing Blue, Green, Orange */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="w-1/3 bg-blue-600" />
            <div className="w-1/3 bg-emerald-500" />
            <div className="w-1/3 bg-orange-500" />
          </div>

          {!isAddingAccount ? (
            <div className="space-y-6">
              {/* Primary Google Sign-In Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setIsAddingAccount(true);
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-blue-500/10 transition-all transform active:scale-98 group border border-slate-200"
                >
                  {/* Official Google G SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>Sign in with Google Account</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Connected Google Accounts (NO 4-ACCOUNT LIMIT!) */}
              {users.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Select Connected Google Account ({users.length})
                    </span>
                    <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> No Account Limit
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {users.map((user) => {
                      const isActive = user.id === activeUserId;
                      return (
                        <div
                          key={user.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                            isActive
                              ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                              : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/70'
                          }`}
                        >
                          {/* Account details */}
                          <div
                            onClick={() => handleQuickGoogleSignIn(user)}
                            className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
                          >
                            {/* Google avatar or initials */}
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-emerald-600 to-orange-500 text-white font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
                              {user.userName.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-black text-sm text-white truncate">{user.userName}</h3>
                                {isActive && (
                                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 truncate">
                                {user.email || `${user.userName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`}
                              </p>
                            </div>
                          </div>

                          {/* Program badge and Action */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getProgramBadge(user.program)}`}>
                              {user.program}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleQuickGoogleSignIn(user)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-extrabold text-xs transition-colors shadow-sm"
                            >
                              Launch
                            </button>

                            {users.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Remove Google profile for ${user.userName}?`)) {
                                    onDeleteAccount(user.id);
                                  }
                                }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                                title="Remove Profile"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Features Banner */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-900/40">
                  <span className="block text-[11px] font-extrabold text-blue-400">BSECE</span>
                  <span className="text-[10px] text-slate-400">Electronics</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <span className="block text-[11px] font-extrabold text-emerald-400">BSABE</span>
                  <span className="text-[10px] text-slate-400">Agri & Bio</span>
                </div>
                <div className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-900/40">
                  <span className="block text-[11px] font-extrabold text-orange-400">BSCE</span>
                  <span className="text-[10px] text-slate-400">Civil Engg</span>
                </div>
              </div>
            </div>
          ) : (
            /* Add Google Scholar Profile Form */
            <form onSubmit={handleGoogleAuthSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Google Account Setup</h3>
                    <p className="text-[11px] text-slate-400">Configure your engineering program & passing targets</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingAccount(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg"
                >
                  Cancel
                </button>
              </div>

              {/* Google Identity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Scholar Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Engr. Dominic Cruz"
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-bold text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Google Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. bigwasdominic@gmail.com"
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-bold text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Engineering Program Selection with Exact Theme Previews */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Engineering Licensure Program
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PROGRAM_OPTIONS.map((opt) => {
                    const isSelected = selectedProgram === opt.type;
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.type}
                        onClick={() => setSelectedProgram(opt.type)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-white shadow-lg'
                            : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${opt.badgeBg}`}>
                            {opt.code}
                          </span>
                          <Icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <h4 className="font-extrabold text-xs text-white leading-snug">{opt.name}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{opt.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Targets */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Initial Pass Target (%)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="100"
                    value={passTarget}
                    onChange={(e) => setPassTarget(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-black text-center text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Maintenance Target (%)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="100"
                    value={maintTarget}
                    onChange={(e) => setMaintTarget(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-black text-center text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-emerald-600 to-orange-500 hover:opacity-95 text-white font-black text-base shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Google Sign-In & Launch</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-300 mt-6">
          CEP Licensure Review System • Integrated with Google Authentication & Gemini AI
        </p>
      </div>
    </div>
  );
};
