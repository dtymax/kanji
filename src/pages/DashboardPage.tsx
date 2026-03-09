import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getExpForLevel, getExpForNextLevel } from '../utils/storage';
import { GRADE_COLORS } from '../types';
import type { KanjiData } from '../types';
import './DashboardPage.css';

interface DashboardPageProps {
    onBack: () => void;
    onSelectKanji: (character: string, grade: number) => void;
}

const AVATAR_OPTIONS = [
    '🧒', '👦', '👧', '🧑', '👨', '👩',
    '🐱', '🐶', '🦊', '🐻', '🐼', '🐯',
    '🦁', '🐸', '🐵', '🐹', '🐰', '🐨',
    '🐮', '🐷', '🦄', '🐲', '🐙', '🐬',
];

type StatModalType = 'learned' | 'mastered' | 'weak' | null;

export default function DashboardPage({ onBack, onSelectKanji }: DashboardPageProps) {
    const { user, dispatch } = useUser();

    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(user.nickname);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [statModal, setStatModal] = useState<StatModalType>(null);
    const [kanjiGradeMap, setKanjiGradeMap] = useState<Record<string, number>>({});

    // 全学年の漢字データを読み込んで、漢字→学年のマッピングを作成
    useEffect(() => {
        const map: Record<string, number> = {};
        Promise.all(
            [1, 2, 3, 4, 5, 6].map(grade =>
                fetch(`/data/kanji/grade${grade}.json`)
                    .then(res => res.json())
                    .then((data: KanjiData[]) => {
                        data.forEach(k => { map[k.character] = grade; });
                    })
                    .catch(() => { })
            )
        ).then(() => setKanjiGradeMap(map));
    }, []);

    const totalKanjiLearned = Object.keys(user.progress.kanjiProgress).length;
    const masteredKanji = Object.values(user.progress.kanjiProgress)
        .filter(p => p.readingOk && p.writingOk).length;

    const currentLevelExp = getExpForLevel(user.level);
    const nextLevelExp = getExpForNextLevel(user.level);
    const expProgress = nextLevelExp > currentLevelExp
        ? ((user.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
        : 100;

    // 各統計の漢字リスト
    function getStatKanjiList(type: StatModalType): string[] {
        if (type === 'learned') {
            return Object.keys(user.progress.kanjiProgress);
        }
        if (type === 'mastered') {
            return Object.entries(user.progress.kanjiProgress)
                .filter(([, p]) => p.readingOk && p.writingOk)
                .map(([k]) => k);
        }
        if (type === 'weak') {
            return user.progress.weakKanji;
        }
        return [];
    }

    function getStatModalTitle(type: StatModalType): string {
        if (type === 'learned') return '📚 学習した漢字';
        if (type === 'mastered') return '✅ マスターした漢字';
        if (type === 'weak') return '📓 にがてな漢字';
        return '';
    }

    function handleNameSave() {
        const trimmed = nameInput.trim();
        if (trimmed && trimmed !== user.nickname) {
            dispatch({ type: 'SET_NICKNAME', nickname: trimmed });
        }
        setEditingName(false);
    }

    function handleAvatarSelect(avatar: string) {
        dispatch({ type: 'SET_AVATAR', avatar });
        setShowAvatarPicker(false);
    }

    // kanjiGradeMapから正しい学年を取得
    function findKanjiGrade(char: string): number {
        return kanjiGradeMap[char] || user.currentGrade || 1;
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <button className="btn btn-ghost btn-sm" onClick={onBack}>← もどる</button>
                <h1 className="section-title">📊 マイページ</h1>
            </div>

            {/* プロフィールカード */}
            <div className="profile-card card">
                <div className="profile-header">
                    <div
                        className="profile-avatar clickable"
                        onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                        title="アバターを変更"
                    >
                        {user.avatar}
                        <span className="avatar-edit-badge">✏️</span>
                    </div>
                    <div className="profile-info">
                        {editingName ? (
                            <input
                                className="profile-name-input"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); }}
                                onBlur={handleNameSave}
                                autoFocus
                                maxLength={20}
                            />
                        ) : (
                            <h2
                                className="profile-name clickable"
                                onClick={() => { setEditingName(true); setNameInput(user.nickname); }}
                                title="名前を変更"
                            >
                                {user.nickname}
                                <span className="name-edit-icon">✏️</span>
                            </h2>
                        )}
                        <div className="profile-title">🎖️ {user.titles[user.titles.length - 1]}</div>
                    </div>
                    <div className="profile-level">
                        <span className="level-number">Lv.{user.level}</span>
                        <div className="progress-bar" style={{ width: '100px' }}>
                            <div className="progress-bar-fill" style={{ width: `${expProgress}%` }} />
                        </div>
                        <span className="exp-text">{user.experience} / {nextLevelExp} XP</span>
                    </div>
                </div>

                {/* アバターピッカー */}
                {showAvatarPicker && (
                    <div className="avatar-picker">
                        {AVATAR_OPTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                className={`avatar-option ${user.avatar === emoji ? 'selected' : ''}`}
                                onClick={() => handleAvatarSelect(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 統計カード */}
            <div className="stats-grid">
                <div className="stat-card card">
                    <span className="stat-card-icon">🏆</span>
                    <span className="stat-card-value">{user.totalScore.toLocaleString()}</span>
                    <span className="stat-card-label">合計スコア</span>
                </div>
                <div className="stat-card card clickable" onClick={() => setStatModal('learned')}>
                    <span className="stat-card-icon">📚</span>
                    <span className="stat-card-value">{totalKanjiLearned}</span>
                    <span className="stat-card-label">学習した漢字</span>
                </div>
                <div className="stat-card card clickable" onClick={() => setStatModal('mastered')}>
                    <span className="stat-card-icon">✅</span>
                    <span className="stat-card-value">{masteredKanji}</span>
                    <span className="stat-card-label">マスターした漢字</span>
                </div>
                <div className="stat-card card clickable" onClick={() => setStatModal('weak')}>
                    <span className="stat-card-icon">📓</span>
                    <span className="stat-card-value">{user.progress.weakKanji.length}</span>
                    <span className="stat-card-label">にがて漢字</span>
                </div>
            </div>

            {/* 統計モーダル */}
            {statModal && (
                <div className="stat-modal-overlay" onClick={() => setStatModal(null)}>
                    <div className="stat-modal card" onClick={(e) => e.stopPropagation()}>
                        <div className="stat-modal-header">
                            <h3>{getStatModalTitle(statModal)}</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setStatModal(null)}>✕</button>
                        </div>
                        <div className="stat-modal-body">
                            {getStatKanjiList(statModal).length === 0 ? (
                                <p className="stat-modal-empty">
                                    {statModal === 'weak' ? '🎉 にがてな漢字はありません！' : 'まだ漢字がありません'}
                                </p>
                            ) : (
                                <div className="stat-kanji-grid">
                                    {getStatKanjiList(statModal).map(k => (
                                        <button
                                            key={k}
                                            className="stat-kanji-chip"
                                            onClick={() => {
                                                setStatModal(null);
                                                onSelectKanji(k, findKanjiGrade(k));
                                            }}
                                        >
                                            {k}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* にがて帳 */}
            <div className="dashboard-section">
                <h2 className="section-title"><span>📓</span> にがて帳</h2>
                {user.progress.weakKanji.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                        <p style={{ fontSize: '2rem' }}>🎉</p>
                        <p>にがてな漢字はありません！すごい！</p>
                    </div>
                ) : (
                    <div className="weak-kanji-grid">
                        {user.progress.weakKanji.map(k => (
                            <div key={k} className="weak-kanji-chip">
                                <span
                                    className="weak-kanji-char clickable"
                                    onClick={() => onSelectKanji(k, findKanjiGrade(k))}
                                    title="漢字の詳細を見る"
                                >
                                    {k}
                                </span>
                                <button
                                    className="weak-kanji-remove"
                                    onClick={() => dispatch({ type: 'REMOVE_WEAK_KANJI', kanji: k })}
                                    title="にがて帳から削除"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 称号一覧 */}
            <div className="dashboard-section">
                <h2 className="section-title"><span>🎖️</span> しょうごう</h2>
                <div className="titles-grid">
                    {user.titles.map((title, i) => (
                        <div key={i} className="title-chip animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                            ⭐ {title}
                        </div>
                    ))}
                </div>
            </div>

            {/* 学年別進捗 */}
            <div className="dashboard-section">
                <h2 className="section-title"><span>📈</span> 学年べつ進捗</h2>
                <div className="grade-progress-list">
                    {[1, 2, 3, 4, 5, 6].map(grade => {
                        const total = getGradeTotal(grade);
                        const learned = getGradeLearned(grade, user.progress.kanjiProgress);
                        const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
                        return (
                            <div key={grade} className="grade-progress-row">
                                <span className="grade-progress-label" style={{ color: GRADE_COLORS[grade] }}>
                                    {grade}年生
                                </span>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${pct}%`,
                                            background: `linear-gradient(90deg, ${GRADE_COLORS[grade]}, ${GRADE_COLORS[grade]}88)`,
                                        }}
                                    />
                                </div>
                                <span className="grade-progress-pct">{pct}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 設定 */}
            <div className="dashboard-section">
                <h2 className="section-title"><span>⚙️</span> 設定</h2>
                <div className="card settings-card">
                    <div className="setting-row">
                        <span>🌙 ダークモード</span>
                        <button
                            className={`toggle-switch ${user.settings.theme === 'dark' ? 'active' : ''}`}
                            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                        >
                            <div className="toggle-thumb" />
                        </button>
                    </div>
                    <div className="setting-row">
                        <span>🔊 効果音</span>
                        <button
                            className={`toggle-switch ${user.settings.soundEnabled ? 'active' : ''}`}
                            onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
                        >
                            <div className="toggle-thumb" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getGradeTotal(grade: number): number {
    const counts: Record<number, number> = { 1: 80, 2: 160, 3: 200, 4: 202, 5: 193, 6: 191 };
    return counts[grade] || 0;
}

function getGradeLearned(_grade: number, progress: Record<string, { readingOk: boolean; writingOk: boolean }>): number {
    return Object.values(progress).filter(p => p.readingOk || p.writingOk).length;
}
