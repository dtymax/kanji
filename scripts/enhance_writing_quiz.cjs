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

async function enhanceQuiz() {
    for (let grade = 1; grade <= 6; grade++) {
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);
        if (!fs.existsSync(quizFile)) continue;

        let quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
        let updatedCount = 0;

        console.log(`Enhancing Grade ${grade} questions...`);

        for (let i = 0; i < quizData.length; i++) {
            const q = quizData[i];

            if (q.type === 'writing' && q.targetKanji && q.question.includes('漢字') && q.question.includes('書きましょう')) {
                const target = q.targetKanji;

                try {
                    const res = await fetchWithTimeout(`https://kanjiapi.dev/v1/words/${encodeURIComponent(target)}`, 3000);
                    if (!res.ok) {
                        console.log(`[${target}] API returned ${res.status}`);
                        continue;
                    }

                    const wordsData = await res.json();
                    let bestWord = null;

                    for (const w of wordsData) {
                        for (const variant of w.variants) {
                            if (variant.written.includes(target) && variant.written.length >= 2 && variant.written.length <= 4) {
                                if (!bestWord || variant.priorities.length > (bestWord.priorities?.length || 0)) {
                                    bestWord = variant;
                                }
                            }
                        }
                    }

                    if (bestWord) {
                        const wordText = bestWord.written;
                        const reading = bestWord.pronounced;
                        const maskedWord = wordText.replace(new RegExp(target, 'g'), '◯');
                        q.question = `「${reading}」の漢字を書きましょう（ヒント：${maskedWord}）`;
                        updatedCount++;
                        console.log(`Updated [${target}] -> ${q.question}`);
                    } else {
                        console.log(`[${target}] No suitable words found.`);
                    }

                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (e) {
                    console.log(`Failed for [${target}]:`, e.name || e.message);
                }
            }
        }

        if (updatedCount > 0) {
            fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
            console.log(`Grade ${grade}: Enhanced ${updatedCount} writing questions.`);
        }
    }
}

enhanceQuiz().then(() => console.log('Finished enhancing writing questions'));
