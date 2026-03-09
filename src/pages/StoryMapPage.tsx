import { useState, useMemo } from 'react';
import { STORY_MAPS } from '../data/storyMap';
import { useUser } from '../contexts/UserContext';
import './StoryMapPage.css';

interface StoryMapPageProps {
    onBack: () => void;
    onStartBattle: (nodeId: string, grade: number) => void;
}

export default function StoryMapPage({ onBack, onStartBattle }: StoryMapPageProps) {
    const { user } = useUser();

    // 最初に未クリアのノードがあるエリアを初期表示エリアとする
    const initialAreaId = useMemo(() => {
        for (const map of STORY_MAPS) {
            const hasUncleared = map.nodes.some(n => !user.progress.clearedNodes.includes(n.id));
            if (hasUncleared) return map.id;
        }
        return STORY_MAPS[0].id; // 全部クリア済みの場合は最初に戻る
    }, [user.progress.clearedNodes]);

    const [activeAreaId, setActiveAreaId] = useState<string>(initialAreaId);

    const activeMap = STORY_MAPS.find(m => m.id === activeAreaId) || STORY_MAPS[0];

    // マップ上のノード配置は map.nodes[i].position に定義されている
    const getNodePosition = (index: number) => {
        return activeMap.nodes[index]?.position || { x: 50, y: 50 };
    };

    return (
        <div className="story-page">
            <header className="story-header">
                <button className="btn-back" onClick={onBack}>
                    ← もどる
                </button>
                <div className="story-title">
                    <h2>🗺️ 漢字の島を大冒険！</h2>
                </div>
                <div className="header-spacer" />
            </header>

            <div className="area-tabs-container">
                <div className="area-tabs">
                    {STORY_MAPS.map(map => (
                        <button
                            key={map.id}
                            className={`area-tab ${activeAreaId === map.id ? 'active' : ''}`}
                            onClick={() => setActiveAreaId(map.id)}
                        >
                            {map.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="story-map-container">
                {/* マップ背景 */}
                <div
                    className="story-map-bg"
                    style={{ backgroundImage: `url(${activeMap.bgImage})` }}
                >
                    {/* SVGでノード間の線を描画 */}
                    <svg className="story-map-paths" width="100%" height="100%">
                        {activeMap.nodes.map((node, i) => {
                            if (i === activeMap.nodes.length - 1) return null;
                            const pos1 = getNodePosition(i);
                            const pos2 = getNodePosition(i + 1);

                            // 両方クリア済みなら線の色を変えるなど
                            const isLineCleared = user.progress.clearedNodes.includes(node.id) && user.progress.clearedNodes.includes(activeMap.nodes[i + 1].id);

                            return (
                                <line
                                    key={`line_${i}`}
                                    x1={`${pos1.x}%`}
                                    y1={`${pos1.y}%`}
                                    x2={`${pos2.x}%`}
                                    y2={`${pos2.y}%`}
                                    className={`map-path ${isLineCleared ? 'cleared' : ''}`}
                                />
                            );
                        })}
                    </svg>

                    {/* ノードの描画 */}
                    {activeMap.nodes.map((node, i) => {
                        const pos = getNodePosition(i);
                        const isCleared = user.progress.clearedNodes.includes(node.id);

                        // そのエリアの最初の未クリアノードかどうか（そこが「現在挑戦可能」なマス）
                        const isNextTarget = !isCleared && (i === 0 || user.progress.clearedNodes.includes(activeMap.nodes[i - 1].id));

                        // 挑戦可能でもなく、クリアもされていなければロック中
                        const isLocked = !isCleared && !isNextTarget;

                        return (
                            <button
                                key={node.id}
                                className={`map-node ${node.enemy.type} ${isCleared ? 'cleared' : ''} ${isNextTarget ? 'active-target' : ''} ${isLocked ? 'locked' : ''}`}
                                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                onClick={() => !isLocked && onStartBattle(node.id, activeMap.grade)}
                                disabled={isLocked}
                            >
                                <div className="node-icon">
                                    {isCleared ? '✅' : (node.enemy.type === 'boss' ? '👹' : (node.enemy.type === 'midboss' ? '👿' : '👾'))}
                                </div>
                                <div className="node-tooltip">
                                    {node.enemy.name} <br />
                                    HP: {node.enemy.hp}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
