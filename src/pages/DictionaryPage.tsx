import { useState, useEffect } from 'react';
import type { KanjiData } from '../types';
import { GRADE_COLORS, GRADE_NAMES } from '../types';
import './DictionaryPage.css';

interface DictionaryPageProps {
    onSelectKanji: (character: string, grade: number) => void;
    onBack: () => void;
}

export default function DictionaryPage({ onSelectKanji, onBack }: DictionaryPageProps) {
    const [allKanji, setAllKanji] = useState<KanjiData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGrade, setFilterGrade] = useState<number | null>(null);
    const [filterStrokes, setFilterStrokes] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Load all grades
        Promise.all(
            [1, 2, 3, 4, 5, 6].map(g =>
                fetch(`/data/kanji/grade${g}.json`)
                    .then(r => r.json())
                    .catch(() => [])
            )
        ).then(results => {
            setAllKanji(results.flat());
            setLoading(false);
        });
    }, []);

    const filtered = allKanji.filter(k => {
        if (filterGrade && k.grade !== filterGrade) return false;
        if (filterStrokes && k.strokes !== filterStrokes) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            k.character.includes(q) ||
            k.readings.onyomi.some(r => r.toLowerCase().includes(q)) ||
            k.readings.kunyomi.some(r => r.replace('.', '').includes(q)) ||
            k.meanings.some(m => m.toLowerCase().includes(q)) ||
            k.examples.some(e => e.word.includes(q) || e.reading.includes(q))
        );
    });

    const strokeCounts = [...new Set(allKanji.map(k => k.strokes))].sort((a, b) => a - b);

    return (
        <div className="dictionary-page">
            <div className="page-header">
                <button className="btn btn-ghost btn-sm" onClick={onBack}>← もどる</button>
                <h1 className="section-title">📖 漢字辞書</h1>
            </div>

            {/* 検索・フィルター */}
            <div className="dict-filters">
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="漢字・読み方・意味で検索..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <span className="filter-label">学年</span>
                        <div className="filter-chips">
                            <button
                                className={`filter-chip ${filterGrade === null ? 'active' : ''}`}
                                onClick={() => setFilterGrade(null)}
                            >
                                全て
                            </button>
                            {[1, 2, 3, 4, 5, 6].map(g => (
                                <button
                                    key={g}
                                    className={`filter-chip ${filterGrade === g ? 'active' : ''}`}
                                    style={{ '--chip-color': GRADE_COLORS[g] } as React.CSSProperties}
                                    onClick={() => setFilterGrade(filterGrade === g ? null : g)}
                                >
                                    {g}年
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <span className="filter-label">画数</span>
                        <select
                            className="filter-select"
                            value={filterStrokes ?? ''}
                            onChange={e => setFilterStrokes(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">全て</option>
                            {strokeCounts.map(s => (
                                <option key={s} value={s}>{s}画</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <p className="dict-count">{filtered.length}字がみつかりました</p>

            {/* 結果リスト */}
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>読み込み中...</p>
                </div>
            ) : (
                <div className="dict-list">
                    {filtered.map(k => (
                        <button
                            key={k.character}
                            className="dict-item card"
                            onClick={() => onSelectKanji(k.character, k.grade)}
                        >
                            <div className="dict-item-char" style={{ color: GRADE_COLORS[k.grade] }}>
                                {k.character}
                            </div>
                            <div className="dict-item-info">
                                <div className="dict-item-readings">
                                    {k.readings.onyomi.length > 0 && (
                                        <span className="dict-item-reading">
                                            <small>音</small> {k.readings.onyomi.join('、')}
                                        </span>
                                    )}
                                    {k.readings.kunyomi.length > 0 && (
                                        <span className="dict-item-reading">
                                            <small>訓</small> {k.readings.kunyomi.join('、')}
                                        </span>
                                    )}
                                </div>
                                <div className="dict-item-meta">
                                    <span className="badge badge-grade" data-grade={k.grade}>{GRADE_NAMES[k.grade]}</span>
                                    <span>{k.strokes}画</span>
                                    <span>部首: {k.radical}（{k.radicalReading}）</span>
                                </div>
                                <div className="dict-item-examples">
                                    {k.examples.slice(0, 2).map((ex, i) => (
                                        <span key={i} className="dict-example">{ex.word}（{ex.reading}）</span>
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="empty-state">
                    <span className="empty-icon">📖</span>
                    <p>条件に一致する漢字がみつかりません</p>
                </div>
            )}
        </div>
    );
}
