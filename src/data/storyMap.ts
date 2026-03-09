import type { StoryMap, StoryNode, StoryEnemyType } from '../types';

// ノード生成のヘルパー関数。
// デフォルト構成: [通常, 通常, 通常, 中ボス, 通常, 通常, ボス] の計7マス
function generateNodes(regionId: string, baseName: string, positions: { x: number; y: number }[]): StoryNode[] {
    const roles: { type: StoryEnemyType; hp: number; nameSuffix: string }[] = [
        { type: 'normal', hp: 10, nameSuffix: 'スライム' },
        { type: 'normal', hp: 10, nameSuffix: 'バット' },
        { type: 'normal', hp: 10, nameSuffix: 'ウルフ' },
        { type: 'midboss', hp: 15, nameSuffix: 'ゴーレム' },
        { type: 'normal', hp: 10, nameSuffix: 'ゴースト' },
        { type: 'normal', hp: 10, nameSuffix: 'ナイト' },
        { type: 'boss', hp: 20, nameSuffix: 'ドラゴン' },
    ];

    return roles.map((role, index) => {
        const nodeId = `${regionId}_${index + 1}`;
        const enemyImageName = `${regionId}_${role.type}_${index + 1}.svg`; // ユーザーが後から差し替え可能
        const position = positions[index] || { x: 50, y: 50 };

        return {
            id: nodeId,
            isCleared: false, // 初期状態は未クリア
            position,
            enemy: {
                id: `enemy_${nodeId}`,
                name: `${baseName}の${role.nameSuffix}`,
                image: `./images/enemies/${enemyImageName}`,
                hp: role.hp,
                type: role.type,
            }
        };
    });
}

// ストーリーモードのマップ定義（1年生〜6年生＋総復習）
export const STORY_MAPS: StoryMap[] = [
    {
        id: 'hokkaido',
        name: '北海道（1年生）',
        grade: 1,
        bgImage: './images/backgrounds/hokkaido.svg',
        nodes: generateNodes('hokkaido', '北の', [
            { x: 45, y: 15 }, { x: 85, y: 35 }, { x: 50, y: 40 },
            { x: 65, y: 55 }, { x: 40, y: 60 }, { x: 80, y: 60 }, { x: 30, y: 80 }
        ]),
    },
    {
        id: 'tohoku',
        name: '東北（2年生）',
        grade: 2,
        bgImage: './images/backgrounds/tohoku.svg',
        nodes: generateNodes('tohoku', '雪山の', [
            { x: 50, y: 10 }, { x: 45, y: 25 }, { x: 60, y: 40 },
            { x: 35, y: 40 }, { x: 65, y: 65 }, { x: 35, y: 70 }, { x: 50, y: 85 }
        ]),
    },
    {
        id: 'kanto',
        name: '関東（3年生）',
        grade: 3,
        bgImage: './images/backgrounds/kanto.svg',
        nodes: generateNodes('kanto', '平野の', [
            { x: 45, y: 15 }, { x: 75, y: 30 }, { x: 20, y: 30 },
            { x: 40, y: 40 }, { x: 45, y: 60 }, { x: 70, y: 65 }, { x: 40, y: 80 }
        ]),
    },
    {
        id: 'chubu',
        name: '中部（4年生）',
        grade: 4,
        bgImage: './images/backgrounds/chubu.svg',
        nodes: generateNodes('chubu', '山岳の', [
            { x: 75, y: 15 }, { x: 35, y: 25 }, { x: 65, y: 45 },
            { x: 45, y: 50 }, { x: 80, y: 55 }, { x: 40, y: 75 }, { x: 70, y: 80 }
        ]),
    },
    {
        id: 'kansai',
        name: '関西（5年生）',
        grade: 5,
        bgImage: './images/backgrounds/kansai.svg',
        nodes: generateNodes('kansai', '古都の', [
            { x: 15, y: 20 }, { x: 70, y: 35 }, { x: 45, y: 40 },
            { x: 20, y: 50 }, { x: 35, y: 60 }, { x: 55, y: 65 }, { x: 40, y: 85 }
        ]),
    },
    {
        id: 'shikoku_chugoku',
        name: '四国・中国（6年生）',
        grade: 6,
        bgImage: './images/backgrounds/shikoku_chugoku.svg',
        nodes: generateNodes('shikoku_chugoku', '瀬戸内の', [
            { x: 40, y: 20 }, { x: 65, y: 35 }, { x: 45, y: 40 },
            { x: 15, y: 45 }, { x: 65, y: 65 }, { x: 35, y: 80 }, { x: 75, y: 80 }
        ]),
    },
    {
        id: 'kyushu_okinawa',
        name: '九州・沖縄（総復習）',
        grade: 7, // 7は特殊処理（にがて帳ベース）とする
        bgImage: './images/backgrounds/kyushu_okinawa.svg',
        nodes: generateNodes('kyushu_okinawa', '南国の', [
            { x: 45, y: 20 }, { x: 20, y: 40 }, { x: 70, y: 40 },
            { x: 45, y: 50 }, { x: 65, y: 60 }, { x: 45, y: 70 }, { x: 15, y: 85 }
        ]),
    }
];
