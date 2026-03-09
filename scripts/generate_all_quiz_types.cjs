const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const kanjiDir = path.join(dataDir, 'kanji');
const quizDir = path.join(dataDir, 'quiz');

// 対義語の辞書
const ANTONYMS = {
    '大': '小', '小': '大', '上': '下', '下': '上', '左': '右', '右': '左', '入': '出', '出': '入',
    '男': '女', '女': '男', '天': '地', '地': '天', '山': '川', '川': '山', '火': '水', '水': '火',
    '白': '黒', '黒': '白', '赤': '青', '青': '赤', '生': '死', '死': '生', '明': '暗', '暗': '明',
    '長': '短', '短': '長', '高': '低', '低': '高', '強': '弱', '弱': '強', '多': '少', '少': '多',
    '新': '旧', '旧': '新', '古': '新', '広': '狭', '狭': '広', '東': '西', '西': '東', '南': '北', '北': '南',
    '前': '後', '後': '前', '内': '外', '外': '内', '開': '閉', '閉': '開', '始': '終', '終': '始',
    '晴': '曇', '曇': '晴', '朝': '夜', '夜': '朝', '昼': '夜', '春': '秋', '秋': '春', '夏': '冬', '冬': '夏',
    '正': '誤', '誤': '正', '善': '悪', '悪': '善', '勝': '負', '負': '勝', '進': '退', '退': '進',
    '増': '減', '減': '増', '軽': '重', '重': '軽', '深': '浅', '浅': '深', '厚': '薄', '薄': '厚',
    '太': '細', '細': '太', '寒': '暑', '暑': '寒', '遠': '近', '近': '遠', '速': '遅', '遅': '速',
    '買': '売', '売': '買', '送': '届', '去': '来', '来': '去', '往': '復', '復': '往',
    '公': '私', '私': '公', '快': '不', '有': '無', '無': '有', '和': '争', '争': '和',
    '表': '裏', '裏': '表', '陽': '陰', '陰': '陽', '起': '伏', '伏': '起', '集': '散', '散': '集',
    '成': '敗', '敗': '成', '動': '静', '静': '動', '乾': '湿', '湿': '乾', '甘': '辛', '辛': '甘',
    '得': '失', '失': '得', '因': '果', '果': '因', '問': '答', '答': '問', '需': '供', '供': '需',
    '豊': '貧', '貧': '豊', '賛': '否', '否': '賛', '許': '禁', '禁': '許', '創': '破', '破': '創',
    '縦': '横', '横': '縦', '凸': '凹', '凹': '凸', '加': '減', '直': '曲', '曲': '直',
    '親': '子', '子': '親', '兄': '弟', '弟': '兄', '姉': '妹', '妹': '姉', '父': '母', '母': '父',
    '先': '後', '早': '遅', '受': '授', '授': '受', '借': '貸', '貸': '借',
    '点': '面', '面': '点', '線': '面', '頭': '尾', '首': '尾', '攻': '守', '守': '攻',
    '喜': '悲', '悲': '喜', '笑': '泣', '泣': '笑', '愛': '憎', '憎': '愛',
    '昇': '降', '降': '昇', '完': '未', '未': '完', '満': '空', '空': '満',
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
    '尢': 'だいのまげあし', '尸': 'しかばね', '屮': 'てつ', '山': 'やま', '巛': 'まがりがわ',
    '工': 'たくみ', '己': 'おのれ', '巾': 'はば', '干': 'ほす', '幺': 'いとがしら',
    '广': 'まだれ', '廴': 'えんにょう', '弓': 'ゆみ', '彡': 'さんづくり', '彳': 'ぎょうにんべん',
    '心': 'こころ', '忄': 'りっしんべん', '戈': 'ほこ', '戸': 'とだれ', '手': 'て',
    '扌': 'てへん', '攴': 'ぼくづくり', '文': 'ぶん', '斗': 'とます', '斤': 'おのづくり',
    '方': 'ほう', '日': 'にち', '曰': 'ひらび', '月': 'つき', '木': 'き',
    '欠': 'あくび', '止': 'とめる', '歹': 'がつへん', '殳': 'ほこづくり', '毛': 'け',
    '气': 'きがまえ', '水': 'みず', '氵': 'さんずい', '火': 'ひ', '灬': 'れんが',
    '爪': 'つめ', '父': 'ちち', '爻': 'こう', '片': 'かた', '牙': 'きば',
    '牛': 'うし', '犬': 'いぬ', '犭': 'けものへん', '玄': 'げん', '玉': 'たま',
    '王': 'おう', '瓜': 'うり', '瓦': 'かわら', '甘': 'あまい', '生': 'せい',
    '用': 'もちいる', '田': 'た', '疋': 'ひき', '疒': 'やまいだれ', '癶': 'はつがしら',
    '白': 'しろ', '皮': 'ひ', '皿': 'さら', '目': 'め', '矛': 'ほこ',
    '矢': 'や', '石': 'いし', '示': 'しめす', '禾': 'のぎへん', '穴': 'あな',
    '立': 'たつ', '竹': 'たけ', '米': 'こめ', '糸': 'いと', '缶': 'ほとぎ',
    '网': 'あみがしら', '羊': 'ひつじ', '羽': 'はね', '老': 'おいがしら', '而': 'しかして',
    '耒': 'すきへん', '耳': 'みみ', '聿': 'ふでづくり', '肉': 'にく', '臣': 'おみ',
    '自': 'みずから', '至': 'いたる', '臼': 'うす', '舌': 'した', '舟': 'ふね',
    '艮': 'こん', '色': 'いろ', '艸': 'くさ', '虍': 'とらがしら', '虫': 'むし',
    '血': 'ち', '行': 'ぎょう', '衣': 'ころも', '衤': 'ころもへん', '西': 'にし',
    '見': 'みる', '角': 'つの', '言': 'ごん', '谷': 'たに', '豆': 'まめ',
    '豕': 'いのこ', '豸': 'むじな', '貝': 'かい', '赤': 'あか', '走': 'はしる',
    '足': 'あし', '身': 'み', '車': 'くるま', '辛': 'からい', '辰': 'たつ',
    '辵': 'しんにょう', '邑': 'おおざと', '酉': 'とり', '釆': 'のごめ', '里': 'さと',
    '金': 'かね', '長': 'ながい', '門': 'もん', '阜': 'こざとへん', '隹': 'ふるとり',
    '雨': 'あめ', '青': 'あお', '非': 'あらず', '面': 'めん', '革': 'かわ',
    '韋': 'なめしがわ', '韭': 'にら', '音': 'おと', '頁': 'おおがい', '風': 'かぜ',
    '飛': 'とぶ', '食': 'しょく', '首': 'くび', '香': 'かおり', '馬': 'うま',
    '骨': 'ほね', '高': 'たかい', '髟': 'かみがしら', '鬥': 'たたかいがまえ', '鬯': 'ちょう',
    '鬲': 'かなえ', '鬼': 'おに', '魚': 'うお', '鳥': 'とり', '鹵': 'ろ',
    '鹿': 'しか', '麦': 'むぎ', '麻': 'あさ', '黄': 'き', '黍': 'きび',
    '黒': 'くろ', '黹': 'ぬいとり', '黽': 'べん', '鼎': 'かなえ', '鼓': 'つづみ',
    '鼠': 'ねずみ', '鼻': 'はな', '齊': 'せい', '歯': 'は', '龍': 'りゅう', '龜': 'かめ',
    '龠': 'やく',
    // 一般的な部首名
    'にんべん': 'にんべん', 'さんずい': 'さんずい', 'てへん': 'てへん', 'きへん': 'きへん',
    'ごんべん': 'ごんべん', 'いとへん': 'いとへん', 'くさかんむり': 'くさかんむり',
    'しんにょう': 'しんにょう', 'こざとへん': 'こざとへん', 'おおざと': 'おおざと',
};

