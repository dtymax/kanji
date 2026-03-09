const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const kanjiDir = path.join(dataDir, 'kanji');
const quizDir = path.join(dataDir, 'quiz');

// 漢字の意味の日本語訳辞書（よく使われるものを手動で定義）
const MEANING_JP = {
    'one': 'ひとつ', 'two': 'ふたつ', 'three': 'みっつ', 'four': 'よっつ', 'five': 'いつつ',
    'six': 'むっつ', 'seven': 'ななつ', 'eight': 'やっつ', 'nine': 'ここのつ', 'ten': 'とお',
    'hundred': 'ひゃく', 'thousand': 'せん', 'ten thousand': 'まん',
    'above': 'うえ', 'below': 'した', 'left': 'ひだり', 'right': 'みぎ',
    'big': 'おおきい', 'small': 'ちいさい', 'middle': 'なか', 'in': 'なか',
    'mountain': 'やま', 'river': 'かわ', 'fire': 'ひ', 'water': 'みず',
    'tree': 'き', 'wood': 'き', 'forest': 'もり', 'grove': 'はやし', 'bamboo': 'たけ',
    'flower': 'はな', 'grass': 'くさ', 'stone': 'いし', 'gold': 'きん', 'metal': 'きんぞく',
    'earth': 'つち', 'soil': 'つち', 'sky': 'そら', 'heaven': 'てん',
    'rain': 'あめ', 'cloud': 'くも', 'wind': 'かぜ', 'snow': 'ゆき',
    'sun': 'ひ', 'day': 'ひ', 'moon': 'つき', 'month': 'つき',
    'year': 'とし', 'time': 'とき', 'early': 'はやい', 'now': 'いま',
    'life': 'いのち・せいかつ', 'birth': 'うまれる', 'death': 'しぬ',
    'study': 'まなぶ', 'learning': 'がくしゅう', 'school': 'がっこう',
    'man': 'おとこ', 'woman': 'おんな', 'child': 'こ', 'person': 'ひと', 'people': 'ひと',
    'father': 'ちち', 'mother': 'はは', 'friend': 'ともだち',
    'eye': 'め', 'ear': 'みみ', 'mouth': 'くち', 'hand': 'て', 'foot': 'あし',
    'dog': 'いぬ', 'insect': 'むし', 'shellfish': 'かい', 'fish': 'さかな', 'bird': 'とり', 'horse': 'うま', 'cow': 'うし',
    'king': 'おう', 'jewel': 'たま', 'power': 'ちから', 'strength': 'ちから',
    'stand': 'たつ', 'rest': 'やすむ', 'enter': 'はいる', 'exit': 'でる',
    'see': 'みる', 'hear': 'きく', 'say': 'いう', 'speak': 'はなす', 'read': 'よむ', 'write': 'かく',
    'go': 'いく', 'come': 'くる', 'walk': 'あるく', 'run': 'はしる',
    'eat': 'たべる', 'drink': 'のむ', 'buy': 'かう', 'sell': 'うる',
    'correct': 'ただしい', 'new': 'あたらしい', 'old': 'ふるい', 'long': 'ながい', 'short': 'みじかい',
    'high': 'たかい', 'low': 'ひくい', 'strong': 'つよい', 'weak': 'よわい',
    'many': 'おおい', 'few': 'すくない', 'wide': 'ひろい', 'narrow': 'せまい',
    'hot': 'あつい', 'cold': 'さむい・つめたい', 'warm': 'あたたかい', 'cool': 'すずしい',
    'bright': 'あかるい', 'dark': 'くらい', 'white': 'しろい', 'black': 'くろい', 'red': 'あかい', 'blue': 'あおい',
    'spring': 'はる', 'summer': 'なつ', 'autumn': 'あき', 'fall': 'あき', 'winter': 'ふゆ',
    'morning': 'あさ', 'evening': 'ゆうがた', 'night': 'よる', 'noon': 'ひる',
    'north': 'きた', 'south': 'みなみ', 'east': 'ひがし', 'west': 'にし',
    'front': 'まえ', 'back': 'うしろ', 'behind': 'うしろ', 'inside': 'うち', 'outside': 'そと',
    'country': 'くに', 'village': 'むら', 'town': 'まち', 'city': 'まち・し',
    'road': 'みち', 'gate': 'もん', 'house': 'いえ', 'room': 'へや',
    'car': 'くるま', 'ship': 'ふね', 'rice': 'こめ', 'wheat': 'むぎ', 'meat': 'にく',
    'book': 'ほん', 'paper': 'かみ', 'thread': 'いと', 'clothes': 'ころも',
    'number': 'かず', 'word': 'ことば', 'letter': 'もじ', 'name': 'なまえ',
    'heart': 'こころ', 'spirit': 'き', 'voice': 'こえ', 'sound': 'おと', 'color': 'いろ', 'shape': 'かたち',
    'thing': 'もの', 'matter': 'こと', 'place': 'ところ', 'field': 'はたけ',
    'think': 'かんがえる', 'know': 'しる', 'teach': 'おしえる', 'begin': 'はじめる', 'end': 'おわる',
    'open': 'ひらく・あける', 'close': 'しめる・とじる', 'stop': 'とまる',
    'turn': 'まわる', 'fall': 'おちる', 'fly': 'とぶ', 'pull': 'ひく', 'push': 'おす',
    'cut': 'きる', 'break': 'こわす', 'make': 'つくる', 'build': 'たてる',
    'send': 'おくる', 'receive': 'うける', 'lend': 'かす', 'borrow': 'かりる',
    'win': 'かつ', 'lose': 'まける', 'increase': 'ふえる', 'decrease': 'へる',
    'love': 'あい', 'peace': 'へいわ', 'war': 'せんそう', 'evil': 'わるい', 'good': 'よい',
    'truth': 'まこと', 'beauty': 'うつくしさ', 'happiness': 'しあわせ',
    'public': 'おおやけ', 'private': 'わたくし', 'group': 'あつまり',
    'plan': 'けいかく', 'rule': 'きまり', 'reason': 'りゆう', 'cause': 'げんいん',
    'effect': 'こうか', 'fact': 'じじつ', 'example': 'れい', 'type': 'かた',
    'quality': 'しつ', 'quantity': 'りょう', 'value': 'あたい', 'price': 'ねだん',
    'profit': 'りえき', 'loss': 'そんしつ', 'wealth': 'とみ', 'poverty': 'まずしさ',
    'duty': 'ぎむ', 'right': 'けんり', 'freedom': 'じゆう', 'law': 'ほうりつ',
    'danger': 'きけん', 'safe': 'あんぜん', 'protect': 'まもる', 'attack': 'せめる',
    'deep': 'ふかい', 'shallow': 'あさい', 'thick': 'あつい', 'thin': 'うすい',
    'heavy': 'おもい', 'light': 'かるい', 'fast': 'はやい', 'slow': 'おそい',
    'near': 'ちかい', 'far': 'とおい', 'same': 'おなじ', 'different': 'ちがう',
    'easy': 'やさしい・かんたん', 'difficult': 'むずかしい',
    'clean': 'きれい', 'dirty': 'きたない', 'dry': 'かわく', 'wet': 'ぬれる',
    'sweet': 'あまい', 'bitter': 'にがい', 'sour': 'すっぱい', 'spicy': 'からい',
};

