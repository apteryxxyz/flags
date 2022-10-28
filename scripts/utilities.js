const { existsSync, mkdirSync } = require('fs');
const ProgressBar = require('progress');

function ensureDirSync(paths, callback) {
    if (!Array.isArray(paths)) paths = [paths];
    paths.forEach(p => !existsSync(p) && mkdirSync(p));
    return callback();
}

function makeProgressBar(total) {
    return new ProgressBar(
        '[:bar] :current/:total | :percent | :elapseds elapsed | ~:etas remaining',
        {
            total,
            width: 30,
            complete: '█',
            incomplete: '░',
            clear: true,
        }
    );
}

function chunkArray(array, size) {
    const chunks = [];
    let i = 0,
        n = array.length;
    while (i < n) chunks.push(array.slice(i, (i += size)));
    return chunks;
}

module.exports = { ensureDirSync, makeProgressBar, chunkArray };
