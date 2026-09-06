export interface ProgramColorConfig {
  code: 'BSCE' | 'BSABE' | 'BSECE' | 'Custom';
  displayName: string;
  subTitle: string;
  paletteDescription: string;
  primaryHex: string;
  secondaryHex: string;
  tertiaryHex: string;
  blackHex: string;
  chartColors: {
    scoreLine: string;
    passTargetLine: string;
    maintTargetLine: string;
    studyBar: string;
    mockBar: string;
  };
  classes: {
    badge: string;
    badgeDot: string;
    accentBg: string;
    accentBgSubtle: string;
    accentText: string;
    accentBorder: string;
    accentRing: string;
    progressBar: string;
    progressBarConquered: string;
    heroCardBg: string;
    heroOrb: string;
    tabAccent: string;
    buttonShadow: string;
  };
}

export function normalizeProgram(prog: string | undefined): 'BSCE' | 'BSABE' | 'BSECE' | 'Custom' {
  if (!prog) return 'BSECE';
  const clean = prog.trim().toUpperCase().replace(/\s+/g, '');
  if (clean === 'BSCE') return 'BSCE';
  if (clean === 'BSABE' || clean === 'BS-ABE' || clean === 'ABE') return 'BSABE';
  if (clean === 'BSECE' || clean === 'BS-ECE' || clean === 'ECE' || clean === 'BSECE') return 'BSECE';
  // Legacy support for BSeCe or BS ABE
  if (prog.includes('ABE')) return 'BSABE';
  if (prog.toLowerCase().includes('ece')) return 'BSECE';
  if (prog.toLowerCase().includes('ce')) return 'BSCE';
  return 'Custom';
}

