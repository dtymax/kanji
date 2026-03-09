// 全学年クイズデータ一括生成スクリプト
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'data', 'quiz');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 2年生クイズ
const grade2 = [
    { id: "g2r001", type: "reading", grade: 2, difficulty: 1, question: "「友だち」の読み方は？", answer: "ともだち", choices: ["ともだち", "ゆうだち", "ゆうたち", "ともたち"], hint: "「友」は「とも」と読みます", category: "熟語の読み", targetKanji: "友" },
    { id: "g2r002", type: "reading", grade: 2, difficulty: 1, question: "「教室」の読み方は？", answer: "きょうしつ", choices: ["きょうしつ", "きょうしき", "おしえしつ", "おしえしき"], hint: "「教」は「キョウ」と読みます", category: "熟語の読み", targetKanji: "教" },
    { id: "g2r003", type: "reading", grade: 2, difficulty: 1, question: "「毎朝」の読み方は？", answer: "まいあさ", choices: ["まいあさ", "まいちょう", "つねあさ", "まいちゅう"], hint: "「毎」は「マイ」、「朝」は「あさ」", category: "熟語の読み", targetKanji: "毎" },
    { id: "g2r004", type: "reading", grade: 2, difficulty: 1, question: "「電話」の読み方は？", answer: "でんわ", choices: ["でんわ", "でんはなし", "いなずまわ", "でんかい"], hint: "「電」は「デン」、「話」は「ワ」", category: "熟語の読み", targetKanji: "電" },
    { id: "g2r005", type: "reading", grade: 2, difficulty: 1, question: "「時間」の読み方は？", answer: "じかん", choices: ["じかん", "ときま", "ときかん", "じあいだ"], hint: "「時」は「ジ」、「間」は「カン」", category: "熟語の読み", targetKanji: "時" },
    { id: "g2r006", type: "reading", grade: 2, difficulty: 1, question: "「計算」の読み方は？", answer: "けいさん", choices: ["けいさん", "はかりざん", "けいざん", "はかりさん"], hint: "「計」は「ケイ」、「算」は「サン」", category: "熟語の読み", targetKanji: "計" },
    { id: "g2r007", type: "reading", grade: 2, difficulty: 1, question: "「遠足」の読み方は？", answer: "えんそく", choices: ["えんそく", "とおあし", "えんあし", "とおそく"], hint: "「遠」は「エン」、「足」は「ソク」", category: "熟語の読み", targetKanji: "遠" },
    { id: "g2r008", type: "reading", grade: 2, difficulty: 1, question: "「国語」の読み方は？", answer: "こくご", choices: ["こくご", "くにご", "くにがたり", "こくがたり"], hint: "「国」は「コク」、「語」は「ゴ」", category: "熟語の読み", targetKanji: "国" },
    { id: "g2r009", type: "reading", grade: 2, difficulty: 1, question: "「黄色」の読み方は？", answer: "きいろ", choices: ["きいろ", "おうしょく", "こうしょく", "きしょく"], hint: "「黄」は「き」と読みます", category: "熟語の読み", targetKanji: "黄" },
    { id: "g2r010", type: "reading", grade: 2, difficulty: 1, question: "「新聞」の読み方は？", answer: "しんぶん", choices: ["しんぶん", "あたらしもん", "しんもん", "にいぶん"], hint: "「新」は「シン」、「聞」は「ブン」", category: "熟語の読み", targetKanji: "新" },
    { id: "g2w001", type: "writing", grade: 2, difficulty: 1, question: "「とり」を漢字で書きましょう", answer: "鳥", hint: "11画の漢字です", category: "漢字の書き取り", targetKanji: "鳥" },
    { id: "g2w002", type: "writing", grade: 2, difficulty: 1, question: "「うま」を漢字で書きましょう", answer: "馬", hint: "10画の漢字です", category: "漢字の書き取り", targetKanji: "馬" },
    { id: "g2w003", type: "writing", grade: 2, difficulty: 1, question: "「かぜ」を漢字で書きましょう", answer: "風", hint: "9画の漢字です", category: "漢字の書き取り", targetKanji: "風" },
    { id: "g2w004", type: "writing", grade: 2, difficulty: 1, question: "「くも」を漢字で書きましょう", answer: "雲", hint: "12画。雨かんむりがつきます", category: "漢字の書き取り", targetKanji: "雲" },
    { id: "g2w005", type: "writing", grade: 2, difficulty: 1, question: "「いえ」を漢字で書きましょう", answer: "家", hint: "10画。うかんむりがつきます", category: "漢字の書き取り", targetKanji: "家" },
    { id: "g2w006", type: "writing", grade: 2, difficulty: 1, question: "「こえ」を漢字で書きましょう", answer: "声", hint: "7画の漢字です", category: "漢字の書き取り", targetKanji: "声" },
    { id: "g2w007", type: "writing", grade: 2, difficulty: 1, question: "「ゆき」を漢字で書きましょう", answer: "雪", hint: "11画。雨かんむりがつきます", category: "漢字の書き取り", targetKanji: "雪" },
    { id: "g2w008", type: "writing", grade: 2, difficulty: 1, question: "「ほし」を漢字で書きましょう", answer: "星", hint: "日と生を合わせた字です", category: "漢字の書き取り", targetKanji: "星" },
    { id: "g2o001", type: "okurigana", grade: 2, difficulty: 1, question: "「走___」正しい送り仮名は？", answer: "る", choices: ["る", "はしる", "り", "す"], hint: "「はしる」と読みます", category: "送り仮名", targetKanji: "走" },
    { id: "g2o002", type: "okurigana", grade: 2, difficulty: 1, question: "「歌___」正しい送り仮名は？", answer: "う", choices: ["う", "うたう", "い", "か"], hint: "「うたう」と読みます", category: "送り仮名", targetKanji: "歌" },
    { id: "g2o003", type: "okurigana", grade: 2, difficulty: 1, question: "「読___」正しい送り仮名は？", answer: "む", choices: ["む", "み", "め", "よむ"], hint: "「よむ」と読みます", category: "送り仮名", targetKanji: "読" },
    { id: "g2o004", type: "okurigana", grade: 2, difficulty: 1, question: "「強___」正しい送り仮名は？", answer: "い", choices: ["い", "つよい", "く", "さ"], hint: "「つよい」と読みます", category: "送り仮名", targetKanji: "強" },
    { id: "g2o005", type: "okurigana", grade: 2, difficulty: 1, question: "「通___」正しい送り仮名は？", answer: "る", choices: ["る", "り", "す", "とおる"], hint: "「とおる」と読みます", category: "送り仮名", targetKanji: "通" },
    { id: "g2a001", type: "antonym", grade: 2, difficulty: 1, question: "「新」の反対の漢字は？", answer: "古", choices: ["古", "旧", "昔", "前"], hint: "新しいの反対", category: "対義語", targetKanji: "新" },
    { id: "g2a002", type: "antonym", grade: 2, difficulty: 1, question: "「強」の反対の漢字は？", answer: "弱", choices: ["弱", "軽", "細", "少"], hint: "強いの反対", category: "対義語", targetKanji: "強" },
    { id: "g2a003", type: "antonym", grade: 2, difficulty: 1, question: "「多」の反対の漢字は？", answer: "少", choices: ["少", "小", "低", "弱"], hint: "多いの反対", category: "対義語", targetKanji: "多" },
    { id: "g2a004", type: "antonym", grade: 2, difficulty: 1, question: "「長」の反対の漢字は？", answer: "短", choices: ["短", "少", "小", "低"], hint: "長いの反対（2年生では習いませんが…）", category: "対義語", targetKanji: "長" },
    { id: "g2a005", type: "antonym", grade: 2, difficulty: 1, question: "「売」の反対の漢字は？", answer: "買", choices: ["買", "得", "取", "受"], hint: "売るの反対", category: "対義語", targetKanji: "売" },
    { id: "g2s001", type: "sentence", grade: 2, difficulty: 1, question: "「___をよむのが好きです」漢字を書きましょう", answer: "本", hint: "読むものです", category: "文章の穴埋め", targetKanji: "本" },
    { id: "g2s002", type: "sentence", grade: 2, difficulty: 1, question: "「___曜日にえんそくがある」漢字を書きましょう", answer: "月", hint: "一週間の最初の日", category: "文章の穴埋め", targetKanji: "月" },
    { id: "g2s003", type: "sentence", grade: 2, difficulty: 1, question: "「___の中をおよぐ」漢字を書きましょう", answer: "海", hint: "広い水のあるところ", category: "文章の穴埋め", targetKanji: "海" },
    { id: "g2s004", type: "sentence", grade: 2, difficulty: 1, question: "「___に絵をかく」漢字を書きましょう", answer: "紙", hint: "書いたり描いたりするもの", category: "文章の穴埋め", targetKanji: "紙" },
    { id: "g2s005", type: "sentence", grade: 2, difficulty: 1, question: "「___校から帰る」漢字を書きましょう", answer: "学", hint: "勉強するところ", category: "文章の穴埋め", targetKanji: "学" },
    { id: "g2rad001", type: "radical", grade: 2, difficulty: 1, question: "「語」の部首は？", answer: "ごんべん（言）", choices: ["ごんべん（言）", "くちへん（口）", "にんべん（亻）", "きへん（木）"], hint: "言葉に関係する部首", category: "部首", targetKanji: "語" },
    { id: "g2rad002", type: "radical", grade: 2, difficulty: 1, question: "「池」の部首は？", answer: "さんずい（氵）", choices: ["さんずい（氵）", "つちへん（土）", "にんべん（亻）", "きへん（木）"], hint: "水に関係する部首", category: "部首", targetKanji: "池" },
    { id: "g2rad003", type: "radical", grade: 2, difficulty: 1, question: "「雲」の部首は？", answer: "あめかんむり（雨）", choices: ["あめかんむり（雨）", "くさかんむり（艹）", "うかんむり（宀）", "たけかんむり（竹）"], hint: "天気に関係する部首", category: "部首", targetKanji: "雲" },
];