// 部首の画数辞書
const RADICAL_STROKES = {
    '一': 1, '丨': 1, '丶': 1, '丿': 1, '乙': 1, '亅': 1,
    '二': 2, '人': 2, '亻': 2, '儿': 2, '入': 2, '八': 2, '冂': 2, '冖': 2, '冫': 2, '几': 2,
    '凵': 2, '刀': 2, '刂': 2, '力': 2, '勹': 2, '匕': 2, '匚': 2, '十': 2, '卜': 2, '卩': 2,
    '厂': 2, '厶': 2, '又': 2,
    '口': 3, '囗': 3, '土': 3, '士': 3, '夂': 3, '夕': 3, '大': 3, '女': 3, '子': 3, '宀': 3,
    '寸': 3, '小': 3, '尢': 3, '尸': 3, '屮': 3, '山': 3, '巛': 3, '工': 3, '己': 3, '巾': 3,
    '干': 3, '幺': 3, '广': 3, '廴': 3, '弓': 3, '彡': 3, '彳': 3,
    '心': 4, '忄': 3, '戈': 4, '戸': 4, '手': 4, '扌': 3, '攴': 4, '文': 4, '斗': 4, '斤': 4,
    '方': 4, '日': 4, '曰': 4, '月': 4, '木': 4, '欠': 4, '止': 4, '歹': 4, '殳': 4, '毛': 4,
    '气': 4, '水': 4, '氵': 3, '火': 4, '灬': 4, '爪': 4, '父': 4, '爻': 4, '片': 4, '牙': 4,
    '牛': 4, '犬': 4, '犭': 3,
    '玄': 5, '玉': 5, '王': 4, '瓜': 5, '瓦': 5, '甘': 5, '生': 5, '用': 5, '田': 5, '疋': 5,
    '疒': 5, '癶': 5, '白': 5, '皮': 5, '皿': 5, '目': 5, '矛': 5, '矢': 5, '石': 5, '示': 5,
    '禾': 5, '穴': 5, '立': 5,
    '竹': 6, '米': 6, '糸': 6, '缶': 6, '网': 6, '羊': 6, '羽': 6, '老': 6, '而': 6, '耒': 6,
    '耳': 6, '聿': 6, '肉': 6, '臣': 6, '自': 6, '至': 6, '臼': 6, '舌': 6, '舟': 6, '艮': 6,
    '色': 6, '艸': 6,
    '虍': 6, '虫': 6, '血': 6, '行': 6, '衣': 6, '衤': 5, '西': 6,
    '見': 7, '角': 7, '言': 7, '谷': 7, '豆': 7, '豕': 7, '豸': 7, '貝': 7, '赤': 7, '走': 7,
    '足': 7, '身': 7, '車': 7, '辛': 7, '辰': 7, '辵': 7, '邑': 7, '酉': 7, '釆': 7, '里': 7,
    '金': 8, '長': 8, '門': 8, '阜': 8, '隹': 8, '雨': 8, '青': 8, '非': 8,
    '面': 9, '革': 9, '韋': 9, '韭': 9, '音': 9, '頁': 9, '風': 9, '飛': 9, '食': 9, '首': 9,
    '香': 9, '馬': 10, '骨': 10, '高': 10, '髟': 10, '鬥': 10, '鬯': 10, '鬲': 10, '鬼': 10,
    '魚': 11, '鳥': 11, '鹵': 11, '鹿': 11, '麦': 11, '麻': 11,
    '黄': 12, '黍': 12, '黒': 11, '黹': 12, '黽': 13, '鼎': 13, '鼓': 13, '鼠': 13, '鼻': 14,
    '齊': 14, '歯': 12, '龍': 16, '龜': 16, '龠': 17,
};

