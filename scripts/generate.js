const { readdirSync, readFileSync, writeFileSync } = require('fs');
const sharp = require('sharp');
const svg2png = require('svg2png');
const { ensureDirSync, makeProgressBar } = require('./utilities');

const HEIGHT = 32;
const MULTIPLES = [1, 2, 4, 6, 8, 10];
const SIZES = MULTIPLES.map(m => HEIGHT * m);

async function main() {
    const queue = prepareDirectories();
    await generatePngs(queue);
    await generateWebps(queue);
    console.info(`🎉 Generated PNGs and WEBPs for ${queue.length * 2} flags!`);
}

function prepareDirectories() {
    console.info('📦 Starting preparation steps...');
    const progress = makeProgressBar(5);

    ensureDirSync('png', () => progress.tick());
    ensureDirSync('webp', () => progress.tick());
    ensureDirSync(
        SIZES.map(s => `png/${s}`),
        () => progress.tick()
    );
    ensureDirSync(
        SIZES.map(s => `webp/${s}`),
        () => progress.tick()
    );

    const queue = readdirSync('svg')
        .filter(f => f.endsWith('.svg'))
        .map(f => {
            const name = f.substring(f, f.length - 4);
            const svg = readFileSync('svg/' + f);
            return { name, svg };
        });
    progress.tick();

    const time = ((new Date() - progress.start) / 1000).toFixed(1);
    console.info(`📦 Completed preparation in ${time}s!`);
    return queue;
}

async function generatePngs(queue) {
    console.info(`📷 Generating PNG files for ${queue.length} SVGs...`);
    const progress = makeProgressBar(queue.length * SIZES.length);

    for (const { name, svg } of queue) {
        await Promise.all(
            SIZES.map(async s => {
                const png = await svg2png(svg, { height: s });
                writeFileSync(`png/${s}/${name}.png`, png);
                progress.tick();
            })
        );
    }

    const time = ((new Date() - progress.start) / 1000).toFixed(1);
    console.info(`📷 Completed PNG generation in ${time}s!`);
}

async function generateWebps(queue) {
    console.info(`🌐 Generating WEBP files for ${queue.length} SVGs...`);
    const progress = makeProgressBar(queue.length * SIZES.length);

    for (const { name } of queue) {
        await Promise.all(
            SIZES.map(async s => {
                const png = readFileSync(`png/${s}/${name}.png`);
                await sharp(png).toFile(`webp/${s}/${name}.webp`);
                progress.tick();
            })
        );
    }

    const time = ((new Date() - progress.start) / 1000).toFixed(1);
    console.info(`🌐 Completed WEBP generation in ${time}s!`);
}

main();
