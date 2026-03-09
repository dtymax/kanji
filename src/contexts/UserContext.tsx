import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { UserData } from '../types';
import { loadUserData, saveUserData, calculateLevel, applyTheme } from '../utils/storage';

export interface NotificationEvent {
    type: 'levelUp' | 'newTitle';
    level?: number;
    title?: string;
}

type Action =
    | { type: 'ADD_SCORE'; points: number }
    | { type: 'ADD_EXPERIENCE'; amount: number }
    | { type: 'SET_GRADE'; grade: number }
    | { type: 'SET_NICKNAME'; nickname: string }
    | { type: 'SET_AVATAR'; avatar: string }
    | { type: 'TOGGLE_THEME' }
    | { type: 'TOGGLE_SOUND' }
    | { type: 'UPDATE_KANJI_PROGRESS'; kanji: string; field: 'readingOk' | 'writingOk' | 'strokeOk'; value: boolean }
    | { type: 'ADD_WEAK_KANJI'; kanji: string }
    | { type: 'REMOVE_WEAK_KANJI'; kanji: string }
    | { type: 'ADD_TITLE'; title: string }
    | { type: 'ADD_COLLECTION'; item: string }
    | { type: 'UPDATE_STORY_PROGRESS'; clearedNodeId: string }
    | { type: 'RESET_DATA' };

function userReducer(state: UserData, action: Action): UserData {
    switch (action.type) {
        case 'ADD_SCORE':
            return { ...state, totalScore: state.totalScore + action.points };

        case 'ADD_EXPERIENCE': {
            const newExp = state.experience + action.amount;
            const { level, title } = calculateLevel(newExp);
            const titles = state.titles.includes(title) ? state.titles : [...state.titles, title];
            return { ...state, experience: newExp, level, titles };
        }

        case 'SET_GRADE':
            return { ...state, currentGrade: action.grade };

        case 'UPDATE_STORY_PROGRESS':
            if (state.progress.clearedNodes.includes(action.clearedNodeId)) return state;
            return {
                ...state,
                progress: {
                    ...state.progress,
                    clearedNodes: [...state.progress.clearedNodes, action.clearedNodeId]
                }
            };

        case 'SET_NICKNAME':
            return { ...state, nickname: action.nickname };

        case 'SET_AVATAR':
            return { ...state, avatar: action.avatar };

        case 'TOGGLE_THEME': {
            const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
            return { ...state, settings: { ...state.settings, theme: newTheme } };
        }

        case 'TOGGLE_SOUND':
            return { ...state, settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled } };

        case 'UPDATE_KANJI_PROGRESS': {
            const existing = state.progress.kanjiProgress[action.kanji] || {
                readingOk: false, writingOk: false, strokeOk: false,
                lastStudied: '', correctCount: 0, wrongCount: 0,
            };
            return {
                ...state,
                progress: {
                    ...state.progress,
                    kanjiProgress: {
                        ...state.progress.kanjiProgress,
                        [action.kanji]: {
                            ...existing,
                            [action.field]: action.value,
                            lastStudied: new Date().toISOString().split('T')[0],
                            correctCount: action.value ? existing.correctCount + 1 : existing.correctCount,
                            wrongCount: action.value ? existing.wrongCount : existing.wrongCount + 1,
                        },
                    },
                },
            };
        }

        case 'ADD_WEAK_KANJI':
            if (state.progress.weakKanji.includes(action.kanji)) return state;
            return {
                ...state,
                progress: { ...state.progress, weakKanji: [...state.progress.weakKanji, action.kanji] },
            };

        case 'REMOVE_WEAK_KANJI':
            return {
                ...state,
                progress: {
                    ...state.progress,
                    weakKanji: state.progress.weakKanji.filter(k => k !== action.kanji),
                },
            };

        case 'ADD_TITLE':
            if (state.titles.includes(action.title)) return state;
            return { ...state, titles: [...state.titles, action.title] };

        case 'ADD_COLLECTION':
            if (state.collection.includes(action.item)) return state;
            return { ...state, collection: [...state.collection, action.item] };

        case 'RESET_DATA':
            return loadUserData();

        default:
            return state;
    }
}

interface UserContextType {
    user: UserData;
    dispatch: React.Dispatch<Action>;
    notifications: NotificationEvent[];
    clearNotifications: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, rawDispatch] = useReducer(userReducer, null, () => loadUserData());
    const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

    // Wrap dispatch to detect level-up and new titles
    const dispatch = useCallback((action: Action) => {
        rawDispatch(action);
    }, []);

    // Detect level-up and title changes after state updates
    const prevRef = React.useRef({ level: user.level, titles: [...user.titles] });

    useEffect(() => {
        const prev = prevRef.current;
        const newNotifs: NotificationEvent[] = [];

        if (user.level > prev.level) {
            newNotifs.push({ type: 'levelUp', level: user.level });
        }

        if (user.titles.length > prev.titles.length) {
            const latestTitle = user.titles[user.titles.length - 1];
            if (!prev.titles.includes(latestTitle)) {
                newNotifs.push({ type: 'newTitle', title: latestTitle });
            }
        }

        if (newNotifs.length > 0) {
            setNotifications(n => [...n, ...newNotifs]);
        }

        prevRef.current = { level: user.level, titles: [...user.titles] };
    }, [user.level, user.titles]);

    // Persist on every change
    useEffect(() => {
        saveUserData(user);
    }, [user]);

    // Apply theme on mount
    useEffect(() => {
        applyTheme(user.settings.theme);
    }, []);

    const clearNotifications = useCallback(() => setNotifications([]), []);

    return (
        <UserContext.Provider value={{ user, dispatch, notifications, clearNotifications }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
