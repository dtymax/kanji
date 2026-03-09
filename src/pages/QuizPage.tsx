import { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import type { QuizQuestion, GameMode, TimeAttackConfig, StoryEnemy } from '../types';
import { GRADE_COLORS, GRADE_NAMES } from '../types';
import { STORY_MAPS } from '../data/storyMap';
import { useUser } from '../contexts/UserContext';
import './QuizPage.css';

interface QuizPageProps {
    grade: number;
    gameMode?: GameMode;
    timeConfig?: TimeAttackConfig;
    storyNodeId?: string;
    onBack: () => void;
}

export default function QuizPage({ grade, gameMode = 'normal', timeConfig, storyNodeId, onBack }: QuizPageProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);
    const [totalCorrect, setTotalCorrect] = useState(0);
    // タイムアタック・にがて帳は種類選択をスキップして全種類を出す
    const [quizType, setQuizType] = useState<string | null>(gameMode !== 'normal' ? 'all' : null);

    // 計測用ステート
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(timeConfig?.type === 'countdown' ? timeConfig.value : null);
    const [timeElapsed, setTimeElapsed] = useState<number>(0);

    const [storyEnemy, setStoryEnemy] = useState<StoryEnemy | null>(null);
    const [storyEnemyHp, setStoryEnemyHp] = useState<number>(0);

    const [scorePopup, setScorePopup] = useState<{ points: number; id: number } | null>(null);
    const [handwrittenChar, setHandwrittenChar] = useState('');
    const writerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);
    const { user, dispatch } = useUser();

    // Initialize Story mode enemy
    useEffect(() => {
        if (gameMode === 'story' && storyNodeId) {
            for (const map of STORY_MAPS) {
                const node = map.nodes.find(n => n.id === storyNodeId);
                if (node) {
                    setStoryEnemy(node.enemy);
                    setStoryEnemyHp(node.enemy.hp);
                    break;
                }
            }
        }
    }, [gameMode, storyNodeId]);

    // Load quiz data
    useEffect(() => {
        if (!quizType) return;

        const loadQuestions = async () => {
            try {
                let allQuestions: QuizQuestion[] = [];
                if (gameMode === 'weak') {
                    // にがて帳モード: 全学年から取得して、weakKanjiに含まれるものだけ抽出
                    const promises = [1, 2, 3, 4, 5, 6].map(g => fetch(`./data/quiz/grade${g}_quiz.json`).then(r => r.json()));
                    const results = await Promise.all(promises);
                    allQuestions = results.flat().filter((q: QuizQuestion) => q.targetKanji && user.progress.weakKanji.includes(q.targetKanji));
                } else if (gameMode === 'timeattack' && timeConfig?.grades && timeConfig.grades.length > 0) {
                    // タイムアタックモード（複数学年選択時）: 選択された学年からクイズを取得
                    const promises = timeConfig.grades.map(g => fetch(`./data/quiz/grade${g}_quiz.json`).then(r => r.json()));
                    const results = await Promise.all(promises);
                    allQuestions = results.flat();
                } else {
                    // 通常モード・単一学年指定時: 指定学年のクイズ
                    const res = await fetch(`./data/quiz/grade${grade}_quiz.json`);
                    allQuestions = await res.json();
                }

                // Shuffle
                let shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

                // 絞り込み
                if (quizType !== 'all') {
                    shuffled = shuffled.filter(q => q.type === quizType);
                }

                // ストップウォッチモードなら問題数を制限
                if (gameMode === 'timeattack' && timeConfig?.type === 'stopwatch') {
                    shuffled = shuffled.slice(0, timeConfig.value);
                }

                setQuestions(shuffled);
            } catch (e) {
                setQuestions([]);
            }
        };
        loadQuestions();
    }, [grade, quizType, gameMode, timeConfig, user.progress.weakKanji]);

    // Timer setup for TimeAttack
    useEffect(() => {
        if (gameMode !== 'timeattack' || quizComplete || questions.length === 0) return;

        timerRef.current = setInterval(() => {
            if (timeConfig?.type === 'countdown') {
                setTimeLeft(prev => {
                    if (prev !== null && prev <= 1) {
                        clearInterval(timerRef.current!);
                        setQuizComplete(true);
                        return 0;
                    }
                    return prev !== null ? prev - 1 : 0;
                });
            } else if (timeConfig?.type === 'stopwatch') {
                setTimeElapsed(prev => prev + 1);
            }
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameMode, quizComplete, questions.length, timeConfig]);

    useEffect(() => {
        if (!quizComplete) {
            setQuestionStartTime(Date.now());
        }
    }, [currentIdx, quizComplete]);

    const currentQ = questions[currentIdx];

    // Init HanziWriter for writing questions
    useEffect(() => {
        if (!currentQ || !(currentQ.type === 'writing' || currentQ.type === 'stroke_order' || currentQ.type === 'sentence')) return;
        if (!writerRef.current) return;

        writerRef.current.innerHTML = '';
        setHandwrittenChar('');

        try {
            const writer = HanziWriter.create(writerRef.current, currentQ.answer, {
                width: 200,
                height: 200,
                padding: 8,
                showOutline: false,
                showCharacter: false,
                strokeColor: '#333',
                outlineColor: '#eee',
                drawingColor: GRADE_COLORS[grade] || GRADE_COLORS[1],
                showHintAfterMisses: 3,
                highlightOnComplete: true,
                highlightColor: GRADE_COLORS[grade] || GRADE_COLORS[1],
                leniency: 2.5,
                acceptBackwardsStrokes: true,
                charDataLoader: (char: string) => {
                    return fetch(`https://cdn.jsdelivr.net/npm/@jamsch/hanzi-writer-data-jp@latest/${encodeURIComponent(char)}.json?v=2`)
                        .then(r => r.json());
                }
            });

            writer.quiz({
                onComplete: () => {
                    setHandwrittenChar(currentQ.answer);
                    const correct = true;
                    handleAnswer(currentQ.answer, correct);
                }
            });
        } catch (e) {
            console.warn('HanziWriter quiz error:', e);
        }
    }, [currentQ]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (answer: string, forceCorrect?: boolean) => {
        const correct = forceCorrect !== undefined ? forceCorrect : answer === currentQ.answer;
        setIsCorrect(correct);
        setSelected(answer);
        setShowResult(true);

        const elapsed = (Date.now() - questionStartTime) / 1000;
        let points = 0;

        if (correct) {
            points = 10;
            if (elapsed < 3) points += 5; // Quick answer bonus

            const newCombo = combo + 1;
            setCombo(newCombo);
            if (newCombo >= 10) points = Math.round(points * 2.0);
            else if (newCombo >= 5) points = Math.round(points * 1.5);

            setScore(s => s + points);
            setTotalCorrect(c => c + 1);
            dispatch({ type: 'ADD_SCORE', points });
            dispatch({ type: 'ADD_EXPERIENCE', amount: points });

            if (currentQ.targetKanji) {
                const field = currentQ.type === 'reading' ? 'readingOk' : 'writingOk';
                dispatch({ type: 'UPDATE_KANJI_PROGRESS', kanji: currentQ.targetKanji, field, value: true });

                // にがて帳モードなら正解すると克服！
                if (gameMode === 'weak') {
                    dispatch({ type: 'REMOVE_WEAK_KANJI', kanji: currentQ.targetKanji });
                }
            }

            if (gameMode === 'story' && storyEnemyHp > 0) {
                setStoryEnemyHp(prev => prev - 1);
            }

            setScorePopup({ points, id: Date.now() });
            setTimeout(() => setScorePopup(null), 1000);
        } else {
            setCombo(0);
            if (currentQ.targetKanji) {
                dispatch({ type: 'ADD_WEAK_KANJI', kanji: currentQ.targetKanji });
            }
        }
    };

    const handleNext = () => {
        if (gameMode === 'story' && storyEnemyHp <= 0) {
            setQuizComplete(true);
            if (storyNodeId) {
                dispatch({ type: 'UPDATE_STORY_PROGRESS', clearedNodeId: storyNodeId });
            }
        } else if (currentIdx + 1 >= questions.length) {
            if (gameMode === 'story') {
                // ストーリーモードで問題が尽きたらシャッフルしてループ
                setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
                setCurrentIdx(0);
                setSelected(null);
                setShowResult(false);
            } else {
                setQuizComplete(true);
            }
        } else {
            setCurrentIdx(currentIdx + 1);
            setSelected(null);
            setShowResult(false);
        }
    };

    const handleRestart = () => {
        setCurrentIdx(0);
        setSelected(null);
        setShowResult(false);
        setScore(0);
        setCombo(0);
        setTotalCorrect(0);
        setQuizComplete(false);
        if (gameMode === 'normal') setQuizType(null); // timeattackやweakの場合は再選択しない
        setTimeLeft(timeConfig?.type === 'countdown' ? timeConfig.value : null);
        setTimeElapsed(0);
        setHandwrittenChar('');
    };

    // Quiz type selection
    if (!quizType) {
        return (
            <div className="quiz-page">
                <div className="page-header">
                    <button className="btn btn-ghost btn-sm" onClick={onBack}>← もどる</button>
                    <h1 className="section-title" style={{ color: GRADE_COLORS[grade] }}>
                        🎯 {GRADE_NAMES[grade]}のクイズ
                    </h1>
                </div>
                <div className="quiz-type-grid">
                    {[
                        { type: null, icon: '🎲', label: 'ぜんぶ', desc: 'すべての種類をまぜて出題' },
                        { type: 'reading', icon: '📖', label: '読み問題', desc: '漢字の読み方をこたえよう' },
                        { type: 'writing', icon: '✏️', label: '書き取り', desc: '漢字を手書きしよう' },
                        { type: 'okurigana', icon: '📝', label: '送り仮名', desc: '正しい送り仮名をえらぼう' },
                        { type: 'antonym', icon: '🔄', label: '対義語', desc: '反対の意味の漢字をこたえよう' },
                        { type: 'sentence', icon: '📃', label: '文章穴埋め', desc: '文の中の漢字を書こう' },
                        { type: 'radical', icon: '🏛️', label: '部首', desc: '漢字の部首をこたえよう' },
                    ].map(({ type, icon, label, desc }) => (
                        <button
                            key={label}
                            className="quiz-type-card"
                            onClick={() => {
                                setQuizType(type || 'all');
                            }}
                        >
                            <span className="quiz-type-icon">{icon}</span>
                            <span className="quiz-type-label">{label}</span>
                            <span className="quiz-type-desc">{desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Quiz complete screen
    if (quizComplete) {
        // 問題数が0の場合は「にがて帳」でデータがない場合などに起こり得る
        const totalQ = questions.length;
        const rate = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
        let resultEmoji = '🎉';
        let resultMessage = '素晴らしい！';

        if (gameMode === 'timeattack' && timeConfig?.type === 'countdown') {
            resultMessage = 'タイムアップ！';
        } else if (gameMode === 'weak' && totalCorrect > 0) {
            resultMessage = `${totalCorrect}個の漢字を克服！`;
        } else {
            if (rate < 50) { resultEmoji = '📚'; resultMessage = 'もう少しがんばろう！'; }
            else if (rate < 80) { resultEmoji = '👍'; resultMessage = 'いい調子！'; }
        }

        return (
            <div className="quiz-page">
                <div className="quiz-result-screen animate-fade-in-up">
                    <div className="result-emoji">{resultEmoji}</div>
                    <h2 className="result-title">{resultMessage}</h2>
                    <div className="result-stats">
                        {timeConfig?.type === 'stopwatch' && (
                            <div className="result-stat">
                                <span className="result-stat-value">{formatTime(timeElapsed)}</span>
                                <span className="result-stat-label">クリアタイム</span>
                            </div>
                        )}
                        <div className="result-stat">
                            <span className="result-stat-value">{score}</span>
                            <span className="result-stat-label">スコア</span>
                        </div>
                        <div className="result-stat">
                            <span className="result-stat-value">{totalCorrect}/{totalQ}</span>
                            <span className="result-stat-label">正解</span>
                        </div>
                        {timeConfig?.type !== 'stopwatch' && (
                            <div className="result-stat">
                                <span className="result-stat-value">{rate}%</span>
                                <span className="result-stat-label">正答率</span>
                            </div>
                        )}
                    </div>
                    <div className="result-actions">
                        <button className="btn btn-primary btn-lg" onClick={handleRestart}>
                            🔄 もう一度
                        </button>
                        <button className="btn btn-ghost btn-lg" onClick={onBack}>
                            ← もどる
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentQ) {
        return (
            <div className="quiz-page">
                <div className="page-header">
                    <button className="btn btn-ghost btn-sm" onClick={onBack}>← もどる</button>
                </div>
                <div className="empty-state">
                    <span className="empty-icon">📝</span>
                    <p>この種類のクイズはまだありません</p>
                    <button className="btn btn-primary" onClick={handleRestart}>別のクイズをえらぶ</button>
                </div>
            </div>
        );
    }

    const isChoiceType = currentQ.choices && currentQ.choices.length > 0;
    const isWritingType = currentQ.type === 'writing' || currentQ.type === 'stroke_order' || currentQ.type === 'sentence';

    return (
        <div className="quiz-page">
            {/* スコアポップアップ */}
            {scorePopup && (
                <div className="score-popup" key={scorePopup.id}>+{scorePopup.points}pt</div>
            )}

            {/* ヘッダー */}
            <div className="quiz-header">
                <button className="btn btn-ghost btn-sm" onClick={onBack}>✕</button>

                {gameMode === 'timeattack' ? (
                    <div className="quiz-timer-display" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span className="icon">⏱️</span>
                        <span style={{ color: timeConfig?.type === 'countdown' && timeLeft! <= 10 ? 'var(--color-error)' : 'inherit' }}>
                            {formatTime(timeConfig?.type === 'countdown' ? timeLeft! : timeElapsed)}
                        </span>
                    </div>
                ) : gameMode === 'story' && storyEnemy ? (
                    <div className="quiz-story-status">
                        <div className="enemy-hp-container">
                            <span className="enemy-name">{storyEnemy.name}</span>
                            <div className="progress-bar hp-bar">
                                <div
                                    className="progress-bar-fill hp-fill"
                                    style={{ width: `${(storyEnemyHp / storyEnemy.hp) * 100}%` }}
                                />
                            </div>
                            <span className="enemy-hp-text">HP: {storyEnemyHp} / {storyEnemy.hp}</span>
                        </div>
                    </div>
                ) : (
                    <div className="quiz-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                        <span className="quiz-progress-text">{currentIdx + 1} / {questions.length}</span>
                    </div>
                )}

                <div className="quiz-score-display">
                    <span className="quiz-combo">{combo > 1 ? `🔥${combo}コンボ` : ''}</span>
                    <span className="quiz-score">⭐ {score}pt</span>
                </div>
            </div>

            {/* 問題 */}
            <div className={`quiz-question-area ${showResult ? (isCorrect ? 'correct-bg' : 'incorrect-bg') : ''}`}>
                {gameMode === 'story' && storyEnemy && (
                    <div className="story-enemy-image">
                        <img src={storyEnemy.image} alt={storyEnemy.name} />
                    </div>
                )}

                <span className="quiz-category badge">{currentQ.category}</span>
                <h2 className="quiz-question">{currentQ.question}</h2>

                {/* 選択式 */}
                {isChoiceType && !isWritingType && (
                    <div className="quiz-choices">
                        {currentQ.choices!.map((choice, i) => {
                            let className = 'quiz-choice';
                            if (showResult) {
                                if (choice === currentQ.answer) className += ' correct';
                                else if (choice === selected) className += ' incorrect';
                            } else if (choice === selected) {
                                className += ' selected';
                            }
                            return (
                                <button
                                    key={i}
                                    className={className}
                                    onClick={() => !showResult && handleAnswer(choice)}
                                    disabled={showResult}
                                >
                                    {choice}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 手書き入力式 */}
                {isWritingType && (
                    <div className="quiz-writing-area">
                        <div className="writing-canvas-container" ref={writerRef} />
                        {handwrittenChar && (
                            <div className="written-char">{handwrittenChar}</div>
                        )}
                    </div>
                )}

                {/* ヒント */}
                {!showResult && currentQ.hint && (
                    <details className="quiz-hint-toggle">
                        <summary>💡 ヒントを見る</summary>
                        <p className="quiz-hint-text">{currentQ.hint}</p>
                    </details>
                )}

                {/* パスボタン */}
                {!showResult && (
                    <div className="quiz-pass" style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => handleAnswer('パス', false)}
                            style={{ color: '#888', border: '1px solid #ddd', padding: '0.5rem 1rem', borderRadius: '20px' }}
                        >
                            わからない（パス）
                        </button>
                    </div>
                )}

                {/* 結果表示 */}
                {showResult && (
                    <div className={`quiz-feedback animate-fade-in-up ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
                        <span className="feedback-icon">{isCorrect ? '⭕' : '❌'}</span>
                        <span className="feedback-text">
                            {isCorrect ? 'せいかい！' : `ざんねん… 正解は「${currentQ.answer}」`}
                        </span>
                    </div>
                )}
            </div>

            {/* 次へボタン */}
            {showResult && (
                <div className="quiz-next animate-fade-in-up">
                    <button className="btn btn-primary btn-lg" onClick={handleNext}>
                        {currentIdx + 1 >= questions.length ? '結果を見る →' : '次の問題 →'}
                    </button>
                </div>
            )}
        </div>
    );
}
