import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { GRADE_NAMES, GRADE_COLORS, GRADE_KANJI_COUNT } from '../types';
import type { GameMode, TimeAttackConfig, KanjiData } from '../types';
import './HomePage.css';

interface HomePageProps {
    onSelectGrade: (grade: number) => void;
    onStartQuiz: (grade: number, gameMode?: GameMode, timeConfig?: TimeAttackConfig) => void;
    onNavigateToStory: () => void;
}

export default function HomePage({ onSelectGrade, onStartQuiz, onNavigateToStory }: HomePageProps) {
    const { user } = useUser();
    const grades = [1, 2, 3, 4, 5, 6];

    // タイムアタック用ステート
    const [showTimeAttackModal, setShowTimeAttackModal] = useState(false);
    const [timeAttackType, setTimeAttackType] = useState<'countdown' | 'stopwatch'>('countdown');
    const [timeAttackValue, setTimeAttackValue] = useState(60);
    const [timeAttackGrades, setTimeAttackGrades] = useState<number[]>([user.currentGrade]);
    const [kanjiGradeMap, setKanjiGradeMap] = useState<Record<string, number>>({});

    useEffect(() => {
        const map: Record<string, number> = {};
        Promise.all(
            [1, 2, 3, 4, 5, 6].map(g =>
                fetch(`./data/kanji/grade${g}.json`)
                    .then(res => res.json())
                    .then((data: KanjiData[]) => {
                        data.forEach(k => { map[k.character] = g; });
                    })
                    .catch(() => { })
            )
        ).then(() => setKanjiGradeMap(map));
    }, []);

    // Calculate progression percentages
    const getProgress = (grade: number) => {
        if (Object.keys(kanjiGradeMap).length === 0) return 0;
        const total = GRADE_KANJI_COUNT[grade];
        const learned = Object.entries(user.progress.kanjiProgress)
            .filter(([char, v]) => kanjiGradeMap[char] === grade && (v.readingOk || v.writingOk)).length;
        return Math.min(Math.round((learned / total) * 100), 100);
    };

    const handleWeakKanjiClick = () => {
        if (user.progress.weakKanji.length === 0) {
            alert('にがてな漢字がありません。\nまずは通常の学習やクイズを進めて、にがてな漢字を集めましょう！');
            return;
        }
        onStartQuiz(user.currentGrade, 'weak');
    };

    const handleTimeAttackStart = () => {
        if (timeAttackGrades.length === 0) {
            alert('出題する学年を少なくとも1つ選んでください。');
            return;
        }
        setShowTimeAttackModal(false);
        // 学年はダミーとして1を渡し、実際の対象はtimeConfig内のgradesで制御する
        onStartQuiz(1, 'timeattack', { type: timeAttackType, value: timeAttackValue, grades: timeAttackGrades });
    };

    return (
        <div className="home-page">
            {/* ヒーローセクション */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-avatar">{user.avatar}</div>
                    <div className="hero-info">
                        <h1 className="hero-greeting">
                            こんにちは、<span className="hero-name">{user.nickname}</span>さん！
                        </h1>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-icon">⭐</span>
                                <span className="hero-stat-value">Lv.{user.level}</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-icon">🏆</span>
                                <span className="hero-stat-value">{user.totalScore.toLocaleString()}pt</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-icon">🎖️</span>
                                <span className="hero-stat-value">{user.titles[user.titles.length - 1]}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-decoration">
                    <span className="floating-kanji" style={{ animationDelay: '0s' }}>漢</span>
                    <span className="floating-kanji" style={{ animationDelay: '0.5s' }}>字</span>
                    <span className="floating-kanji" style={{ animationDelay: '1s' }}>学</span>
                    <span className="floating-kanji" style={{ animationDelay: '1.5s' }}>習</span>
                </div>
            </section>

            {/* 学年選択 */}
            <section className="grade-section">
                <h2 className="section-title">
                    <span>📚</span> 学年をえらぼう
                </h2>
                <div className="grade-grid">
                    {grades.map((grade) => (
                        <div
                            key={grade}
                            className="grade-card"
                            style={{ '--grade-color': GRADE_COLORS[grade] } as React.CSSProperties}
                            onClick={() => onSelectGrade(grade)}
                        >
                            <div className="grade-card-header">
                                <span className="grade-number">{grade}</span>
                                <span className="grade-label">{GRADE_NAMES[grade]}</span>
                            </div>
                            <div className="grade-card-body">
                                <div className="grade-kanji-count">{GRADE_KANJI_COUNT[grade]}字</div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${getProgress(grade)}%` }}
                                    />
                                </div>
                                <span className="grade-progress-text">{getProgress(grade)}% 学習済み</span>
                            </div>
                            <div className="grade-card-actions">
                                <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); onSelectGrade(grade); }}>
                                    📝 学習
                                </button>
                                <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); onStartQuiz(grade); }}>
                                    🎯 クイズ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* クイックアクション */}
            <section className="quick-actions">
                <h2 className="section-title">
                    <span>🎮</span> ゲームモード
                </h2>
                <div className="action-grid">
                    <button className="action-card story-card" onClick={onNavigateToStory}>
                        <div className="action-icon">🗺️</div>
                        <div className="action-title">ストーリーモード</div>
                        <div className="action-desc">漢字の島を冒険しよう！</div>
                    </button>
                    <button className="action-card time-card" onClick={() => setShowTimeAttackModal(true)}>
                        <div className="action-icon">⏱️</div>
                        <div className="action-title">タイムアタック</div>
                        <div className="action-desc">時間内に何問とける？</div>
                    </button>
                    <button className="action-card weak-card" onClick={handleWeakKanjiClick}>
                        <div className="action-icon">📓</div>
                        <div className="action-title">にがて帳</div>
                        <div className="action-desc">{user.progress.weakKanji.length}字の復習</div>
                    </button>
                    <button className="action-card kanken-card" onClick={() => alert('準備中です！')}>
                        <div className="action-icon">🎓</div>
                        <div className="action-title">漢検チャレンジ</div>
                        <div className="action-desc">漢字検定に挑戦！</div>
                    </button>
                </div>
            </section>

            {/* タイムアタック設定モーダル */}
            {showTimeAttackModal && (
                <div className="modal-overlay" onClick={() => setShowTimeAttackModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowTimeAttackModal(false)}>×</button>
                        <h2 className="modal-title">⏱️ タイムアタック設定</h2>

                        <div className="modal-body">
                            <div className="timeattack-tabs">
                                <button
                                    className={`tab-btn ${timeAttackType === 'countdown' ? 'active' : ''}`}
                                    onClick={() => { setTimeAttackType('countdown'); setTimeAttackValue(60); }}
                                >
                                    カウントダウン<br /><small>制限時間内に何問解けるか</small>
                                </button>
                                <button
                                    className={`tab-btn ${timeAttackType === 'stopwatch' ? 'active' : ''}`}
                                    onClick={() => { setTimeAttackType('stopwatch'); setTimeAttackValue(10); }}
                                >
                                    ストップウォッチ<br /><small>規定問題数を解く時間を計る</small>
                                </button>
                            </div>

                            <div className="timeattack-grades">
                                <h3>出題する学年を選択：</h3>
                                <div className="grade-checkboxes">
                                    {[1, 2, 3, 4, 5, 6].map(g => (
                                        <label key={g} className="grade-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={timeAttackGrades.includes(g)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setTimeAttackGrades(prev => [...prev, g].sort());
                                                    } else {
                                                        setTimeAttackGrades(prev => prev.filter(grade => grade !== g));
                                                    }
                                                }}
                                            />
                                            {g}年生
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="timeattack-options">
                                <h3>{timeAttackType === 'countdown' ? '制限時間' : '問題数'}を選択：</h3>
                                <div className="option-buttons">
                                    {timeAttackType === 'countdown' && [15, 30, 60, 180, 300].map(val => (
                                        <button
                                            key={val}
                                            className={`option-btn ${timeAttackValue === val ? 'selected' : ''}`}
                                            onClick={() => setTimeAttackValue(val)}
                                        >
                                            {val >= 60 ? `${val / 60}分` : `${val}秒`}
                                        </button>
                                    ))}
                                    {timeAttackType === 'stopwatch' && [10, 20, 30].map(val => (
                                        <button
                                            key={val}
                                            className={`option-btn ${timeAttackValue === val ? 'selected' : ''}`}
                                            onClick={() => setTimeAttackValue(val)}
                                        >
                                            {val}問
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => setShowTimeAttackModal(false)}>
                                キャンセル
                            </button>
                            <button className="btn btn-primary" onClick={handleTimeAttackStart}>
                                ゲームスタート！
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
