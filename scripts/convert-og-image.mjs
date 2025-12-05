import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svg = readFileSync(join(publicDir, 'og-image.svg'), 'utf-8');
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 }
});
const pngData = resvg.render();
writeFileSync(join(publicDir, 'og-image.png'), pngData.asPng());
console.log('Created og-image.png (1200x630)');