// 3年生クイズ
const grade3 = [
    { id: "g3r001", type: "reading", grade: 3, difficulty: 2, question: "「温度」の読み方は？", answer: "おんど", choices: ["おんど", "あつど", "おんたく", "あたたかど"], hint: "「温」は「オン」", category: "熟語の読み", targetKanji: "温" },
    { id: "g3r002", type: "reading", grade: 3, difficulty: 2, question: "「研究」の読み方は？", answer: "けんきゅう", choices: ["けんきゅう", "とぎきゅう", "けんぐう", "とぎぐう"], hint: "「研」は「ケン」、「究」は「キュウ」", category: "熟語の読み", targetKanji: "研" },
    { id: "g3r003", type: "reading", grade: 3, difficulty: 2, question: "「都会」の読み方は？", answer: "とかい", choices: ["とかい", "みやこかい", "つかい", "みやこあい"], hint: "「都」は「ト」、「会」は「カイ」", category: "熟語の読み", targetKanji: "都" },
    { id: "g3r004", type: "reading", grade: 3, difficulty: 2, question: "「農業」の読み方は？", answer: "のうぎょう", choices: ["のうぎょう", "のうわざ", "のうごう", "のうぎょ"], hint: "「農」は「ノウ」、「業」は「ギョウ」", category: "熟語の読み", targetKanji: "農" },
    { id: "g3r005", type: "reading", grade: 3, difficulty: 2, question: "「宿題」の読み方は？", answer: "しゅくだい", choices: ["しゅくだい", "やどだい", "しゅくもん", "やどもん"], hint: "「宿」は「シュク」、「題」は「ダイ」", category: "熟語の読み", targetKanji: "宿" },
    { id: "g3r006", type: "reading", grade: 3, difficulty: 2, question: "「商店」の読み方は？", answer: "しょうてん", choices: ["しょうてん", "あきてん", "しょうみせ", "あきみせ"], hint: "「商」は「ショウ」", category: "熟語の読み", targetKanji: "商" },
    { id: "g3r007", type: "reading", grade: 3, difficulty: 2, question: "「想像」の読み方は？", answer: "そうぞう", choices: ["そうぞう", "おもぞう", "そうかたち", "おもかたち"], hint: "「想」は「ソウ」、「像」は「ゾウ」", category: "熟語の読み", targetKanji: "想" },
    { id: "g3r008", type: "reading", grade: 3, difficulty: 2, question: "「安全」の読み方は？", answer: "あんぜん", choices: ["あんぜん", "やすぜん", "あんまった", "やすまった"], hint: "「安」は「アン」、「全」は「ゼン」", category: "熟語の読み", targetKanji: "安" },
    { id: "g3r009", type: "reading", grade: 3, difficulty: 2, question: "「動物」の読み方は？", answer: "どうぶつ", choices: ["どうぶつ", "うごもの", "どうもの", "うごぶつ"], hint: "「動」は「ドウ」、「物」は「ブツ」", category: "熟語の読み", targetKanji: "動" },
    { id: "g3r010", type: "reading", grade: 3, difficulty: 2, question: "「集合」の読み方は？", answer: "しゅうごう", choices: ["しゅうごう", "あつごう", "あつあい", "しゅうあい"], hint: "「集」は「シュウ」、「合」は「ゴウ」", category: "熟語の読み", targetKanji: "集" },
    { id: "g3w001", type: "writing", grade: 3, difficulty: 2, question: "「はし」（橋）を漢字で書きましょう", answer: "橋", hint: "16画。きへんがつきます", category: "漢字の書き取り", targetKanji: "橋" },
    { id: "g3w002", type: "writing", grade: 3, difficulty: 2, question: "「しま」を漢字で書きましょう", answer: "島", hint: "10画。山がつきます", category: "漢字の書き取り", targetKanji: "島" },
    { id: "g3w003", type: "writing", grade: 3, difficulty: 2, question: "「みなと」を漢字で書きましょう", answer: "港", hint: "12画。さんずいがつきます", category: "漢字の書き取り", targetKanji: "港" },
    { id: "g3w004", type: "writing", grade: 3, difficulty: 2, question: "「むかし」を漢字で書きましょう", answer: "昔", hint: "8画の漢字です", category: "漢字の書き取り", targetKanji: "昔" },
    { id: "g3w005", type: "writing", grade: 3, difficulty: 2, question: "「さか」を漢字で書きましょう", answer: "坂", hint: "7画。つちへんがつきます", category: "漢字の書き取り", targetKanji: "坂" },
    { id: "g3o001", type: "okurigana", grade: 3, difficulty: 2, question: "「落___」正しい送り仮名は？", answer: "ちる", choices: ["ちる", "おちる", "ちた", "す"], hint: "「おちる」と読みます", category: "送り仮名", targetKanji: "落" },
    { id: "g3o002", type: "okurigana", grade: 3, difficulty: 2, question: "「決___」正しい送り仮名は？", answer: "める", choices: ["める", "まる", "きめる", "む"], hint: "「きめる」と読みます", category: "送り仮名", targetKanji: "決" },
    { id: "g3o003", type: "okurigana", grade: 3, difficulty: 2, question: "「悲し___」正しい送り仮名は？", answer: "い", choices: ["い", "しい", "み", "む"], hint: "「かなしい」と読みます", category: "送り仮名", targetKanji: "悲" },
    { id: "g3o004", type: "okurigana", grade: 3, difficulty: 2, question: "「深___」正しい送り仮名は？", answer: "い", choices: ["い", "ふかい", "く", "さ"], hint: "「ふかい」と読みます", category: "送り仮名", targetKanji: "深" },
    { id: "g3o005", type: "okurigana", grade: 3, difficulty: 2, question: "「始___」正しい送り仮名は？", answer: "める", choices: ["める", "まる", "はじめる", "む"], hint: "「はじめる」と読みます", category: "送り仮名", targetKanji: "始" },
    { id: "g3a001", type: "antonym", grade: 3, difficulty: 2, question: "「暗」の反対の漢字は？", answer: "明", choices: ["明", "光", "白", "日"], hint: "暗いの反対", category: "対義語", targetKanji: "暗" },
    { id: "g3a002", type: "antonym", grade: 3, difficulty: 2, question: "「重」の反対の漢字は？", answer: "軽", choices: ["軽", "薄", "少", "低"], hint: "重いの反対", category: "対義語", targetKanji: "重" },
    { id: "g3a003", type: "antonym", grade: 3, difficulty: 2, question: "「勝」の反対の漢字は？", answer: "負", choices: ["負", "敗", "失", "弱"], hint: "勝つの反対", category: "対義語", targetKanji: "勝" },
    { id: "g3a004", type: "antonym", grade: 3, difficulty: 2, question: "「悪」の反対の漢字は？", answer: "善", choices: ["善", "良", "正", "美"], hint: "悪いの反対", category: "対義語", targetKanji: "悪" },
    { id: "g3a005", type: "antonym", grade: 3, difficulty: 2, question: "「寒」の反対の漢字は？", answer: "暑", choices: ["暑", "熱", "温", "夏"], hint: "寒いの反対", category: "対義語", targetKanji: "寒" },
    { id: "g3s001", type: "sentence", grade: 3, difficulty: 2, question: "「___車に乗って出かける」漢字を書きましょう", answer: "自", hint: "「自動車」の最初の字", category: "文章の穴埋め", targetKanji: "自" },
    { id: "g3s002", type: "sentence", grade: 3, difficulty: 2, question: "「図書___で本を読む」漢字を書きましょう", answer: "館", hint: "本がたくさんある建物", category: "文章の穴埋め", targetKanji: "館" },
    { id: "g3s003", type: "sentence", grade: 3, difficulty: 2, question: "「___院に行く」漢字を書きましょう", answer: "病", hint: "体の調子が悪いときに行くところ", category: "文章の穴埋め", targetKanji: "病" },
    { id: "g3s004", type: "sentence", grade: 3, difficulty: 2, question: "「___楽を聞く」漢字を書きましょう", answer: "音", hint: "歌や楽器の音", category: "文章の穴埋め", targetKanji: "音" },
    { id: "g3s005", type: "sentence", grade: 3, difficulty: 2, question: "「お___さんに手紙を書く」漢字を書きましょう", answer: "母", hint: "おかあさん", category: "文章の穴埋め", targetKanji: "母" },
    { id: "g3rad001", type: "radical", grade: 3, difficulty: 2, question: "「湖」の部首は？", answer: "さんずい（氵）", choices: ["さんずい（氵）", "つちへん（土）", "こへん（子）", "にんべん（亻）"], hint: "水に関係する部首", category: "部首", targetKanji: "湖" },
    { id: "g3rad002", type: "radical", grade: 3, difficulty: 2, question: "「植」の部首は？", answer: "きへん（木）", choices: ["きへん（木）", "さんずい（氵）", "つちへん（土）", "くさかんむり（艹）"], hint: "木に関係する部首", category: "部首", targetKanji: "植" },
    { id: "g3rad003", type: "radical", grade: 3, difficulty: 2, question: "「鉄」の部首は？", answer: "かねへん（金）", choices: ["かねへん（金）", "きへん（木）", "つちへん（土）", "いしへん（石）"], hint: "金属に関係する部首", category: "部首", targetKanji: "鉄" },
];

