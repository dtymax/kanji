const fs = require('fs');
const path = require('path');

const kanjiDir = path.join(__dirname, '..', 'public', 'data', 'kanji');

async function fetchWithTimeout(url, ms = 3000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return res;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

async function fillExamples() {
    for (let grade = 2; grade <= 6; grade++) {
        const filePath = path.join(kanjiDir, `grade${grade}.json`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        let filled = 0;

        for (let i = 0; i < data.length; i++) {
            const k = data[i];
            if (k.examples && k.examples.length > 0) continue;

            try {
                const res = await fetchWithTimeout(
                    `https://kanjiapi.dev/v1/words/${encodeURIComponent(k.character)}`,
                    5000
                );
                if (!res.ok) continue;
                const words = await res.json();

                // 優先度の高い2文字熟語を選ぶ
                const candidates = [];
                for (const w of words) {
                    if (!w.meanings || w.meanings.length === 0) continue;
                    for (const v of w.variants) {
                        if (!v.written || !v.pronounced) continue;
                        if (!v.written.includes(k.character)) continue;
                        if (v.written.length < 2 || v.written.length > 3) continue;
                        // ひらがな/カタカナだけのものは除外
                        if (!/[\u4e00-\u9faf]/.test(v.written)) continue;

                        let score = v.priorities.length * 10;
                        if (v.written.length === 2) score += 5;
                        if (v.priorities.some(p => p.startsWith('nf'))) {
                            const nf = parseInt(v.priorities.find(p => p.startsWith('nf'))?.slice(2) || '99');
                            score += Math.max(0, 50 - nf);
                        }

                        candidates.push({
                            word: v.written,
                            reading: v.pronounced,
                            meaning: v.written, // 日本語なので熟語そのものが意味
                            score,
                        });
                    }
                }

                // スコア順にソートして上位3つを取得
                candidates.sort((a, b) => b.score - a.score);

                // 重複する語を除去
                const seen = new Set();
                const top = [];
                for (const c of candidates) {
                    if (seen.has(c.word)) continue;
                    seen.add(c.word);
                    top.push({ word: c.word, reading: c.reading, meaning: c.meaning });
                    if (top.length >= 3) break;
                }

                if (top.length > 0) {
                    k.examples = top;
                    filled++;
                }

                await new Promise(r => setTimeout(r, 30));
            } catch (e) {
                // skip
            }

            if ((i + 1) % 50 === 0) {
                console.log(`  Grade ${grade}: ${i + 1}/${data.length}...`);
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Grade ${grade}: Filled ${filled}/${data.length} kanji with examples.`);
    }
}

fillExamples().then(() => console.log('Done!'));
