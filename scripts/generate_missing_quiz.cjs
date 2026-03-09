const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const kanjiDir = path.join(dataDir, 'kanji');
const quizDir = path.join(dataDir, 'quiz');

function generateMissingQuizzes() {
    for (let grade = 1; grade <= 6; grade++) {
        const kanjiFile = path.join(kanjiDir, `grade${grade}.json`);
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);

        if (!fs.existsSync(kanjiFile) || !fs.existsSync(quizFile)) {
            continue;
        }

        const kanjiData = JSON.parse(fs.readFileSync(kanjiFile, 'utf-8'));
        const quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));

        // Track which kanji already have a WRITING question
        const answeredKanji = new Set(
            quizData
                .filter(q => q.type === 'writing')
                .map(q => q.targetKanji)
                .filter(Boolean)
        );

        // Find kanji missing a writing question
        const missingKanji = kanjiData.filter(k => !answeredKanji.has(k.character));

        if (missingKanji.length === 0) {
            console.log(`Grade ${grade}: All kanji have writing questions.`);
            continue;
        }

        console.log(`Grade ${grade}: Adding ${missingKanji.length} missing writing kanji...`);

        // Generate basic writing questions for the missing ones
        let addedCount = 0;
        missingKanji.forEach((k, index) => {
            const newQuestion = {
                id: `g${grade}a${Date.now()}${index}`,
                type: "writing",
                grade: grade,
                difficulty: 2,
                question: `「${k.character}」という漢字を書きましょう`,
                answer: k.character,
                hint: `${grade}年生で習う漢字です`,
                category: "漢字の書き取り",
                targetKanji: k.character
            };
            quizData.push(newQuestion);
            addedCount++;
        });

        if (addedCount > 0) {
            fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
            console.log(`Grade ${grade}: Added ${addedCount} new questions. Total: ${quizData.length}`);
        }
    }
}

generateMissingQuizzes();
