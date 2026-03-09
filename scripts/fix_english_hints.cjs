const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const kanjiDir = path.join(dataDir, 'kanji');
const quizDir = path.join(dataDir, 'quiz');

// 全漢字の意味を日本語で定義（訓読みベース + 追加説明）
// kanjiapi.devから取得した英語意味を元に、訓読みを活用して自然な日本語に変換
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

function kanjiToJPMeaning(kanji) {
    // 訓読みから意味を推測
    const kun = kanji.readings?.kunyomi;
    const on = kanji.readings?.onyomi;

    if (kun && kun.length > 0) {
        // 訓読みの送り仮名を外して意味的な表現にする
        const cleanKun = kun[0].replace('.', '');
        // 動詞系（〜る、〜す、〜む、等）
        if (cleanKun.endsWith('る') || cleanKun.endsWith('す') || cleanKun.endsWith('む') ||
            cleanKun.endsWith('つ') || cleanKun.endsWith('く') || cleanKun.endsWith('ぐ') ||
            cleanKun.endsWith('ぶ') || cleanKun.endsWith('ぬ') || cleanKun.endsWith('う')) {
            return `「${cleanKun}」という意味`;
        }
        // 形容詞系（〜い、〜しい）
        if (cleanKun.endsWith('い') || cleanKun.endsWith('しい')) {
            return `「${cleanKun}」という意味`;
        }
        // 名詞系
        return `「${cleanKun}」という意味`;
    }

    // 訓読みがない場合、音読みを使う
    if (on && on.length > 0) {
        return `音読みは「${on[0]}」`;
    }

    return null;
}

async function replaceEnglishHints() {
    // 全漢字データを読み込む
    const kanjiMap = {};
    for (let g = 1; g <= 6; g++) {
        const kanjiFile = path.join(kanjiDir, `grade${g}.json`);
        if (!fs.existsSync(kanjiFile)) continue;
        const data = JSON.parse(fs.readFileSync(kanjiFile, 'utf-8'));
        data.forEach(k => { kanjiMap[k.character] = k; });
    }

    for (let grade = 1; grade <= 6; grade++) {
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);
        if (!fs.existsSync(quizFile)) continue;

        let quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
        let updatedCount = 0;

        for (const q of quizData) {
            if (!q.hint) continue;
            // 英語が含まれるヒントのみ処理
            if (!/[a-zA-Z]{3,}/.test(q.hint)) continue;

            const kanji = kanjiMap[q.targetKanji];
            if (!kanji) continue;

            const jpMeaning = kanjiToJPMeaning(kanji);
            if (!jpMeaning) continue;

            const radical = kanji.radical || '';
            const radicalReading = kanji.radicalReading || '';

            switch (q.type) {
                case 'reading': {
                    const on = kanji.readings?.onyomi?.[0] || '';
                    const kun = kanji.readings?.kunyomi?.[0]?.replace('.', '') || '';
                    let parts = [];
                    parts.push(`「${q.targetKanji}」は${jpMeaning}`);
                    if (on) parts.push(`音読み：${on}`);
                    if (kun) parts.push(`訓読み：${kun}`);
                    q.hint = parts.join('、');
                    updatedCount++;
                    break;
                }
                case 'writing': {
                    let parts = [];
                    parts.push(jpMeaning);
                    if (radicalReading) parts.push(`部首は「${radicalReading}」`);
                    parts.push(`${kanji.strokes}画`);
                    q.hint = parts.join('、');
                    updatedCount++;
                    break;
                }
                case 'antonym': {
                    const answerKanji = kanjiMap[q.answer];
                    let parts = [];
                    parts.push(`「${q.targetKanji}」は${jpMeaning}`);
                    if (answerKanji) {
                        const ansJP = kanjiToJPMeaning(answerKanji);
                        if (ansJP) parts.push(`答えは${ansJP}漢字`);
                    }
                    q.hint = parts.join('。');
                    updatedCount++;
                    break;
                }
                case 'radical': {
                    let parts = [];
                    if (radicalReading) parts.push(`部首の名前は「${radicalReading}」`);
                    parts.push(`「${q.targetKanji}」は${jpMeaning}`);
                    q.hint = parts.join('、');
                    updatedCount++;
                    break;
                }
                case 'okurigana': {
                    // okuriganaは「おちる」と読みます + 意味を入れ替え
                    const kunBase = kanji.readings?.kunyomi?.[0];
                    if (kunBase) {
                        const cleanKun = kunBase.replace('.', '');
                        q.hint = `「${cleanKun}」と読みます。${jpMeaning}`;
                    }
                    updatedCount++;
                    break;
                }
                case 'sentence': {
                    // sentenceの英語意味を日本語に置換
                    q.hint = q.hint.replace(/意味：[a-zA-Z].*$/, jpMeaning.replace('「', '').replace('」', ''));
                    updatedCount++;
                    break;
                }
            }
        }

        if (updatedCount > 0) {
            fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
        }
        console.log(`Grade ${grade}: Replaced ${updatedCount} English hints with Japanese.`);
    }
}

replaceEnglishHints().then(() => console.log('Done!'));