// 部首の日本語名辞書
const RADICAL_NAMES = {
    '一': 'いち', '丨': 'ぼう', '丶': 'てん', '丿': 'の', '乙': 'おつ', '亅': 'はねぼう',
    '二': 'に', '人': 'ひと', '亻': 'にんべん', '儿': 'にんにょう', '入': 'いる',
    '八': 'はち', '冂': 'けいがまえ', '冖': 'わかんむり', '冫': 'にすい', '几': 'つくえ',
    '凵': 'うけばこ', '刀': 'かたな', '刂': 'りっとう', '力': 'ちから', '勹': 'つつみがまえ',
    '匕': 'さじ', '匚': 'はこがまえ', '十': 'じゅう', '卜': 'ぼく', '卩': 'ふしづくり',
    '厂': 'がんだれ', '厶': 'む', '又': 'また', '口': 'くち', '囗': 'くにがまえ',
    '土': 'つち', '士': 'さむらい', '夂': 'ふゆがしら', '夕': 'ゆうべ', '大': 'だい',
    '女': 'おんな', '子': 'こ', '宀': 'うかんむり', '寸': 'すん', '小': 'しょう',
    '尸': 'しかばね', '山': 'やま', '巛': 'まがりがわ',
    '工': 'たくみ', '己': 'おのれ', '巾': 'はば', '干': 'ほす',
    '广': 'まだれ', '廴': 'えんにょう', '弓': 'ゆみ', '彡': 'さんづくり', '彳': 'ぎょうにんべん',
    '心': 'こころ', '忄': 'りっしんべん', '戈': 'ほこ', '戸': 'とだれ', '手': 'て',
    '扌': 'てへん', '攴': 'ぼくづくり', '文': 'ぶん', '斗': 'とます', '斤': 'おのづくり',
    '方': 'ほう', '日': 'にち', '曰': 'ひらび', '月': 'つき', '木': 'き',
    '欠': 'あくび', '止': 'とめる', '歹': 'がつへん', '殳': 'ほこづくり', '毛': 'け',
    '气': 'きがまえ', '水': 'みず', '氵': 'さんずい', '火': 'ひ', '灬': 'れんが',
    '爪': 'つめ', '父': 'ちち', '片': 'かた', '牙': 'きば',
    '牛': 'うし', '犬': 'いぬ', '犭': 'けものへん', '玉': 'たま',
    '王': 'おう', '瓦': 'かわら', '甘': 'あまい', '生': 'せい',
    '用': 'もちいる', '田': 'た', '疒': 'やまいだれ', '癶': 'はつがしら',
    '白': 'しろ', '皮': 'かわ', '皿': 'さら', '目': 'め', '矛': 'ほこ',
    '矢': 'や', '石': 'いし', '示': 'しめす', '禾': 'のぎへん', '穴': 'あな',
    '立': 'たつ', '竹': 'たけかんむり', '米': 'こめへん', '糸': 'いとへん', '缶': 'ほとぎ',
    '网': 'あみがしら', '羊': 'ひつじ', '羽': 'はね', '老': 'おいがしら',
    '耒': 'すきへん', '耳': 'みみ', '聿': 'ふでづくり', '肉': 'にく',
    '自': 'みずから', '至': 'いたる', '臼': 'うす', '舌': 'した', '舟': 'ふね',
    '色': 'いろ', '艸': 'くさかんむり', '虍': 'とらがしら', '虫': 'むし',
    '血': 'ち', '行': 'ぎょうがまえ', '衣': 'ころも', '衤': 'ころもへん', '西': 'にし',
    '見': 'みる', '角': 'つの', '言': 'ごんべん', '谷': 'たに', '豆': 'まめ',
    '貝': 'かい', '赤': 'あか', '走': 'はしる',
    '足': 'あし', '身': 'み', '車': 'くるま', '辛': 'からい',
    '辵': 'しんにょう', '邑': 'おおざと', '酉': 'とり', '里': 'さと',
    '金': 'かねへん', '長': 'ながい', '門': 'もんがまえ', '阜': 'こざとへん', '隹': 'ふるとり',
    '雨': 'あめかんむり', '青': 'あお', '非': 'あらず', '面': 'めん', '革': 'かわ',
    '音': 'おと', '頁': 'おおがい', '風': 'かぜ',
    '食': 'しょくへん', '首': 'くび', '馬': 'うま', '骨': 'ほね', '高': 'たかい',
    '鬼': 'おに', '魚': 'うお', '鳥': 'とり', '鹿': 'しか', '麦': 'むぎ', '麻': 'あさ',
    '黄': 'き', '黒': 'くろ', '歯': 'は', '鼻': 'はな',
};

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

