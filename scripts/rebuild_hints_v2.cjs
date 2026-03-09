const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const kanjiDir = path.join(dataDir, 'kanji');
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

// 英語の意味を子供向け日本語に訳す辞書
const ENG_TO_JP = {
    'continue': 'つづくこと', 'continuation': 'つづくこと', 'sequel': 'つづき',
    'ban': 'きんじること', 'forbid': 'きんじること', 'prohibition': 'きんじること',
    'stop': 'とめること', 'cease': 'やめること', 'halt': 'とまること',
    'begin': 'はじめること', 'start': 'はじめること', 'beginning': 'はじまり',
    'end': 'おわること', 'finish': 'おわること', 'conclusion': 'むすび',
    'break': 'こわすこと', 'destroy': 'こわすこと', 'ruin': 'ほろぶこと',
    'make': 'つくること', 'create': 'つくること', 'build': 'たてること',
    'protect': 'まもること', 'guard': 'まもること', 'defend': 'まもること',
    'attack': 'せめること', 'offense': 'せめること',
    'win': 'かつこと', 'victory': 'しょうり', 'triumph': 'しょうり',
    'lose': 'まけること', 'defeat': 'まけること', 'loss': 'そんしつ',
    'increase': 'ふえること', 'rise': 'あがること', 'grow': 'のびること',
    'decrease': 'へること', 'reduce': 'へらすこと', 'decline': 'さがること',
    'open': 'ひらくこと', 'close': 'とじること', 'shut': 'しめること',
    'enter': 'はいること', 'exit': 'でること', 'leave': 'はなれること',
    'send': 'おくること', 'receive': 'うけとること', 'deliver': 'とどけること',
    'buy': 'かうこと', 'sell': 'うること', 'trade': 'とりひき',
    'teach': 'おしえること', 'learn': 'まなぶこと', 'study': 'べんきょう',
    'think': 'かんがえること', 'believe': 'しんじること', 'know': 'しること',
    'feel': 'かんじること', 'emotion': 'かんじょう', 'heart': 'こころ',
    'speak': 'はなすこと', 'say': 'いうこと', 'tell': 'つたえること', 'talk': 'はなすこと',
    'write': 'かくこと', 'read': 'よむこと', 'record': 'しるすこと',
    'see': 'みること', 'look': 'みること', 'watch': 'みること',
    'hear': 'きくこと', 'listen': 'きくこと', 'sound': 'おと', 'voice': 'こえ',
    'walk': 'あるくこと', 'run': 'はしること', 'fly': 'とぶこと', 'move': 'うごくこと',
    'eat': 'たべること', 'drink': 'のむこと', 'food': 'しょくもつ',
    'live': 'いきること', 'life': 'いのち', 'die': 'しぬこと', 'death': 'し',
    'big': 'おおきい', 'small': 'ちいさい', 'large': 'おおきい', 'little': 'ちいさい',
    'long': 'ながい', 'short': 'みじかい', 'tall': 'たかい',
    'high': 'たかい', 'low': 'ひくい', 'deep': 'ふかい', 'shallow': 'あさい',
    'wide': 'ひろい', 'narrow': 'せまい', 'thick': 'あつい', 'thin': 'うすい',
    'strong': 'つよい', 'weak': 'よわい', 'hard': 'かたい', 'soft': 'やわらかい',
    'heavy': 'おもい', 'light': 'かるい', 'fast': 'はやい', 'slow': 'おそい',
    'hot': 'あつい', 'cold': 'さむい', 'warm': 'あたたかい', 'cool': 'すずしい',
    'new': 'あたらしい', 'old': 'ふるい', 'young': 'わかい',
    'good': 'よい', 'bad': 'わるい', 'right': 'ただしい', 'wrong': 'まちがい',
    'beautiful': 'うつくしい', 'ugly': 'みにくい', 'clean': 'きれい', 'dirty': 'きたない',
    'bright': 'あかるい', 'dark': 'くらい', 'clear': 'すんだ',
    'near': 'ちかい', 'far': 'とおい', 'same': 'おなじ', 'different': 'ちがう',
    'easy': 'かんたん', 'difficult': 'むずかしい', 'hard': 'むずかしい',
    'full': 'いっぱい', 'empty': 'からっぽ', 'many': 'おおい', 'few': 'すくない',
    'safe': 'あんぜん', 'danger': 'きけん', 'dangerous': 'あぶない',
    'true': 'ほんとう', 'false': 'うそ', 'correct': 'ただしい',
    'peace': 'へいわ', 'war': 'せんそう', 'fight': 'たたかい',
    'love': 'あい', 'hate': 'にくしみ', 'like': 'すき', 'kind': 'やさしい',
    'happy': 'うれしい', 'sad': 'かなしい', 'angry': 'おこる', 'fear': 'おそれ',
    'rich': 'ゆたか', 'poor': 'まずしい', 'wealth': 'とみ', 'poverty': 'まずしさ',
    'public': 'おおやけ', 'private': 'わたくし', 'society': 'しゃかい',
    'country': 'くに', 'nation': 'くに', 'city': 'まち', 'village': 'むら', 'town': 'まち',
    'mountain': 'やま', 'river': 'かわ', 'sea': 'うみ', 'ocean': 'うみ', 'lake': 'みずうみ',
    'tree': 'き', 'flower': 'はな', 'grass': 'くさ', 'animal': 'どうぶつ',
    'gold': 'きん', 'silver': 'ぎん', 'iron': 'てつ', 'copper': 'どう', 'metal': 'きんぞく',
    'fire': 'ひ', 'water': 'みず', 'earth': 'つち', 'wind': 'かぜ',
    'sun': 'たいよう', 'moon': 'つき', 'star': 'ほし', 'rain': 'あめ', 'snow': 'ゆき', 'cloud': 'くも',
    'spring': 'はる', 'summer': 'なつ', 'autumn': 'あき', 'winter': 'ふゆ',
    'morning': 'あさ', 'evening': 'ゆうがた', 'night': 'よる',
    'north': 'きた', 'south': 'みなみ', 'east': 'ひがし', 'west': 'にし',
    'man': 'おとこ', 'woman': 'おんな', 'child': 'こ', 'person': 'ひと', 'people': 'ひとびと',
    'father': 'ちち', 'mother': 'はは', 'brother': 'きょうだい', 'sister': 'しまい',
    'friend': 'ともだち', 'enemy': 'てき', 'king': 'おう',
    'eye': 'め', 'ear': 'みみ', 'mouth': 'くち', 'hand': 'て', 'foot': 'あし',
    'head': 'あたま', 'body': 'からだ', 'bone': 'ほね', 'blood': 'ち',
    'dog': 'いぬ', 'cat': 'ねこ', 'bird': 'とり', 'fish': 'さかな', 'horse': 'うま', 'cow': 'うし', 'insect': 'むし',
    'book': 'ほん', 'paper': 'かみ', 'word': 'ことば', 'letter': 'もじ', 'name': 'なまえ',
    'road': 'みち', 'gate': 'もん', 'door': 'と', 'house': 'いえ', 'room': 'へや',
    'car': 'くるま', 'ship': 'ふね', 'rice': 'こめ', 'meat': 'にく',
    'number': 'かず', 'color': 'いろ', 'shape': 'かたち', 'line': 'せん', 'circle': 'まる',
    'time': 'じかん', 'day': 'ひ', 'year': 'とし', 'age': 'とし',
    'school': 'がっこう', 'class': 'くらす', 'work': 'しごと', 'play': 'あそぶこと',
    'power': 'ちから', 'energy': 'ちから', 'strength': 'ちから',
    'money': 'おかね', 'goods': 'しなもの', 'thing': 'もの', 'matter': 'こと', 'place': 'ところ',
    'law': 'ほうりつ', 'rule': 'きまり', 'plan': 'けいかく', 'reason': 'りゆう',
    'example': 'れい', 'fact': 'じじつ', 'idea': 'かんがえ', 'problem': 'もんだい',
    'relation': 'かんけい', 'condition': 'じょうたい', 'situation': 'じょうきょう',
    'change': 'かわること', 'progress': 'すすむこと', 'success': 'せいこう', 'failure': 'しっぱい',
    'confinement': 'とじこめること', 'construct': 'たてること', 'together': 'いっしょに',
    'approve': 'みとめること', 'recognize': 'にんしきすること', 'acknowledge': 'みとめること',
    'politics': 'せいじ', 'government': 'せいふ', 'economy': 'けいざい',
    'history': 'れきし', 'culture': 'ぶんか', 'art': 'げいじゅつ', 'music': 'おんがく',
    'medicine': 'くすり', 'doctor': 'いしゃ', 'illness': 'びょうき', 'disease': 'びょうき',
    'nature': 'しぜん', 'environment': 'かんきょう', 'weather': 'てんき',
    'meeting': 'かいぎ', 'discussion': 'はなしあい', 'opinion': 'いけん',
    'responsibility': 'せきにん', 'duty': 'ぎむ', 'promise': 'やくそく',
    'respect': 'そんけい', 'trust': 'しんらい', 'cooperation': 'きょうりょく',
    'special': 'とくべつ', 'general': 'いっぱんてき', 'normal': 'ふつう',
    'necessary': 'ひつよう', 'important': 'たいせつ', 'possible': 'かのう',
    'complete': 'かんせい', 'perfect': 'かんぜん', 'entire': 'ぜんたい',
    'independent': 'どくりつ', 'permanent': 'えいきゅう', 'temporary': 'いちじてき',
    'accept': 'うけいれること', 'refuse': 'ことわること', 'request': 'たのむこと',
    'permit': 'ゆるすこと', 'prohibit': 'きんじること', 'allow': 'ゆるすこと',
};