// 4年生クイズ
const grade4 = [
    { id: "g4r001", type: "reading", grade: 4, difficulty: 2, question: "「機械」の読み方は？", answer: "きかい", choices: ["きかい", "きがい", "はたかい", "はたがい"], hint: "「機」は「キ」、「械」は「カイ」", category: "熟語の読み", targetKanji: "機" },
    { id: "g4r002", type: "reading", grade: 4, difficulty: 2, question: "「議論」の読み方は？", answer: "ぎろん", choices: ["ぎろん", "ぎりん", "ごろん", "ごりん"], hint: "「議」は「ギ」、「論（6年）」は「ロン」", category: "熟語の読み", targetKanji: "議" },
    { id: "g4r003", type: "reading", grade: 4, difficulty: 2, question: "「栄養」の読み方は？", answer: "えいよう", choices: ["えいよう", "さかよう", "えいやしない", "さかやしない"], hint: "「栄」は「エイ」、「養」は「ヨウ」", category: "熟語の読み", targetKanji: "栄" },
    { id: "g4r004", type: "reading", grade: 4, difficulty: 2, question: "「健康」の読み方は？", answer: "けんこう", choices: ["けんこう", "たてこう", "けんやす", "たてやす"], hint: "「健」は「ケン」、「康」は「コウ」", category: "熟語の読み", targetKanji: "健" },
    { id: "g4r005", type: "reading", grade: 4, difficulty: 2, question: "「選挙」の読み方は？", answer: "せんきょ", choices: ["せんきょ", "えらきょ", "せんあげ", "えらあげ"], hint: "「選」は「セン」、「挙」は「キョ」", category: "熟語の読み", targetKanji: "選" },
    { id: "g4r006", type: "reading", grade: 4, difficulty: 2, question: "「残念」の読み方は？", answer: "ざんねん", choices: ["ざんねん", "のこねん", "ざんおも", "のこおも"], hint: "「残」は「ザン」、「念」は「ネン」", category: "熟語の読み", targetKanji: "残" },
    { id: "g4r007", type: "reading", grade: 4, difficulty: 2, question: "「伝説」の読み方は？", answer: "でんせつ", choices: ["でんせつ", "つたせつ", "でんとき", "つたとき"], hint: "「伝」は「デン」、「説」は「セツ」", category: "熟語の読み", targetKanji: "伝" },
    { id: "g4r008", type: "reading", grade: 4, difficulty: 2, question: "「努力」の読み方は？", answer: "どりょく", choices: ["どりょく", "つとりょく", "どちから", "つとちから"], hint: "「努」は「ド」、「力」は「リョク」", category: "熟語の読み", targetKanji: "努" },
    { id: "g4r009", type: "reading", grade: 4, difficulty: 3, question: "「不便」の読み方は？", answer: "ふべん", choices: ["ふべん", "ふびん", "ぶべん", "ぶびん"], hint: "「不」は「フ」、「便」は「ベン」", category: "熟語の読み", targetKanji: "不" },
    { id: "g4r010", type: "reading", grade: 4, difficulty: 3, question: "「約束」の読み方は？", answer: "やくそく", choices: ["やくそく", "やくたば", "つづそく", "つづたば"], hint: "「約」は「ヤク」、「束」は「ソク」", category: "熟語の読み", targetKanji: "約" },
    { id: "g4w001", type: "writing", grade: 4, difficulty: 2, question: "「しお」を漢字で書きましょう", answer: "塩", hint: "13画。つちへんがつきます", category: "漢字の書き取り", targetKanji: "塩" },
    { id: "g4w002", type: "writing", grade: 4, difficulty: 2, question: "「かがみ」を漢字で書きましょう", answer: "鏡", hint: "19画。かねへんがつきます", category: "漢字の書き取り", targetKanji: "鏡" },
    { id: "g4w003", type: "writing", grade: 4, difficulty: 2, question: "「まつ」を漢字で書きましょう", answer: "松", hint: "8画。きへんがつきます", category: "漢字の書き取り", targetKanji: "松" },
    { id: "g4w004", type: "writing", grade: 4, difficulty: 2, question: "「はた」（旗）を漢字で書きましょう", answer: "旗", hint: "14画の漢字です", category: "漢字の書き取り", targetKanji: "旗" },
    { id: "g4w005", type: "writing", grade: 4, difficulty: 2, question: "「くすり」を漢字で書きましょう", answer: "薬", hint: "16画。くさかんむりがつきます", category: "漢字の書き取り", targetKanji: "薬" },
    { id: "g4o001", type: "okurigana", grade: 4, difficulty: 2, question: "「変わ___」正しい送り仮名は？", answer: "る", choices: ["る", "わる", "り", "い"], hint: "「かわる」と読みます", category: "送り仮名", targetKanji: "変" },
    { id: "g4o002", type: "okurigana", grade: 4, difficulty: 2, question: "「冷た___」正しい送り仮名は？", answer: "い", choices: ["い", "たい", "く", "さ"], hint: "「つめたい」と読みます", category: "送り仮名", targetKanji: "冷" },
    { id: "g4o003", type: "okurigana", grade: 4, difficulty: 2, question: "「散___」正しい送り仮名は？", answer: "る", choices: ["る", "らす", "り", "す"], hint: "「ちる」と読みます", category: "送り仮名", targetKanji: "散" },
    { id: "g4o004", type: "okurigana", grade: 4, difficulty: 2, question: "「包___」正しい送り仮名は？", answer: "む", choices: ["む", "つつむ", "み", "う"], hint: "「つつむ」と読みます", category: "送り仮名", targetKanji: "包" },
    { id: "g4o005", type: "okurigana", grade: 4, difficulty: 2, question: "「望___」正しい送り仮名は？", answer: "む", choices: ["む", "のぞむ", "み", "い"], hint: "「のぞむ」と読みます", category: "送り仮名", targetKanji: "望" },
    { id: "g4a001", type: "antonym", grade: 4, difficulty: 2, question: "「成功」の反対の言葉は？", answer: "失敗", choices: ["失敗", "努力", "成長", "完成"], hint: "うまくいくの反対", category: "対義語", targetKanji: "成" },
    { id: "g4a002", type: "antonym", grade: 4, difficulty: 2, question: "「建設」の反対の言葉は？", answer: "破壊", choices: ["破壊", "改造", "変更", "消滅"], hint: "建てるの反対", category: "対義語", targetKanji: "建" },
    { id: "g4a003", type: "antonym", grade: 4, difficulty: 2, question: "「完成」の反対の言葉は？", answer: "未完", choices: ["未完", "失敗", "破壊", "中止"], hint: "できあがった の反対", category: "対義語", targetKanji: "完" },
    { id: "g4s001", type: "sentence", grade: 4, difficulty: 2, question: "「___験に合格する」漢字を書きましょう", answer: "試", hint: "テストのこと", category: "文章の穴埋め", targetKanji: "試" },
    { id: "g4s002", type: "sentence", grade: 4, difficulty: 2, question: "「飛行___に乗る」漢字を書きましょう", answer: "機", hint: "空を飛ぶ乗り物", category: "文章の穴埋め", targetKanji: "機" },
    { id: "g4s003", type: "sentence", grade: 4, difficulty: 2, question: "「信___を守る」漢字を書きましょう", answer: "号", hint: "赤・黄・青にかわるもの", category: "文章の穴埋め", targetKanji: "号" },
    { id: "g4rad001", type: "radical", grade: 4, difficulty: 2, question: "「鏡」の部首は？", answer: "かねへん（金）", choices: ["かねへん（金）", "めへん（目）", "きへん（木）", "いしへん（石）"], hint: "金属に関係する部首", category: "部首", targetKanji: "鏡" },
    { id: "g4rad002", type: "radical", grade: 4, difficulty: 2, question: "「菜」の部首は？", answer: "くさかんむり（艹）", choices: ["くさかんむり（艹）", "きへん（木）", "さんずい（氵）", "したごころ（心）"], hint: "植物に関係する部首", category: "部首", targetKanji: "菜" },
];

