import { useState, useEffect } from 'react';
import type { KanjiData } from '../types';
import { GRADE_NAMES, GRADE_COLORS } from '../types';
import { useUser } from '../contexts/UserContext';
import './KanjiListPage.css';

interface KanjiListPageProps {
    grade: number;
    onSelectKanji: (character: string) => void;
    onBack: () => void;
    onStartQuiz: () => void;
}

export default function KanjiListPage({ grade, onSelectKanji, onBack, onStartQuiz }: KanjiListPageProps) {
    const [kanjiList, setKanjiList] = useState<KanjiData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useUser();

    useEffect(() => {
        setLoading(true);
        fetch(`./data/kanji/grade${grade}.json`)
            .then(res => res.json())
            .then(data => {
                setKanjiList(data);
                setLoading(false);
            })
            .catch(() => {
                setKanjiList([]);
                setLoading(false);
            });
    }, [grade]);

    const filteredList = kanjiList.filter(k => {
        if (!searchQuery) return true;
        return (
            k.character.includes(searchQuery) ||
            k.readings.onyomi.some(r => r.includes(searchQuery)) ||
            k.readings.kunyomi.some(r => r.includes(searchQuery)) ||
            k.meanings.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    });

    const getKanjiStatus = (char: string) => {
        const prog = user.progress.kanjiProgress[char];
        if (!prog) return 'new';
        if (prog.readingOk && prog.writingOk) return 'mastered';
        if (prog.readingOk || prog.writingOk) return 'learning';
        return 'new';
    };

    const masteredCount = kanjiList.filter(k => getKanjiStatus(k.character) === 'mastered').length;
    const learningCount = kanjiList.filter(k => getKanjiStatus(k.character) === 'learning').length;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="kanji-list-page">
            {/* ヘッダー */}
            <div className="page-header">
                <div className="page-header-left">
                    <button className="btn btn-ghost btn-sm" onClick={onBack}>← もどる</button>
                    <h1 className="section-title" style={{ color: GRADE_COLORS[grade] }}>
                        <span>{grade}</span> {GRADE_NAMES[grade]}の漢字
                    </h1>
                </div>
                <button className="btn btn-primary" onClick={onStartQuiz}>
                    🎯 クイズにちょうせん
                </button>
            </div>

            {/* 統計 */}
            <div className="list-stats">
                <div className="stat-chip mastered">
                    <span>✅</span> マスター: {masteredCount}
                </div>
                <div className="stat-chip learning">
                    <span>📝</span> 学習中: {learningCount}
                </div>
                <div className="stat-chip new-stat">
                    <span>🆕</span> 未学習: {kanjiList.length - masteredCount - learningCount}
                </div>
            </div>

            {/* 検索 */}
            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="漢字・読み方で検索..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                )}
            </div>

            {/* 漢字グリッド */}
            <div className="kanji-grid stagger-children">
                {filteredList.map((kanji) => {
                    const status = getKanjiStatus(kanji.character);
                    return (
                        <button
                            key={kanji.character}
                            className={`kanji-tile ${status}`}
                            style={{ '--grade-color': GRADE_COLORS[grade] } as React.CSSProperties}
                            onClick={() => onSelectKanji(kanji.character)}
                        >
                            <div className="kanji-tile-char">{kanji.character}</div>
                            <div className="kanji-tile-info">
                                <span className="kanji-tile-reading">
                                    {kanji.readings.kunyomi[0] || kanji.readings.onyomi[0]}
                                </span>
                                <span className="kanji-tile-strokes">{kanji.strokes}画</span>
                            </div>
                            {status === 'mastered' && <span className="kanji-tile-badge">✅</span>}
                            {status === 'learning' && <span className="kanji-tile-badge">📝</span>}
                        </button>
                    );
                })}
            </div>

            {filteredList.length === 0 && (
                <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <p>「{searchQuery}」に一致する漢字が見つかりません</p>
                </div>
            )}
        </div>
    );
}