export const PROGRAM_CONFIGS: Record<'BSCE' | 'BSABE' | 'BSECE' | 'Custom', ProgramColorConfig> = {
  // BSCE: ORANGE / BLACK / YELLOW COMBINATIONS
  BSCE: {
    code: 'BSCE',
    displayName: 'BSCE (Civil Engineering)',
    subTitle: 'Mathematics, Surveying, Hydraulics & Structural Design',
    paletteDescription: 'Orange, Black & Yellow',
    primaryHex: '#f97316', // Safety Orange
    secondaryHex: '#eab308', // Engineering Yellow
    tertiaryHex: '#facc15', // Bright Yellow
    blackHex: '#09090b', // Pitch Black / Zinc
    chartColors: {
      scoreLine: '#f97316',
      passTargetLine: '#eab308',
      maintTargetLine: '#ef4444',
      studyBar: '#f97316',
      mockBar: '#eab308',
    },
    classes: {
      badge: 'bg-orange-500/15 text-orange-600 dark:text-amber-400 border-orange-500/30',
      badgeDot: 'bg-orange-500',
      accentBg: 'bg-orange-600 hover:bg-orange-700 text-white',
      accentBgSubtle: 'bg-orange-500/10 text-orange-600 dark:text-amber-400 border border-orange-500/20',
      accentText: 'text-orange-600 dark:text-amber-400',
      accentBorder: 'border-orange-500 dark:border-orange-500',
      accentRing: 'focus:ring-orange-500',
      progressBar: 'bg-orange-500',
      progressBarConquered: 'bg-amber-400',
      heroCardBg:
        'bg-gradient-to-br from-black via-zinc-950 to-orange-950/90 border border-orange-500/30 text-white',
      heroOrb: 'bg-orange-500/20',
      tabAccent: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
      buttonShadow: 'shadow-orange-500/25',
    },
  },

  // BSABE: SHADES OF GREEN / WHITE COMBINATIONS
  BSABE: {
    code: 'BSABE',
    displayName: 'BSABE (Agricultural & Biosystems)',
    subTitle: 'Power & Machinery, Soil & Water, Rural Electrification',
    paletteDescription: 'Shades of Green & White',
    primaryHex: '#059669', // Emerald Green
    secondaryHex: '#10b981', // Vivid Mint Green
    tertiaryHex: '#34d399', // Bright Sage Green
    blackHex: '#064e3b', // Deep Forest Pine
    chartColors: {
      scoreLine: '#059669',
      passTargetLine: '#10b981',
      maintTargetLine: '#f43f5e',
      studyBar: '#059669',
      mockBar: '#34d399',
    },
    classes: {
      badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      badgeDot: 'bg-emerald-500',
      accentBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accentBgSubtle: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
      accentText: 'text-emerald-700 dark:text-emerald-300',
      accentBorder: 'border-emerald-500 dark:border-emerald-500',
      accentRing: 'focus:ring-emerald-500',
      progressBar: 'bg-emerald-500',
      progressBarConquered: 'bg-teal-400',
      heroCardBg:
        'bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 border border-emerald-500/30 text-white',
      heroOrb: 'bg-emerald-500/20',
      tabAccent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      buttonShadow: 'shadow-emerald-500/25',
    },
  },

  // BSECE: SHADES OF BLUE / BLACK COMBINATIONS
  BSECE: {
    code: 'BSECE',
    displayName: 'BSECE (Electronics Engineering)',
    subTitle: 'Electronic Systems, Telecommunications, Math & GEAS',
    paletteDescription: 'Shades of Blue & Black',
    primaryHex: '#2563eb', // Royal / Electric Blue
    secondaryHex: '#0284c7', // Sky Blue
    tertiaryHex: '#38bdf8', // Cyan / Light Blue
    blackHex: '#020617', // Obsidian Black
    chartColors: {
      scoreLine: '#2563eb',
      passTargetLine: '#0284c7',
      maintTargetLine: '#f43f5e',
      studyBar: '#2563eb',
      mockBar: '#38bdf8',
    },
    classes: {
      badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      badgeDot: 'bg-blue-500',
      accentBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      accentBgSubtle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      accentText: 'text-blue-600 dark:text-blue-400',
      accentBorder: 'border-blue-500 dark:border-blue-500',
      accentRing: 'focus:ring-blue-500',
      progressBar: 'bg-blue-600',
      progressBarConquered: 'bg-cyan-400',
      heroCardBg:
        'bg-gradient-to-br from-black via-slate-950 to-blue-950 border border-blue-500/30 text-white',
      heroOrb: 'bg-blue-500/20',
      tabAccent: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      buttonShadow: 'shadow-blue-500/25',
    },
  },

  // Custom fallback
  Custom: {
    code: 'Custom',
    displayName: 'Custom Engineering Track',
    subTitle: 'Tailored Competency Enhancement Program',
    paletteDescription: 'Indigo & Violet',
    primaryHex: '#6366f1',
    secondaryHex: '#8b5cf6',
    tertiaryHex: '#a855f7',
    blackHex: '#09090b',
    chartColors: {
      scoreLine: '#6366f1',
      passTargetLine: '#8b5cf6',
      maintTargetLine: '#f43f5e',
      studyBar: '#6366f1',
      mockBar: '#a855f7',
    },
    classes: {
      badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      badgeDot: 'bg-indigo-500',
      accentBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      accentBgSubtle: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      accentText: 'text-indigo-600 dark:text-indigo-400',
      accentBorder: 'border-indigo-500 dark:border-indigo-500',
      accentRing: 'focus:ring-indigo-500',
      progressBar: 'bg-indigo-600',
      progressBarConquered: 'bg-violet-400',
      heroCardBg:
        'bg-gradient-to-br from-black via-slate-950 to-indigo-950 border border-indigo-500/30 text-white',
      heroOrb: 'bg-indigo-500/20',
      tabAccent: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
      buttonShadow: 'shadow-indigo-500/25',
    },
  },
};

export function getProgramTheme(prog: string | undefined): ProgramColorConfig {
  const norm = normalizeProgram(prog);
  return PROGRAM_CONFIGS[norm] || PROGRAM_CONFIGS.BSECE;
}
