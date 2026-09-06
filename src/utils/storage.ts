import { AppDatabase, UserAccount } from '../types';

const STORAGE_KEY = 'cep_tracker_db_v2';

const DEFAULT_AREAS_MAP: Record<string, string[]> = {
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
};

export const DEMO_USER: UserAccount = {
  id: 'demo_user_1',
  userName: 'Engr. Dominic Cruz',
  email: 'bigwasdominic@gmail.com',
  avatar: 'graduate',
  authProvider: 'google',
  program: 'BSECE',
  passTarget: 65,
  maintTarget: 45,
  pin: '123456',
  areas: DEFAULT_AREAS_MAP['BSECE'],
  themeMode: 'dark',
  studyHours: {
    'Mathematics & Basic Engineering': 18.5,
    'Electronic Systems & Devices': 24.0,
    'Telecommunications & Network Systems': 14.5,
    'General Engineering & Applied Sciences': 11.0,
  },
  mockHours: {
    'Mathematics & Basic Engineering': 5.0,
    'Electronic Systems & Devices': 6.5,
    'Telecommunications & Network Systems': 4.0,
    'General Engineering & Applied Sciences': 3.5,
  },
  cepRecords: {
    'Mathematics & Basic Engineering': [
      { id: 'm1', examNum: 1, items: 50, score: 32, pct: 64, target: 65, isPass: false, date: '2026-08-10' },
      { id: 'm2', examNum: 2, items: 50, score: 36, pct: 72, target: 65, isPass: true, date: '2026-08-18' },
      { id: 'm3', examNum: 3, items: 50, score: 28, pct: 56, target: 45, isPass: true, date: '2026-08-25' },
      { id: 'm4', examNum: 4, items: 50, score: 34, pct: 68, target: 45, isPass: true, date: '2026-09-01' },
      { id: 'm5', examNum: 5, items: 50, score: 38, pct: 76, target: 45, isPass: true, date: '2026-09-03' },
      { id: 'm6', examNum: 6, items: 50, score: 40, pct: 80, target: 45, isPass: true, date: '2026-09-05' },
    ],
    'Electronic Systems & Devices': [
      { id: 'e1', examNum: 1, items: 50, score: 37, pct: 74, target: 65, isPass: true, date: '2026-08-12' },
      { id: 'e2', examNum: 2, items: 50, score: 31, pct: 62, target: 45, isPass: true, date: '2026-08-20' },
      { id: 'e3', examNum: 3, items: 50, score: 35, pct: 70, target: 45, isPass: true, date: '2026-08-28' },
      { id: 'e4', examNum: 4, items: 50, score: 39, pct: 78, target: 45, isPass: true, date: '2026-09-04' },
    ],
    'Telecommunications & Network Systems': [
      { id: 't1', examNum: 1, items: 50, score: 29, pct: 58, target: 65, isPass: false, date: '2026-08-14' },
      { id: 't2', examNum: 2, items: 50, score: 33, pct: 66, target: 65, isPass: true, date: '2026-08-22' },
      { id: 't3', examNum: 3, items: 50, score: 27, pct: 54, target: 45, isPass: true, date: '2026-09-02' },
    ],
    'General Engineering & Applied Sciences': [
      { id: 'g1', examNum: 1, items: 50, score: 36, pct: 72, target: 65, isPass: true, date: '2026-08-16' },
      { id: 'g2', examNum: 2, items: 50, score: 34, pct: 68, target: 45, isPass: true, date: '2026-08-24' },
    ],
  },
  journalEntries: [
    {
      id: 'j1',
      area: 'Electronic Systems & Devices',
      topic: 'BJT Small Signal Analysis (h-parameters vs r-model)',
      difficulty: 'Confusing re-model transconductance and emitter dynamic resistance in CE amplifier calculations.',
      solution: 'Remember re = 26mV / IE. In ac equivalent circuit, short all dc voltage sources and bypass capacitors to ground.',
      date: 'Sep 4, 2026',
      tags: ['BJT', 'Electronics'],
    },
    {
      id: 'j2',
      area: 'Mathematics & Basic Engineering',
      topic: 'Differential Equations - Second Order Non-Homogeneous',
      difficulty: 'Method of Undetermined Coefficients trial roots when matching homogeneous complementary solutions.',
      solution: 'Multiply candidate solution by x (or x^2) until no duplicate term appears in yc.',
      date: 'Sep 2, 2026',
      tags: ['Calculus', 'Math'],
    },
  ],
  exams: [
    {
      id: 'ex1',
      area: 'Electronic Systems & Devices',
      title: 'Mockboard Examination 5',
      date: '2026-09-12',
      time: '08:00',
    },
    {
      id: 'ex2',
      area: 'Telecommunications & Network Systems',
      title: 'Transmission Lines & Antennas Quiz',
      date: '2026-09-16',
      time: '13:30',
    },
  ],
  streak: {
    count: 5,
    lastStudyDate: Date.now() - 3600 * 1000,
  },
  hasCompletedAll: false,
  notifications: [
    {
      id: 'n1',
      title: '5-Day Study Streak Active! 🔥',
      message: 'Great discipline! You have maintained your review momentum for 5 straight days.',
      type: 'streak',
      timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      read: false,
      badge: '5 Days',
    },
    {
      id: 'n2',
      title: 'Area Conquered: Mathematics & Basic Engineering 🎉',
      message: 'Completed all 6 CEP exams with a qualifying passing average!',
      type: 'pass_area',
      timestamp: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
      read: true,
      area: 'Mathematics & Basic Engineering',
    },
  ],
  soundEnabled: true,
  pushEnabled: true,
};

export function loadDatabase(): AppDatabase {
  if (typeof window === 'undefined') {
    return { users: [DEMO_USER], activeUserId: DEMO_USER.id };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: AppDatabase = JSON.parse(raw);
      if (parsed.users && parsed.users.length > 0) {
        // Automatically migrate any legacy program name notations
        let changed = false;
        parsed.users = parsed.users.map((u) => {
          let p = u.program;
          if (p === 'BSeCe' || p === 'BS eCe') {
            p = 'BSECE';
            changed = true;
          } else if (p === 'BS ABE') {
            p = 'BSABE';
            changed = true;
          }
          return { ...u, program: p };
        });
        if (changed) {
          saveDatabase(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading storage:', e);
  }

  // First time initialization with demo user
  const initialDb: AppDatabase = {
    users: [DEMO_USER],
    activeUserId: DEMO_USER.id,
  };
  saveDatabase(initialDb);
  return initialDb;
}

export function saveDatabase(db: AppDatabase): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving storage:', e);
  }
}
