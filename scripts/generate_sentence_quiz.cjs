const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const quizDir = path.join(dataDir, 'quiz');
const kanjiDir = path.join(dataDir, 'kanji');

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

async function generateSentenceQuestions() {
    for (let grade = 2; grade <= 6; grade++) {
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);
        const kanjiFile = path.join(kanjiDir, `grade${grade}.json`);
        if (!fs.existsSync(quizFile) || !fs.existsSync(kanjiFile)) continue;

        let quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
        const kanjiData = JSON.parse(fs.readFileSync(kanjiFile, 'utf-8'));

        // Find kanji that already have sentence questions
        const existingSentence = new Set(
            quizData.filter(q => q.type === 'sentence').map(q => q.targetKanji)
        );

        const missingKanji = kanjiData.filter(k => !existingSentence.has(k.character));
        console.log(`Grade ${grade}: ${missingKanji.length} kanji need sentence questions...`);

        let addedCount = 0;
        let idCounter = Date.now();

        for (const kanji of missingKanji) {
            const char = kanji.character;
            try {
                const res = await fetchWithTimeout(`https://kanjiapi.dev/v1/words/${encodeURIComponent(char)}`, 3000);
                if (!res.ok) continue;

                const wordsData = await res.json();

                // Find a 2-character compound word containing this kanji
                let bestWord = null;
                for (const w of wordsData) {
                    for (const variant of w.variants) {
                        if (variant.written.includes(char) && variant.written.length >= 2 && variant.written.length <= 3) {
                            if (!bestWord || variant.priorities.length > (bestWord.priorities?.length || 0)) {
                                bestWord = variant;
                            }
                        }
                    }
                }

                if (bestWord) {
                    const word = bestWord.written;
                    const reading = bestWord.pronounced;
                    const blanked = word.replace(char, '___');
                    quizData.push({
                        id: `g${grade}st${idCounter++}`,
                        type: 'sentence',
                        grade,
                        difficulty: grade <= 2 ? 1 : grade <= 4 ? 2 : 3,
                        question: `「${reading}」→「${blanked}」に入る漢字を書きましょう`,
                        answer: char,
                        hint: `読み方は「${reading}」`,
                        category: '文章の穴埋め',
                        targetKanji: char,
                    });
                    addedCount++;
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (e) {
                // skip
            }
        }

        if (addedCount > 0) {
            fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
        }
        console.log(`Grade ${grade}: Added ${addedCount} sentence questions. Total: ${quizData.length}`);
    }
}

generateSentenceQuestions().then(() => console.log('Done!'));
