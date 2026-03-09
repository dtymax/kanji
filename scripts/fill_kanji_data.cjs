const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data', 'kanji');

async function fillMissingKanjiData() {
    for (let grade = 1; grade <= 6; grade++) {
        const kanjiFile = path.join(dataDir, `grade${grade}.json`);

        if (!fs.existsSync(kanjiFile)) {
            continue;
        }

        let kanjiData = JSON.parse(fs.readFileSync(kanjiFile, 'utf-8'));
        let updatedCount = 0;

        console.log(`Checking Grade ${grade}...`);

        for (let i = 0; i < kanjiData.length; i++) {
            const k = kanjiData[i];

            // If strokes is 0 or missing, we need to fetch the data
            if (!k.strokes || k.strokes === 0) {
                try {
                    // Fetch from kanjiapi.dev
                    const res = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(k.character)}`);
                    if (!res.ok) {
                        console.warn(`Failed to fetch data for ${k.character}: ${res.status}`);
                        continue;
                    }

                    const apiData = await res.json();

                    // Update missing fields
                    k.strokes = apiData.stroke_count || 0;

                    if (!k.readings) k.readings = { onyomi: [], kunyomi: [] };
                    if (k.readings.onyomi.length === 0 && apiData.on_readings) {
                        k.readings.onyomi = apiData.on_readings;
                    }
                    if (k.readings.kunyomi.length === 0 && apiData.kun_readings) {
                        k.readings.kunyomi = apiData.kun_readings;
                    }

                    if (!k.meanings || k.meanings.length === 0) {
                        k.meanings = apiData.meanings || [];
                    }

                    console.log(`Updated ${k.character} (Strokes: ${k.strokes})`);
                    updatedCount++;

                    // Small delay to avoid hammering the API
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (err) {
                    console.error(`Error fetching ${k.character}`, err.message);
                }
            }
        }

        if (updatedCount > 0) {
            fs.writeFileSync(kanjiFile, JSON.stringify(kanjiData, null, 2), 'utf-8');
            console.log(`Grade ${grade}: Updated ${updatedCount} kanji characters.`);
        } else {
            console.log(`Grade ${grade}: All kanji already have valid stroke counts.`);
        }
    }
}

fillMissingKanjiData().then(() => console.log('Done filling missing kanji data.'));
