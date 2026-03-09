import type { UserData, UserSettings, KanjiProgress, StudySession } from '../types';

const STORAGE_KEY = 'kanji_master_user';

const defaultSettings: UserSettings = {
    theme: 'light',
    soundEnabled: true,
    difficulty: 'normal',
};

export const defaultUserData: UserData = {
    nickname: 'カンジたろう',
    avatar: '🧒',
    currentGrade: 1,
    level: 1,
    experience: 0,
    totalScore: 0,
    titles: ['漢字見習い'],
    collection: [],
    progress: {
        kanjiProgress: {},
        weakKanji: [],
        studyHistory: [],
        clearedNodes: [],
    },
    settings: defaultSettings,
};

export function loadUserData(): UserData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                ...defaultUserData,
                ...parsed,
                progress: {
                    ...defaultUserData.progress,
                    ...(parsed.progress || {}),
                    weakKanji: parsed.progress?.weakKanji || [],
                    kanjiProgress: parsed.progress?.kanjiProgress || {},
                    clearedNodes: parsed.progress?.clearedNodes || [],
                },
                settings: {
                    ...defaultUserData.settings,
                    ...(parsed.settings || {})
                }
            };
        }
    } catch (e) {
        console.warn('Failed to load user data:', e);
    }
    return { ...defaultUserData };
}

export function saveUserData(data: UserData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save user data:', e);
    }
}

export function updateKanjiProgress(
    current: Record<string, KanjiProgress>,
    kanji: string,
    field: keyof Pick<KanjiProgress, 'readingOk' | 'writingOk' | 'strokeOk'>,
    value: boolean
): Record<string, KanjiProgress> {
    const existing = current[kanji] || {
        readingOk: false,
        writingOk: false,
        strokeOk: false,
        lastStudied: '',
        correctCount: 0,
        wrongCount: 0,
    };
    return {
        ...current,
        [kanji]: {
            ...existing,
            [field]: value,
            lastStudied: new Date().toISOString().split('T')[0],
            correctCount: value ? existing.correctCount + 1 : existing.correctCount,
            wrongCount: value ? existing.wrongCount : existing.wrongCount + 1,
        },
    };
}

export function addStudySession(
    history: StudySession[],
    session: StudySession
): StudySession[] {
    return [...history, session].slice(-90); // keep last 90 days
}

// 各レベルの必要XP（連続レベル、飛ばしなし）
const LEVEL_THRESHOLDS = [
    0,      // Lv.1
    50,     // Lv.2
    100,    // Lv.3
    180,    // Lv.4
    250,    // Lv.5
    350,    // Lv.6
    500,    // Lv.7
    700,    // Lv.8
    900,    // Lv.9
    1200,   // Lv.10
    1500,   // Lv.11
    2000,   // Lv.12
    2500,   // Lv.13
    3200,   // Lv.14
    4000,   // Lv.15
    4500,   // Lv.16
    5000,   // Lv.17
    5800,   // Lv.18
    6500,   // Lv.19
    7500,   // Lv.20
    8500,   // Lv.21
    10000,  // Lv.22
    12000,  // Lv.23
    14000,  // Lv.24
    16000,  // Lv.25
    18000,  // Lv.26
    20000,  // Lv.27
    22000,  // Lv.28
    24000,  // Lv.29
    25000,  // Lv.30
];

function getTitleForExp(exp: number): string {
    if (exp >= 25000) return '漢字レジェンド';
    if (exp >= 10000) return '漢字博士';
    if (exp >= 5000) return '漢字マスター';
    if (exp >= 2000) return '漢字ファイター';
    if (exp >= 500) return '漢字チャレンジャー';
    return '漢字見習い';
}

export function calculateLevel(experience: number): { level: number; title: string } {
    let level = 1;
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
        if (experience >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    return { level, title: getTitleForExp(experience) };
}

export function getExpForLevel(level: number): number {
    if (level < 1) return 0;
    if (level > 30) return LEVEL_THRESHOLDS[29];
    return LEVEL_THRESHOLDS[level - 1];
}

export function getExpForNextLevel(level: number): number {
    if (level >= 30) return LEVEL_THRESHOLDS[29] + 25000;
    return LEVEL_THRESHOLDS[level]; // level is 1-indexed, so LEVEL_THRESHOLDS[level] is next level
}

export function applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
}