// 5年生クイズ
const grade5 = [
    { id: "g5r001", type: "reading", grade: 5, difficulty: 3, question: "「貿易」の読み方は？", answer: "ぼうえき", choices: ["ぼうえき", "ばいえき", "ぼうやく", "ばいやく"], hint: "「貿」は「ボウ」、「易」は「エキ」", category: "熟語の読み", targetKanji: "貿" },
    { id: "g5r002", type: "reading", grade: 5, difficulty: 3, question: "「演説」の読み方は？", answer: "えんぜつ", choices: ["えんぜつ", "えんせつ", "えんとき", "えんかい"], hint: "「演」は「エン」、「説」は「ゼツ/セツ」", category: "熟語の読み", targetKanji: "演" },
    { id: "g5r003", type: "reading", grade: 5, difficulty: 3, question: "「精密」の読み方は？", answer: "せいみつ", choices: ["せいみつ", "しょうみつ", "せいひそか", "しょうひそか"], hint: "「精」は「セイ」、「密」は「ミツ」", category: "熟語の読み", targetKanji: "精" },
    { id: "g5r004", type: "reading", grade: 5, difficulty: 3, question: "「規則」の読み方は？", answer: "きそく", choices: ["きそく", "きのり", "きさく", "きのっとり"], hint: "「規」は「キ」、「則」は「ソク」", category: "熟語の読み", targetKanji: "規" },
    { id: "g5r005", type: "reading", grade: 5, difficulty: 3, question: "「許可」の読み方は？", answer: "きょか", choices: ["きょか", "きょうか", "ゆるか", "ゆるすか"], hint: "「許」は「キョ」、「可」は「カ」", category: "熟語の読み", targetKanji: "許" },
    { id: "g5r006", type: "reading", grade: 5, difficulty: 3, question: "「導入」の読み方は？", answer: "どうにゅう", choices: ["どうにゅう", "みちいり", "どういり", "みちにゅう"], hint: "「導」は「ドウ」、「入」は「ニュウ」", category: "熟語の読み", targetKanji: "導" },
    { id: "g5r007", type: "reading", grade: 5, difficulty: 3, question: "「犯罪」の読み方は？", answer: "はんざい", choices: ["はんざい", "ぼんつみ", "はんつみ", "ぼんざい"], hint: "「犯」は「ハン」、「罪」は「ザイ」", category: "熟語の読み", targetKanji: "犯" },
    { id: "g5r008", type: "reading", grade: 5, difficulty: 3, question: "「構造」の読み方は？", answer: "こうぞう", choices: ["こうぞう", "かまつくり", "こうつくり", "かまぞう"], hint: "「構」は「コウ」、「造」は「ゾウ」", category: "熟語の読み", targetKanji: "構" },
    { id: "g5w001", type: "writing", grade: 5, difficulty: 3, question: "「さくら」を漢字で書きましょう", answer: "桜", hint: "きへんがつきます。日本の花", category: "漢字の書き取り", targetKanji: "桜" },
    { id: "g5w002", type: "writing", grade: 5, difficulty: 3, question: "「つま」（妻）を漢字で書きましょう", answer: "妻", hint: "8画の漢字です", category: "漢字の書き取り", targetKanji: "妻" },
    { id: "g5w003", type: "writing", grade: 5, difficulty: 3, question: "「どう」（銅）を漢字で書きましょう", answer: "銅", hint: "かねへんがつきます", category: "漢字の書き取り", targetKanji: "銅" },
    { id: "g5o001", type: "okurigana", grade: 5, difficulty: 3, question: "「適___」正しい送り仮名は？", answer: "する", choices: ["する", "う", "い", "く"], hint: "「てきする」と読みます", category: "送り仮名", targetKanji: "適" },
    { id: "g5o002", type: "okurigana", grade: 5, difficulty: 3, question: "「営___」正しい送り仮名は？", answer: "む", choices: ["む", "い", "う", "く"], hint: "「いとなむ」と読みます", category: "送り仮名", targetKanji: "営" },
    { id: "g5o003", type: "okurigana", grade: 5, difficulty: 3, question: "「混ぜ___」正しい送り仮名は？", answer: "る", choices: ["る", "ぜる", "す", "い"], hint: "「まぜる」と読みます", category: "送り仮名", targetKanji: "混" },
    { id: "g5a001", type: "antonym", grade: 5, difficulty: 3, question: "「永久」の反対の言葉は？", answer: "一時", choices: ["一時", "短期", "少し", "瞬間"], hint: "ずっと続く の反対", category: "対義語", targetKanji: "永" },
    { id: "g5a002", type: "antonym", grade: 5, difficulty: 3, question: "「増加」の反対の言葉は？", answer: "減少", choices: ["減少", "縮小", "消滅", "後退"], hint: "増える の反対", category: "対義語", targetKanji: "増" },
    { id: "g5a003", type: "antonym", grade: 5, difficulty: 3, question: "「複雑」の反対の言葉は？", answer: "単純", choices: ["単純", "簡単", "容易", "平凡"], hint: "こみいった の反対", category: "対義語", targetKanji: "複" },
    { id: "g5s001", type: "sentence", grade: 5, difficulty: 3, question: "「自然___境を守る」漢字を書きましょう", answer: "環", hint: "まわりのこと", category: "文章の穴埋め", targetKanji: "境" },
    { id: "g5s002", type: "sentence", grade: 5, difficulty: 3, question: "「国際___流が大切だ」漢字を書きましょう", answer: "交", hint: "おたがいにやりとりすること", category: "文章の穴埋め", targetKanji: "交" },
    { id: "g5rad001", type: "radical", grade: 5, difficulty: 3, question: "「桜」の部首は？", answer: "きへん（木）", choices: ["きへん（木）", "くさかんむり（艹）", "さんずい（氵）", "にんべん（亻）"], hint: "木に関係する部首", category: "部首", targetKanji: "桜" },
];

