const fs = require('fs');
const path = require('path');

const statsPath = path.resolve(__dirname, '..', 'webpack-stats.json');
const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
const mainChunks = stats.chunks && stats.chunks.main;

if (stats.status !== 'done') {
  throw new Error(`Expected webpack status "done", received ${JSON.stringify(stats.status)}`);
}

if (!Array.isArray(mainChunks) || mainChunks.length === 0) {
  throw new Error('Expected webpack-stats.json to contain a non-empty chunks.main array');
}

for (const chunk of mainChunks) {
  if (!chunk || typeof chunk.name !== 'string' || typeof chunk.path !== 'string') {
    throw new Error('Expected every chunks.main item to contain string name and path properties');
  }
}

if (!mainChunks.some(chunk => chunk.name.endsWith('.js'))) {
  throw new Error('Expected chunks.main to contain a JavaScript bundle');
}

console.log(`Validated legacy webpack stats contract for ${mainChunks.length} main chunk file(s).`);
