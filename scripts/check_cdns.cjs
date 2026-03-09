const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data', 'kanji');

async function checkCDNs() {
    const allKanji = [];
    for (let grade = 1; grade <= 6; grade++) {
        const file = path.join(dataDir, `grade${grade}.json`);
        if (fs.existsSync(file)) {
            const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
            allKanji.push(...data.map(k => k.character));
        }
    }

    console.log(`Checking ${allKanji.length} kanji...`);

    let jamschMissing = 0;
    let kanjiMissing = 0;
    let jamschFails = [];
    let kanjiFails = [];

    const BATCH_SIZE = 50;
    for (let i = 0; i < allKanji.length; i += BATCH_SIZE) {
        const batch = allKanji.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (char) => {
            const ur1 = `https://cdn.jsdelivr.net/npm/@jamsch/hanzi-writer-data-jp@latest/${encodeURIComponent(char)}.json`;
            const ur2 = `https://cdn.jsdelivr.net/npm/kanji-writer-data-jp@latest/${encodeURIComponent(char)}.json`;

            try {
                const r1 = await fetch(ur1, { method: 'HEAD' });
                if (r1.status !== 200) {
                    jamschMissing++;
                    jamschFails.push(char);
                }
            } catch (e) {
                jamschMissing++;
            }

            try {
                const r2 = await fetch(ur2, { method: 'HEAD' });
                if (r2.status !== 200) {
                    kanjiMissing++;
                    kanjiFails.push(char);
                }
            } catch (e) {
                kanjiMissing++;
            }
        }));

        console.log(`Processed ${Math.min(i + BATCH_SIZE, allKanji.length)} / ${allKanji.length}`);
    }

    console.log(`@jamsch/hanzi-writer-data-jp missing: ${jamschMissing}`);
    if (jamschMissing > 0) console.log(jamschFails.join(' '));

    console.log(`kanji-writer-data-jp missing: ${kanjiMissing}`);
    if (kanjiMissing > 0) console.log(kanjiFails.join(' '));
}

checkCDNs();