// 6年生クイズ
const grade6 = [
    { id: "g6r001", type: "reading", grade: 6, difficulty: 3, question: "「憲法」の読み方は？", answer: "けんぽう", choices: ["けんぽう", "けんほう", "のりほう", "のりぽう"], hint: "「憲」は「ケン」、「法」は「ポウ/ホウ」", category: "熟語の読み", targetKanji: "憲" },
    { id: "g6r002", type: "reading", grade: 6, difficulty: 3, question: "「権利」の読み方は？", answer: "けんり", choices: ["けんり", "ごんり", "けんとし", "ごんとし"], hint: "「権」は「ケン」、「利」は「リ」", category: "熟語の読み", targetKanji: "権" },
    { id: "g6r003", type: "reading", grade: 6, difficulty: 3, question: "「批判」の読み方は？", answer: "ひはん", choices: ["ひはん", "ひばん", "ひぱん", "ひだん"], hint: "「批」は「ヒ」、「判」は「ハン」", category: "熟語の読み", targetKanji: "批" },
    { id: "g6r004", type: "reading", grade: 6, difficulty: 3, question: "「朗読」の読み方は？", answer: "ろうどく", choices: ["ろうどく", "あきどく", "ろうとく", "あきとく"], hint: "「朗」は「ロウ」、「読」は「ドク」", category: "熟語の読み", targetKanji: "朗" },
    { id: "g6r005", type: "reading", grade: 6, difficulty: 3, question: "「宝物」の読み方は？", answer: "たからもの", choices: ["たからもの", "ほうもつ", "ほうぶつ", "たからぶつ"], hint: "「宝」は「たから」と読みます", category: "熟語の読み", targetKanji: "宝" },
    { id: "g6r006", type: "reading", grade: 6, difficulty: 3, question: "「蒸発」の読み方は？", answer: "じょうはつ", choices: ["じょうはつ", "むしはつ", "じょうほつ", "むしほつ"], hint: "「蒸」は「ジョウ」、「発」は「ハツ」", category: "熟語の読み", targetKanji: "蒸" },
    { id: "g6r007", type: "reading", grade: 6, difficulty: 3, question: "「縮小」の読み方は？", answer: "しゅくしょう", choices: ["しゅくしょう", "ちぢしょう", "しゅくこ", "ちぢこ"], hint: "「縮」は「シュク」、「小」は「ショウ」", category: "熟語の読み", targetKanji: "縮" },
    { id: "g6r008", type: "reading", grade: 6, difficulty: 3, question: "「遺跡」の読み方は？", answer: "いせき", choices: ["いせき", "のこせき", "いあと", "のこあと"], hint: "「遺」は「イ」、「跡」は「セキ」", category: "熟語の読み", targetKanji: "遺" },
    { id: "g6w001", type: "writing", grade: 6, difficulty: 3, question: "「すな」を漢字で書きましょう", answer: "砂", hint: "いしへんがつきます", category: "漢字の書き取り", targetKanji: "砂" },
    { id: "g6w002", type: "writing", grade: 6, difficulty: 3, question: "「ほね」を漢字で書きましょう", answer: "骨", hint: "10画の漢字です", category: "漢字の書き取り", targetKanji: "骨" },
    { id: "g6w003", type: "writing", grade: 6, difficulty: 3, question: "「きぬ」を漢字で書きましょう", answer: "絹", hint: "いとへんがつきます", category: "漢字の書き取り", targetKanji: "絹" },
    { id: "g6o001", type: "okurigana", grade: 6, difficulty: 3, question: "「認め___」正しい送り仮名は？", answer: "る", choices: ["る", "める", "い", "す"], hint: "「みとめる」と読みます", category: "送り仮名", targetKanji: "認" },
    { id: "g6o002", type: "okurigana", grade: 6, difficulty: 3, question: "「異な___」正しい送り仮名は？", answer: "る", choices: ["る", "なる", "い", "く"], hint: "「ことなる」と読みます", category: "送り仮名", targetKanji: "異" },
    { id: "g6o003", type: "okurigana", grade: 6, difficulty: 3, question: "「暮ら___」正しい送り仮名は？", answer: "す", choices: ["す", "らす", "し", "る"], hint: "「くらす」と読みます", category: "送り仮名", targetKanji: "暮" },
    { id: "g6a001", type: "antonym", grade: 6, difficulty: 3, question: "「拡大」の反対の言葉は？", answer: "縮小", choices: ["縮小", "減少", "削除", "消滅"], hint: "大きくする の反対", category: "対義語", targetKanji: "拡" },
    { id: "g6a002", type: "antonym", grade: 6, difficulty: 3, question: "「賛成」の反対の言葉は？", answer: "反対", choices: ["反対", "否定", "批判", "拒否"], hint: "同意する の反対", category: "対義語", targetKanji: "賛" },
    { id: "g6a003", type: "antonym", grade: 6, difficulty: 3, question: "「創造」の反対の言葉は？", answer: "破壊", choices: ["破壊", "模倣", "消滅", "削除"], hint: "新しく作る の反対", category: "対義語", targetKanji: "創" },
    { id: "g6s001", type: "sentence", grade: 6, difficulty: 3, question: "「___法を守ることが大切だ」漢字を書きましょう", answer: "憲", hint: "国の基本的なきまり", category: "文章の穴埋め", targetKanji: "憲" },
    { id: "g6s002", type: "sentence", grade: 6, difficulty: 3, question: "「___劇を見に行く」漢字を書きましょう", answer: "演", hint: "舞台で見せること", category: "文章の穴埋め", targetKanji: "演" },
    { id: "g6rad001", type: "radical", grade: 6, difficulty: 3, question: "「針」の部首は？", answer: "かねへん（金）", choices: ["かねへん（金）", "きへん（木）", "いとへん（糸）", "いしへん（石）"], hint: "金属に関係する部首", category: "部首", targetKanji: "針" },
];

// 書き出し
const allData = { 2: grade2, 3: grade3, 4: grade4, 5: grade5, 6: grade6 };
for (const [g, data] of Object.entries(allData)) {
    const p = path.join(outDir, `grade${g}_quiz.json`);
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Grade ${g}: ${data.length} quiz questions -> ${p}`);
}
console.log('All quiz data generated!');
