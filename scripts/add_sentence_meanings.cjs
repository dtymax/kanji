const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const quizDir = path.join(dataDir, 'quiz');

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

async function addMeaningsToSentenceHints() {
    for (let grade = 1; grade <= 6; grade++) {
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);
        if (!fs.existsSync(quizFile)) continue;

        let quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
        let updatedCount = 0;

        console.log(`Grade ${grade}: Processing sentence questions...`);

        for (let i = 0; i < quizData.length; i++) {
            const q = quizData[i];
            if (q.type !== 'sentence') continue;
            // 既に意味がヒントに含まれている場合はスキップ
            if (q.hint && q.hint.includes('意味：')) continue;

            // questionから単語の読みを取得
            // 形式: 「reading」→「___xxx」に入る漢字を書きましょう
            const readingMatch = q.question.match(/「(.+?)」→/);
            if (!readingMatch) continue;

            const reading = readingMatch[1];
            const targetChar = q.answer;

            try {
                // kanjiapi.devでその漢字の語彙を取得して意味を探す
                const res = await fetchWithTimeout(`https://kanjiapi.dev/v1/words/${encodeURIComponent(targetChar)}`, 3000);
                if (!res.ok) continue;

                const wordsData = await res.json();

                // reading に一致する単語を探す
                let meaning = null;
                for (const w of wordsData) {
                    for (const variant of w.variants) {
                        if (variant.pronounced === reading) {
                            if (w.meanings && w.meanings.length > 0 && w.meanings[0].glosses && w.meanings[0].glosses.length > 0) {
                                meaning = w.meanings[0].glosses[0];
                            }
                            break;
                        }
                    }
                    if (meaning) break;
                }

                if (meaning) {
                    q.hint = `読み方は「${reading}」、意味：${meaning}`;
                    updatedCount++;
                }

                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (e) {
                // skip
            }
        }

        if (updatedCount > 0) {
            fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
        }
        console.log(`Grade ${grade}: Updated ${updatedCount} sentence question hints.`);
    }
}

addMeaningsToSentenceHints().then(() => console.log('Done!'));