function generateAllQuizTypes() {
    for (let grade = 1; grade <= 6; grade++) {
        const kanjiFile = path.join(kanjiDir, `grade${grade}.json`);
        const quizFile = path.join(quizDir, `grade${grade}_quiz.json`);
        if (!fs.existsSync(kanjiFile) || !fs.existsSync(quizFile)) continue;

        const kanjiData = JSON.parse(fs.readFileSync(kanjiFile, 'utf-8'));
        let quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));

        // Track existing questions by type+targetKanji
        const existing = {};
        quizData.forEach(q => {
            const key = `${q.type}_${q.targetKanji}`;
            existing[key] = true;
        });

        let addedCount = { reading: 0, okurigana: 0, antonym: 0, sentence: 0, radical: 0 };
        let idCounter = Date.now();

        // Get all kanji chars for this grade (for generating wrong choices)
        const allChars = kanjiData.map(k => k.character);

        kanjiData.forEach((kanji) => {
            const char = kanji.character;
            const on = kanji.readings?.onyomi || [];
            const kun = kanji.readings?.kunyomi || [];
            const examples = kanji.examples || [];
            const radical = kanji.radical || '';
            const radicalReading = kanji.radicalReading || '';

            // =========== 1. Reading questions ===========
            if (!existing[`reading_${char}`]) {
                // Use examples if available
                if (examples.length > 0) {
                    const ex = examples[0];
                    const correctReading = ex.reading;
                    // Generate wrong choices from other kanji examples
                    const wrongChoices = generateWrongReadings(correctReading, kanjiData, char);
                    if (wrongChoices.length >= 3) {
                        const choices = shuffleArray([correctReading, ...wrongChoices.slice(0, 3)]);
                        quizData.push({
                            id: `g${grade}r${idCounter++}`,
                            type: 'reading',
                            grade,
                            difficulty: grade <= 2 ? 1 : grade <= 4 ? 2 : 3,
                            question: `「${ex.word}」の読み方は？`,
                            answer: correctReading,
                            choices,
                            hint: `「${char}」は${on.length > 0 ? '音読み「' + on[0] + '」' : ''}${kun.length > 0 ? '訓読み「' + kun[0].replace('.', '') + '」' : ''}`,
                            category: '熟語の読み',
                            targetKanji: char,
                        });
                        addedCount.reading++;
                    }
                } else if (on.length > 0 || kun.length > 0) {
                    // Fallback: ask about the kanji's reading directly
                    const correctReading = kun.length > 0 ? kun[0].replace('.', '') : on[0];
                    const wrongChoices = generateWrongReadings(correctReading, kanjiData, char);
                    if (wrongChoices.length >= 3) {
                        const choices = shuffleArray([correctReading, ...wrongChoices.slice(0, 3)]);
                        quizData.push({
                            id: `g${grade}r${idCounter++}`,
                            type: 'reading',
                            grade,
                            difficulty: grade <= 2 ? 1 : grade <= 4 ? 2 : 3,
                            question: `「${char}」の読み方は？`,
                            answer: correctReading,
                            choices,
                            hint: `${grade}年生で習う漢字です`,
                            category: '漢字の読み',
                            targetKanji: char,
                        });
                        addedCount.reading++;
                    }
                }
            }

            // =========== 2. Okurigana questions ===========
            if (!existing[`okurigana_${char}`]) {
                // Find kunyomi with okurigana (marked with . in the data)
                const okuriKun = kun.filter(k => k.includes('.'));
                if (okuriKun.length > 0) {
                    const reading = okuriKun[0];
                    const parts = reading.split('.');
                    const okurigana = parts[1]; // the okurigana part
                    const wrongOkuri = generateWrongOkurigana(okurigana);
                    if (wrongOkuri.length >= 3) {
                        const choices = shuffleArray([okurigana, ...wrongOkuri.slice(0, 3)]);
                        quizData.push({
                            id: `g${grade}ok${idCounter++}`,
                            type: 'okurigana',
                            grade,
                            difficulty: grade <= 2 ? 1 : grade <= 4 ? 2 : 3,
                            question: `「${char}___」正しい送り仮名はどれ？`,
                            answer: okurigana,
                            choices,
                            hint: `「${reading.replace('.', '')}」と読みます`,
                            category: '送り仮名',
                            targetKanji: char,
                        });
                        addedCount.okurigana++;
                    }
                }
            }

            // =========== 3. Antonym questions ===========
            if (!existing[`antonym_${char}`] && ANTONYMS[char]) {
                const antonym = ANTONYMS[char];
                // Only add if antonym is in same grade or earlier
                const antonymInGrade = kanjiData.find(k => k.character === antonym);
                if (antonymInGrade) {
                    const wrongChoices = allChars.filter(c => c !== char && c !== antonym).sort(() => Math.random() - 0.5).slice(0, 3);
                    const choices = shuffleArray([antonym, ...wrongChoices]);
                    quizData.push({
                        id: `g${grade}an${idCounter++}`,
                        type: 'antonym',
                        grade,
                        difficulty: grade <= 2 ? 1 : grade <= 4 ? 2 : 3,
                        question: `「${char}」の反対の漢字は？`,
                        answer: antonym,
                        choices,
                        hint: `${grade}年生で習う漢字から選ぼう`,
                        category: '対義語',
                        targetKanji: char,
                    });
                    addedCount.antonym++;
                }
            }

            // =========== 4. Sentence (fill-in) questions ===========
            if (!existing[`sentence_${char}`]) {
                if (examples.length > 0) {
                    const ex = examples[0];
                    const word = ex.word;
                    if (word.includes(char) && word.length >= 2) {
                        const blanked = word.replace(char, '___');
                        quizData.push({
                            id: `g${grade}st${idCounter++}`,
                            type: 'sentence',
                            grade,
                            difficulty: grade <= 2 ? 1 : grade <= 4 ? 2 : 3,
                            question: `「${ex.reading}」→「${blanked}」に入る漢字を書きましょう`,
                            answer: char,
                            hint: `読み方は「${ex.reading}」`,
                            category: '文章の穴埋め',
                            targetKanji: char,
                        });
                        addedCount.sentence++;
                    }
                }
            }

            // =========== 5. Radical questions ===========
            if (!existing[`radical_${char}`] && radical) {
                const radName = radicalReading || RADICAL_NAMES[radical] || radical;
                const answerText = `${radName}（${radical}）`;
                const wrongRadicals = generateWrongRadicals(radical, radName, kanjiData);
                if (wrongRadicals.length >= 3) {
                    const choices = shuffleArray([answerText, ...wrongRadicals.slice(0, 3)]);
                    quizData.push({
                        id: `g${grade}rd${idCounter++}`,
                        type: 'radical',
                        grade,
                        difficulty: grade <= 2 ? 1 : grade <= 4 ? 2 : 3,
                        question: `「${char}」の部首は？`,
                        answer: answerText,
                        choices,
                        hint: `${kanji.strokes}画の漢字です`,
                        category: '部首',
                        targetKanji: char,
                    });
                    addedCount.radical++;
                }
            }
        }); // end kanjiData.forEach

        fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
        console.log(`Grade ${grade}: Added reading=${addedCount.reading}, okurigana=${addedCount.okurigana}, antonym=${addedCount.antonym}, sentence=${addedCount.sentence}, radical=${addedCount.radical}. Total: ${quizData.length}`);
    }
}