function getMeaningJP(meanings) {
    if (!meanings || meanings.length === 0) return null;
    const eng = meanings[0].toLowerCase();
    if (MEANING_JP[eng]) return MEANING_JP[eng];
    // 複数の意味がある場合、最初に見つかったものを返す
    for (const m of meanings) {
        const lower = m.toLowerCase();
        if (MEANING_JP[lower]) return MEANING_JP[lower];
    }
    return null;
}

async function improveAllHints() {
    // まず全学年の漢字データを読み込む
    const kanjiMap = {}; // character -> kanji data
    for (let g = 1; g <= 6; g++) {
        const kanjiFile = path.join(kanjiDir, `grade${g}.json`);
        if (!fs.existsSync(kanjiFile)) continue;
        const data = JSON.parse(fs.readFileSync(kanjiFile, 'utf-8'));
        data.forEach(k => { kanjiMap[k.character] = k; });
    }

    // kanjiapi.devから意味を取得してキャッシュ
    const meaningCache = {};
    console.log('Fetching kanji meanings from kanjiapi.dev...');
    const allChars = Object.keys(kanjiMap);
    for (let i = 0; i < allChars.length; i++) {
        const char = allChars[i];
        try {
            const res = await fetchWithTimeout(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(char)}`, 3000);
            if (res.ok) {
                const data = await res.json();
                if (data.meanings && data.meanings.length > 0) {
                    // 日本語訳を試みる
                    const jp = getMeaningJP(data.meanings);
                    meaningCache[char] = {
                        jp: jp,
                        en: data.meanings[0],
                        allMeanings: data.meanings,
                    };
                }
            }
            await new Promise(r => setTimeout(r, 30));
        } catch (e) { }
        if ((i + 1) % 100 === 0) console.log(`  Fetched ${i + 1}/${allChars.length}...`);
    }
    console.log(`Cached meanings for ${Object.keys(meaningCache).length} kanji.`);

    // 各学年のクイズを処理
    for (let grade = 1; grade <= 6; grade++) {
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);
        if (!fs.existsSync(quizFile)) continue;

        let quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
        let updatedCount = 0;

        for (const q of quizData) {
            const kanji = kanjiMap[q.targetKanji];
            const meaning = meaningCache[q.targetKanji];
            if (!kanji) continue;

            const meaningText = meaning ? (meaning.jp || meaning.en) : null;

            switch (q.type) {
                case 'reading': {
                    // ヒントに意味を追加
                    if (meaningText) {
                        const on = kanji.readings?.onyomi?.[0] || '';
                        const kun = kanji.readings?.kunyomi?.[0]?.replace('.', '') || '';
                        let parts = [];
                        if (meaningText) parts.push(`「${q.targetKanji}」は「${meaningText}」という意味`);
                        if (on) parts.push(`音読み：${on}`);
                        if (kun) parts.push(`訓読み：${kun}`);
                        q.hint = parts.join('、');
                        updatedCount++;
                    }
                    break;
                }

                case 'writing': {
                    // 「○年生で習う漢字です」を意味に置換、ひらがなそのまま反復も改善
                    if (meaningText) {
                        const radical = kanji.radical || '';
                        const radName = kanji.radicalReading || RADICAL_NAMES[radical] || '';
                        let parts = [];
                        parts.push(`「${meaningText}」という意味`);
                        if (radName) parts.push(`部首は「${radName}」`);
                        parts.push(`${kanji.strokes}画`);
                        q.hint = parts.join('、');
                        updatedCount++;
                    }
                    break;
                }

                case 'antonym': {
                    // 「○年生で習う漢字です」→ 答えの漢字の意味をヒントに
                    const answerMeaning = meaningCache[q.answer];
                    const targetMeaning = meaningCache[q.targetKanji];
                    if (answerMeaning || targetMeaning) {
                        let parts = [];
                        if (targetMeaning) {
                            const tm = targetMeaning.jp || targetMeaning.en;
                            parts.push(`「${q.targetKanji}」は「${tm}」という意味`);
                        }
                        if (answerMeaning) {
                            const am = answerMeaning.jp || answerMeaning.en;
                            parts.push(`答えは「${am}」という意味の漢字`);
                        }
                        q.hint = parts.join('。');
                        updatedCount++;
                    }
                    break;
                }

                case 'radical': {
                    // 画数を部首の画数に変更、部首名をヒントに
                    const radical = kanji.radical || '';
                    const radName = kanji.radicalReading || RADICAL_NAMES[radical] || '';
                    const radStrokes = RADICAL_STROKES[radical];
                    let parts = [];
                    if (radName) parts.push(`部首の名前は「${radName}」`);
                    if (radStrokes) parts.push(`部首の画数は${radStrokes}画`);
                    if (meaningText) parts.push(`「${q.targetKanji}」は「${meaningText}」に関係する漢字`);
                    if (parts.length > 0) {
                        q.hint = parts.join('、');
                        updatedCount++;
                    }
                    break;
                }

                case 'okurigana': {
                    // 送り仮名のヒントに意味を追加
                    if (meaningText && q.hint) {
                        q.hint = q.hint + `。「${meaningText}」という意味`;
                        updatedCount++;
                    }
                    break;
                }

                // sentence はすでに意味入り→そのまま
            }
        }

        fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
        console.log(`Grade ${grade}: Updated ${updatedCount} hints.`);
    }
}

improveAllHints().then(() => console.log('Done!'));
