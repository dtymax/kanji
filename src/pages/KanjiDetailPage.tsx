import { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import type { KanjiData } from '../types';
import { GRADE_COLORS } from '../types';
import { useUser } from '../contexts/UserContext';
import './KanjiDetailPage.css';

interface KanjiDetailPageProps {
    character: string;
    grade: number;
    onBack: () => void;
}

export default function KanjiDetailPage({ character, grade, onBack }: KanjiDetailPageProps) {
    const [kanji, setKanji] = useState<KanjiData | null>(null);
    const [mode, setMode] = useState<'view' | 'animate' | 'quiz'>('view');
    const [quizResult, setQuizResult] = useState<string>('');
    const writerRef = useRef<HTMLDivElement>(null);
    const hanziWriterRef = useRef<ReturnType<typeof HanziWriter.create> | null>(null);
    const { user, dispatch } = useUser();

    // Load kanji data
    useEffect(() => {
        fetch(`./data/kanji/grade${grade}.json`)
            .then(res => res.json())
            .then((data: KanjiData[]) => {
                const found = data.find(k => k.character === character);
                setKanji(found || null);
            });
    }, [character, grade]);

    // Initialize HanziWriter
    useEffect(() => {
        if (!writerRef.current || !character) return;

        // Clear previous
        writerRef.current.innerHTML = '';
        hanziWriterRef.current = null;

        try {
            const writer = HanziWriter.create(writerRef.current, character, {
                width: 280,
                height: 280,
                padding: 10,
                showOutline: true,
                showCharacter: mode === 'view',
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 200,
                strokeColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#2D2B55',
                outlineColor: '#ddd',
                drawingColor: GRADE_COLORS[grade],
                showHintAfterMisses: 2,
                highlightOnComplete: true,
                highlightColor: GRADE_COLORS[grade],
                charDataLoader: (char: string) => {
                    return fetch(`https://cdn.jsdelivr.net/npm/@jamsch/hanzi-writer-data-jp@latest/${encodeURIComponent(char)}.json?v=2`)
                        .then(r => r.json());
                }
            });

            hanziWriterRef.current = writer;

            if (mode === 'animate') {
                writer.animateCharacter();
            } else if (mode === 'quiz') {
                setQuizResult('');
                writer.quiz({
                    onComplete: (summaryData: { totalMistakes: number }) => {
                        const mistakes = summaryData.totalMistakes;
                        if (mistakes === 0) {
                            setQuizResult('🎉 パーフェクト！');
                            dispatch({ type: 'ADD_SCORE', points: 15 });
                            dispatch({ type: 'ADD_EXPERIENCE', amount: 15 });
                            dispatch({ type: 'UPDATE_KANJI_PROGRESS', kanji: character, field: 'strokeOk', value: true });
                        } else if (mistakes <= 2) {
                            setQuizResult(`✨ すごい！（ミス${mistakes}回）`);
                            dispatch({ type: 'ADD_SCORE', points: 10 });
                            dispatch({ type: 'ADD_EXPERIENCE', amount: 10 });
                        } else {
                            setQuizResult(`📝 がんばったね（ミス${mistakes}回）`);
                            dispatch({ type: 'ADD_SCORE', points: 5 });
                            dispatch({ type: 'ADD_EXPERIENCE', amount: 5 });
                        }
                    }
                });
            }
        } catch (e) {
            console.warn('HanziWriter init error:', e);
        }

        return () => {
            hanziWriterRef.current = null;
        };
    }, [character, mode, grade]);

    const handleAnimate = () => {
        setMode('animate');
    };

    const handleQuiz = () => {
        setMode('quiz');
    };

    const handleReset = () => {
        setMode('view');
        setQuizResult('');
    };

    const progress = user.progress.kanjiProgress[character];

    if (!kanji) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="kanji-detail-page">
            <div className="page-header">
                <button className="btn btn-ghost btn-sm" onClick={onBack}>← もどる</button>
            </div>

            <div className="detail-layout">
                {/* 左：書き順ビューア */}
                <div className="detail-writer-section">
                    <div
                        className="writer-container"
                        style={{ '--grade-color': GRADE_COLORS[grade] } as React.CSSProperties}
                    >
                        <div className="writer-canvas" ref={writerRef} />
                        {quizResult && (
                            <div className="quiz-result animate-bounce-in">{quizResult}</div>
                        )}
                    </div>

                    <div className="writer-controls">
                        <button
                            className={`btn ${mode === 'view' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                            onClick={handleReset}
                        >
                            👁️ 表示
                        </button>
                        <button
                            className={`btn ${mode === 'animate' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                            onClick={handleAnimate}
                        >
                            ▶️ 書き順
                        </button>
                        <button
                            className={`btn ${mode === 'quiz' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                            onClick={handleQuiz}
                        >
                            ✏️ 練習
                        </button>
                    </div>

                    {mode === 'quiz' && (
                        <p className="writer-hint">指やペンで書いてみよう！</p>
                    )}
                </div>

                {/* 右：詳細情報 */}
                <div className="detail-info-section">
                    <div className="info-header">
                        <span className="info-character" style={{ color: GRADE_COLORS[grade] }}>{kanji.character}</span>
                        <div className="info-meta">
                            <span className="badge badge-grade" data-grade={grade}>{grade}年生</span>
                            <span className="info-strokes">{kanji.strokes}画</span>
                            {progress && (
                                <div className="info-status">
                                    {progress.readingOk && <span title="読みOK">📖✅</span>}
                                    {progress.writingOk && <span title="書きOK">✏️✅</span>}
                                    {progress.strokeOk && <span title="書き順OK">🖊️✅</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 読み方 */}
                    <div className="info-card">
                        <h3 className="info-card-title">📖 読み方</h3>
                        <div className="reading-list">
                            {kanji.readings.onyomi.length > 0 && (
                                <div className="reading-row">
                                    <span className="reading-label">音読み</span>
                                    <span className="reading-value">{kanji.readings.onyomi.join('、')}</span>
                                </div>
                            )}
                            {kanji.readings.kunyomi.length > 0 && (
                                <div className="reading-row">
                                    <span className="reading-label">訓読み</span>
                                    <span className="reading-value">{kanji.readings.kunyomi.join('、')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 部首 */}
                    <div className="info-card">
                        <h3 className="info-card-title">🏛️ 部首</h3>
                        <div className="radical-display">
                            <span className="radical-char">{kanji.radical}</span>
                            <span className="radical-reading">{kanji.radicalReading}</span>
                        </div>
                    </div>

                    {/* 用例 */}
                    <div className="info-card">
                        <h3 className="info-card-title">📝 使い方</h3>
                        <div className="examples-list">
                            {kanji.examples.map((ex, i) => (
                                <div key={i} className="example-row">
                                    <span className="example-word">{ex.word}</span>
                                    <span className="example-reading">（{ex.reading}）</span>
                                    <span className="example-meaning">{ex.meaning}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
