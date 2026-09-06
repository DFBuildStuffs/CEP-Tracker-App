export type ProgramType = 'BSABE' | 'BSCE' | 'BSECE' | 'Custom';

export interface CEPExamRecord {
  id: string;
  examNum: number;
  isSpecial?: boolean;
  specialIndex?: number;
  items: number;
  score: number;
  pct: number;
  target: number;
  isPass: boolean;
  date: string;
}

export interface JournalEntry {
  id: string;
  area: string;
  topic: string;
  difficulty: string;
  solution: string;
  date: string;
  tags?: string[];
}

export interface ScheduledExam {
  id: string;
  area: string;
  title: string;
  date: string;
  time?: string;
  reminderSent?: boolean;
}

export interface MilestoneNotification {
  id: string;
  title: string;
  message: string;
  type: 'pass_initial' | 'pass_area' | 'all_completed' | 'streak' | 'hours' | 'timer' | 'exam_soon';
  timestamp: string;
  read: boolean;
  badge?: string;
  area?: string;
}

export interface StreakData {
  count: number;
  lastStudyDate: number | null; // ms timestamp
}

export interface UserAccount {
  id: string;
  userName: string;
  email?: string;
  avatar: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'local';
  program: ProgramType | string;
  passTarget: number;
  maintTarget: number;
  pin: string;
  areas: string[];
  themeMode: 'dark' | 'light';
  studyHours: Record<string, number>;
  mockHours: Record<string, number>;
  cepRecords: Record<string, CEPExamRecord[]>;
  journalEntries: JournalEntry[];
  exams: ScheduledExam[];
  streak: StreakData;
  hasCompletedAll: boolean;
  notifications: MilestoneNotification[];
  soundEnabled: boolean;
  pushEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleId?: string;
}

export interface ChatRoleConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
  systemInstruction: string;
  suggestedPrompts: string[];
}

export interface AppDatabase {
  users: UserAccount[];
  activeUserId: string | null;
}

export interface ActiveSession {
  timerRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  elapsedSeconds: number;
  engine: 'pomodoro' | 'normal';
  isStudyPhase: boolean; // for pomodoro: true = study (50m), false = break (10m)
  area: string;
  type: 'study' | 'mock';
  intervalDuration: number;
}
