const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const quizDir = path.join(dataDir, 'quiz');

function cleanupHints() {
    for (let grade = 1; grade <= 6; grade++) {
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);
        if (!fs.existsSync(quizFile)) continue;

        let quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
        let fixedCount = 0;

        for (const q of quizData) {
            if (!q.hint) continue;
            let changed = false;

            // 1. 残っている英語の意味を除去し、読みだけにする
            // 「意味：(English text...)」パターンを除去
            if (/意味：[a-zA-Z(]/.test(q.hint)) {
                q.hint = q.hint.replace(/、?意味：[a-zA-Z(][^」]*/, '');
                changed = true;
            }

            // 2. 「"English"」という意味 パターンの除去
            if (/「[a-zA-Z][a-zA-Z ,.\-()']+」という意味/.test(q.hint)) {
                // その部分を除去して残りを保持
                q.hint = q.hint.replace(/「[a-zA-Z][a-zA-Z ,.\-()']+」という意味[、。]?/g, '');
                changed = true;
            }

            // 3. 答えは「...」という意味漢字 → 答えは「...」という意味の漢字
            if (q.hint.includes('という意味漢字')) {
                q.hint = q.hint.replace('という意味漢字', 'という意味の漢字');
                changed = true;
            }

            // 4. 「-さる」のようなハイフン付き読みをクリーンアップ
            q.hint = q.hint.replace(/「-/g, '「');

            // 5. 空になったヒントにフォールバック
            if (q.hint.trim() === '' || q.hint.trim() === '、' || q.hint.trim() === '。') {
                q.hint = `${q.targetKanji}の問題です`;
                changed = true;
            }

            // 6. 連続する句読点を除去
            q.hint = q.hint.replace(/、、+/g, '、').replace(/。。+/g, '。').replace(/^、/, '').replace(/^。/, '');

            // 7. 「に関係する漢字」だけが残った部首ヒントを強化
            if (q.type === 'radical' && !q.hint.includes('部首')) {
                // 部首名がないなら追加
            }

            if (changed) fixedCount++;
        }

        fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
        console.log(`Grade ${grade}: Cleaned up ${fixedCount} hints.`);
    }
}

cleanupHints();

// 最終確認
let engCount = 0, total = 0;
for (let g = 1; g <= 6; g++) {
    const d = JSON.parse(fs.readFileSync(path.join(quizDir, `grade${g}_quiz.json`)));
    d.forEach(q => { if (q.hint) { total++; if (/[a-zA-Z]{3,}/.test(q.hint)) engCount++; } });
}
console.log(`Final: ${engCount} English hints remaining out of ${total} total.`);
console.log('Done!');