// === Helper functions ===

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateWrongReadings(correct, kanjiData, excludeChar) {
    const candidates = [];
    for (const k of kanjiData) {
        if (k.character === excludeChar) continue;
        if (k.examples) {
            for (const ex of k.examples) {
                if (ex.reading && ex.reading !== correct && ex.reading.length > 0) {
                    candidates.push(ex.reading);
                }
            }
        }
        if (k.readings?.onyomi) {
            for (const r of k.readings.onyomi) {
                if (r !== correct) candidates.push(r.toLowerCase());
            }
        }
        if (k.readings?.kunyomi) {
            for (const r of k.readings.kunyomi) {
                const clean = r.replace('.', '');
                if (clean !== correct) candidates.push(clean);
            }
        }
    }
    // Deduplicate and shuffle
    return [...new Set(candidates)].sort(() => Math.random() - 0.5);
}

function generateWrongOkurigana(correct) {
    const allOkurigana = ['い', 'う', 'く', 'す', 'つ', 'む', 'る', 'き', 'ぐ', 'ぶ', 'み', 'ぬ', 'え', 'け', 'せ', 'て', 'ね', 'め', 'れ',
        'った', 'って', 'った', 'りる', 'める', 'べる', 'ける', 'する', 'れる', 'える', 'ある', 'わる', 'かる', 'まる',
        'しい', 'ない', 'たい', 'きい', 'さい', 'ましい', 'らしい', 'がたい'];
    return allOkurigana.filter(o => o !== correct).sort(() => Math.random() - 0.5);
}

function generateWrongRadicals(correctRadical, correctName, kanjiData) {
    const candidates = [];
    const seen = new Set();
    seen.add(correctRadical);
    for (const k of kanjiData) {
        if (k.radical && !seen.has(k.radical)) {
            seen.add(k.radical);
            const name = k.radicalReading || RADICAL_NAMES[k.radical] || k.radical;
            candidates.push(`${name}（${k.radical}）`);
        }
    }
    return candidates.sort(() => Math.random() - 0.5);
}

generateAllQuizTypes();
console.log('Finished generating all quiz types!');
