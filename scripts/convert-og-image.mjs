import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

for (const [name, width] of [['og-image', 1200], ['og-image-square', 1080]]) {
  const svg = readFileSync(join(publicDir, `${name}.svg`), 'utf-8');
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
  writeFileSync(join(publicDir, `${name}.png`), png);
  console.log(`Created ${name}.png (${width}px wide)`);
}
