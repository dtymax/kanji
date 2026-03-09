// ============================
// 型定義
// ============================

export interface KanjiReading {
  onyomi: string[];
  kunyomi: string[];
}

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiData {
  character: string;
  grade: number;
  strokes: number;
  radical: string;
  radicalReading: string;
  readings: KanjiReading;
  meanings: string[];
  examples: KanjiExample[];
  relatedIdioms?: string[];
  kankenLevel: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizType;
  grade: number;
  difficulty: number;
  question: string;
  answer: string;
  choices?: string[];
  hint?: string;
  category: string;
  targetKanji?: string;
}

export type QuizType =
  | 'reading'
  | 'writing'
  | 'stroke_order'
  | 'yojijukugo'
  | 'okurigana'
  | 'antonym'
  | 'synonym'
  | 'sentence'
  | 'radical'
  | 'compound';

export type GameMode = 'normal' | 'weak' | 'timeattack' | 'story';

export interface TimeAttackConfig {
  type: 'countdown' | 'stopwatch';
  value: number; // seconds for countdown, questions for stopwatch
  grades?: number[]; // 対象となる学年の配列 (1-6)
}

// --- Story Mode ---

export type StoryEnemyType = 'normal' | 'midboss' | 'boss';

export interface StoryEnemy {
  id: string;          // 敵の一意なID
  name: string;        // 敵の名前（UI表示用）
  image: string;       // 画像ファイルのパス
  hp: number;          // 倒すために必要な正解数
  type: StoryEnemyType;
}

export interface StoryNode {
  id: string;          // ノードID (例: 'hokkaido_1')
  enemy: StoryEnemy;
  isCleared: boolean;
  position: { x: number; y: number }; // マップ上の相対配置 (0-100%)
}

export interface StoryMap {
  id: string;          // エリアID (例: 'hokkaido')
  name: string;        // エリア名 (例: '北海道')
  grade: number;       // 対象学年 (1-6, 7はにがて帳の総復習)
  bgImage: string;     // 背景画像のパス
  nodes: StoryNode[];  // このエリアに属するマスの配列
}

export interface UserProgress {
  kanjiProgress: Record<string, KanjiProgress>;
  weakKanji: string[];
  studyHistory: StudySession[];
  clearedNodes: string[]; // ストーリーモードでクリアしたノードIDのリスト
}

export interface KanjiProgress {
  readingOk: boolean;
  writingOk: boolean;
  strokeOk: boolean;
  lastStudied: string;
  correctCount: number;
  wrongCount: number;
}

export interface StudySession {
  date: string;
  timeSpent: number;
  questionsAnswered: number;
  correctRate: number;
  grade: number;
}

export interface UserData {
  nickname: string;
  avatar: string;
  currentGrade: number;
  level: number;
  experience: number;
  totalScore: number;
  titles: string[];
  collection: string[];
  progress: UserProgress;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface ScoreEvent {
  points: number;
  reason: string;
  timestamp: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  minExp: number;
  maxExp: number;
}

export const LEVEL_TABLE: LevelInfo[] = [
  { level: 1, title: '漢字見習い', minExp: 0, maxExp: 100 },
  { level: 2, title: '漢字見習い', minExp: 100, maxExp: 250 },
  { level: 3, title: '漢字見習い', minExp: 250, maxExp: 500 },
  { level: 5, title: '漢字チャレンジャー', minExp: 500, maxExp: 1000 },
  { level: 7, title: '漢字チャレンジャー', minExp: 1000, maxExp: 2000 },
  { level: 10, title: '漢字ファイター', minExp: 2000, maxExp: 3500 },
  { level: 13, title: '漢字ファイター', minExp: 3500, maxExp: 5000 },
  { level: 15, title: '漢字マスター', minExp: 5000, maxExp: 7500 },
  { level: 18, title: '漢字マスター', minExp: 7500, maxExp: 10000 },
  { level: 20, title: '漢字博士', minExp: 10000, maxExp: 15000 },
  { level: 25, title: '漢字博士', minExp: 15000, maxExp: 25000 },
  { level: 30, title: '漢字レジェンド', minExp: 25000, maxExp: 50000 },
];

export const GRADE_NAMES: Record<number, string> = {
  1: '一年生',
  2: '二年生',
  3: '三年生',
  4: '四年生',
  5: '五年生',
  6: '六年生',
};

export const GRADE_COLORS: Record<number, string> = {
  1: '#FF6B6B',
  2: '#FF9F43',
  3: '#FECA57',
  4: '#48DBFB',
  5: '#5F7ADB',
  6: '#A855F7',
};

export const GRADE_KANJI_COUNT: Record<number, number> = {
  1: 80,
  2: 160,
  3: 200,
  4: 202,
  5: 193,
  6: 191,
};