async function rebuildAllHints() {
    // 全漢字データを読み込む
    const kanjiMap = {};
    for (let g = 1; g <= 6; g++) {
        const kanjiFile = path.join(kanjiDir, `grade${g}.json`);
        if (!fs.existsSync(kanjiFile)) continue;
        const data = JSON.parse(fs.readFileSync(kanjiFile, 'utf-8'));
        data.forEach(k => { kanjiMap[k.character] = k; });
    }

    // kanjiapi.devから「各漢字を使った代表的な熟語」を取得してキャッシュ
    const wordCache = {}; // char -> { word, reading, meaning }
    const meaningCache = {}; // char -> japanese meaning string
    const allChars = Object.keys(kanjiMap);

    console.log(`Fetching word data for ${allChars.length} kanji...`);

    for (let i = 0; i < allChars.length; i++) {
        const char = allChars[i];
        try {
            // 1. まず漢字の基本意味を取得
            const kanjiRes = await fetchWithTimeout(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(char)}`, 3000);
            if (kanjiRes.ok) {
                const kanjiInfo = await kanjiRes.json();
                if (kanjiInfo.meanings && kanjiInfo.meanings.length > 0) {
                    // 英語の意味を日本語に訳す
                    let jpMeaning = null;
                    for (const m of kanjiInfo.meanings) {
                        const lower = m.toLowerCase();
                        if (ENG_TO_JP[lower]) {
                            jpMeaning = ENG_TO_JP[lower];
                            break;
                        }
                    }
                    meaningCache[char] = jpMeaning || null;
                }
            }

            // 2. 熟語を取得（代表的な2字熟語を見つける）
            const wordsRes = await fetchWithTimeout(`https://kanjiapi.dev/v1/words/${encodeURIComponent(char)}`, 3000);
            if (wordsRes.ok) {
                const wordsData = await wordsRes.json();
                // 優先度が高い2~3字の熟語を探す
                let bestWord = null;
                let bestScore = -1;

                for (const w of wordsData) {
                    if (!w.meanings || w.meanings.length === 0) continue;
                    for (const variant of w.variants) {
                        if (!variant.written.includes(char)) continue;
                        if (variant.written.length < 2 || variant.written.length > 3) continue;

                        let score = variant.priorities.length * 10;
                        // 2文字熟語を優先
                        if (variant.written.length === 2) score += 5;
                        // 小学校レベルの簡単な熟語を優先
                        if (variant.priorities.some(p => p.startsWith('nf'))) {
                            const nf = parseInt(variant.priorities.find(p => p.startsWith('nf'))?.slice(2) || '99');
                            score += Math.max(0, 50 - nf);
                        }

                        if (score > bestScore) {
                            bestScore = score;
                            const engMeaning = w.meanings[0].glosses[0];
                            const jpMeaning = ENG_TO_JP[engMeaning.toLowerCase()] || null;
                            bestWord = {
                                word: variant.written,
                                reading: variant.pronounced,
                                meaningEn: engMeaning,
                                meaningJp: jpMeaning,
                            };
                        }
                    }
                }
                if (bestWord) {
                    wordCache[char] = bestWord;
                }
            }

            await new Promise(r => setTimeout(r, 30));
        } catch (e) { }
        if ((i + 1) % 100 === 0) console.log(`  Fetched ${i + 1}/${allChars.length}...`);
    }
    console.log(`Cached words for ${Object.keys(wordCache).length} kanji.`);

    // ---------- ヒントを再構築 ----------
    for (let grade = 1; grade <= 6; grade++) {
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);
        if (!fs.existsSync(quizFile)) continue;

        let quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
        let updatedCount = 0;

        for (const q of quizData) {
            const kanji = kanjiMap[q.targetKanji];
            if (!kanji) continue;

            const char = q.targetKanji;
            const word = wordCache[char];
            const jpMeaning = meaningCache[char];
            const radical = kanji.radical || '';
            const radicalReading = kanji.radicalReading || '';

            // 「言葉で漢字が類推できるヒント」を作る
            function makeContextHint(targetChar) {
                const w = wordCache[targetChar];
                const m = meaningCache[targetChar];
                if (w) {
                    const wordMeaning = w.meaningJp || m || '';
                    if (wordMeaning) {
                        return `${w.word}（${w.reading}）の「${targetChar}」。${wordMeaning}`;
                    } else {
                        return `${w.word}（${w.reading}）の「${targetChar}」`;
                    }
                } else if (m) {
                    return `「${m}」という意味`;
                }
                // フォールバック：訓読みがあればそれを使う
                const k = kanjiMap[targetChar];
                if (k?.readings?.kunyomi?.length > 0) {
                    // 最も自然な訓読みを選ぶ（動詞なら「〜く」「〜る」形、形容詞なら「〜い」形）
                    const kuns = k.readings.kunyomi.map(r => r.replace('.', ''));
                    return `「${kuns[0]}」と読む漢字`;
                }
                if (k?.readings?.onyomi?.length > 0) {
                    return `音読みは「${k.readings.onyomi[0]}」`;
                }
                return null;
            }

            switch (q.type) {
                case 'reading': {
                    const hint = makeContextHint(char);
                    if (hint) {
                        q.hint = hint;
                        updatedCount++;
                    }
                    break;
                }

                case 'writing': {
                    let parts = [];
                    if (word) {
                        const wordMeaning = word.meaningJp || jpMeaning || '';
                        if (wordMeaning) parts.push(`「${wordMeaning}」という意味`);
                        else parts.push(`${word.word}（${word.reading}）の「${char}」`);
                    } else if (jpMeaning) {
                        parts.push(`「${jpMeaning}」という意味`);
                    }
                    if (radicalReading) parts.push(`部首は「${radicalReading}」`);
                    parts.push(`${kanji.strokes}画`);
                    if (parts.length > 1) {
                        q.hint = parts.join('、');
                        updatedCount++;
                    }
                    break;
                }

                case 'antonym': {
                    let parts = [];
                    const targetHint = makeContextHint(char);
                    const answerHint = makeContextHint(q.answer);
                    if (targetHint) parts.push(`「${char}」は${targetHint}`);
                    if (answerHint) parts.push(`答えは${answerHint}`);
                    if (parts.length > 0) {
                        q.hint = parts.join('。');
                        updatedCount++;
                    }
                    break;
                }

                case 'sentence': {
                    // 穴埋め問題：答えの漢字の意味をヒントに
                    const hint = makeContextHint(char);
                    if (hint) {
                        // 既存の読み方情報を保持しつつ意味を追加
                        const readingMatch = q.hint?.match(/読み方は「(.+?)」/);
                        if (readingMatch) {
                            q.hint = `読み方は「${readingMatch[1]}」。${hint}`;
                        } else {
                            q.hint = hint;
                        }
                        updatedCount++;
                    }
                    break;
                }

                case 'radical': {
                    let parts = [];
                    if (radicalReading) parts.push(`部首の名前は「${radicalReading}」`);
                    if (word) {
                        const wordMeaning = word.meaningJp || jpMeaning || '';
                        if (wordMeaning) parts.push(`「${char}」は「${wordMeaning}」に関する漢字`);
                    } else if (jpMeaning) {
                        parts.push(`「${char}」は「${jpMeaning}」に関する漢字`);
                    }
                    if (parts.length > 0) {
                        q.hint = parts.join('、');
                        updatedCount++;
                    }
                    break;
                }

                case 'okurigana': {
                    const hint = makeContextHint(char);
                    if (hint) {
                        // 既存の読み方情報を保持
                        const readMatch = q.hint?.match(/「(.+?)」と読みます/);
                        if (readMatch) {
                            q.hint = `「${readMatch[1]}」と読みます。${hint}`;
                        } else {
                            q.hint = hint;
                        }
                        updatedCount++;
                    }
                    break;
                }
            }
        }

        fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
        console.log(`Grade ${grade}: Updated ${updatedCount} hints.`);
    }
}

rebuildAllHints().then(() => console.log('Done!'));
