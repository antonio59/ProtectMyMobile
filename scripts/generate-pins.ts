/**
 * Generate Pinterest pins from the safety slide sets.
 *
 *   pnpm pins:generate
 *
 * Each pin is 1000x1500 (2:3, Pinterest's preferred ratio): a dark title band,
 * two consecutive 16:9 slides stacked, and a branded footer. Sets with an odd
 * slide count reuse the second-to-last slide so every pin has two.
 *
 * Outputs:
 *   public/pins/<set-id>-<part>.jpg   pin images (served from the site so
 *                                     Pinterest can fetch them by URL)
 *   scripts/pinterest/pins.json       manifest: copy, links, board, schedule
 *   scripts/pinterest/pins.csv        Pinterest "bulk create Pins" upload
 *
 * JPEG conversion uses macOS `sips`; elsewhere the PNG is kept instead.
 * Fonts in scripts/pin-fonts are static TTF copies of the site's Archivo and
 * Newsreader (OFL) because resvg can't read woff2 or variable weight axes.
 */
import { Resvg } from '@resvg/resvg-js';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { safetySlideSets, type SafetySlideSet } from '../src/data/scenarios';

const SITE = 'https://protectmymobile.org';
const ROOT = join(import.meta.dirname, '..');
const FONT_DIR = join(ROOT, 'scripts/pin-fonts');
const OUT_IMG = join(ROOT, 'public/pins');
const OUT_DATA = join(ROOT, 'scripts/pinterest');

// First pin goes out on this day; one pin per day at 19:00 UK time (BST).
const SCHEDULE_START = '2026-09-26';
const SCHEDULE_UTC_TIME = '18:00:00';

const W = 1000;
const H = 1500;
const INK = '#16130f';
const CREAM = '#f4efe4';
const ACCENT = '#f0c05a';
const MUTED = '#5b5549';
const SERIF = 'Newsreader 16pt 16pt';
const SANS = 'Archivo';

const BOARDS: Record<string, string> = {
  'moped-snatch': 'Phone Theft Prevention Tips',
  'street-safety': 'Phone Theft Prevention Tips',
  'bump-and-grab': 'Phone Theft Prevention Tips',
  'map-trick': 'Phone Theft Prevention Tips',
  'public-transport': 'London Travel Safety Tips',
  'park-safety': 'London Travel Safety Tips',
  'cafe-safety': 'London Travel Safety Tips',
  nightlife: 'Nightlife Safety Tips',
};

const KEYWORDS =
  'phone theft, phone snatching, stolen phone, London safety, travel safety tips, UK safety';

interface Pin {
  file: string;
  setId: string;
  part: number;
  parts: number;
  slides: [number, number];
  title: string;
  description: string;
  altText: string;
  link: string;
  mediaUrl: string;
  board: string;
  publishAt: string;
}

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

function slidePairs(count: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let a = 1; a <= count; a += 2) {
    pairs.push(a + 1 <= count ? [a, a + 1] : [a - 1, a]);
  }
  return pairs;
}

// Sniff the real format: some slide ".png" files are actually JPEGs, and
// resvg silently drops an image whose declared type doesn't match.
function dataUri(path: string): string {
  const bytes = readFileSync(path);
  const mime =
    bytes[0] === 0xff && bytes[1] === 0xd8
      ? 'image/jpeg'
      : bytes[0] === 0x89 && bytes[1] === 0x50
        ? 'image/png'
        : 'image/svg+xml';
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

function pinSvg(set: SafetySlideSet, part: number, parts: number, slides: [number, number]): string {
  let size = 68;
  let lines = wrap(set.title, 27);
  if (lines.length > 2) {
    size = 56;
    lines = wrap(set.title, 31);
  }
  const titleText = lines
    .map((l, i) => `<tspan x="60" dy="${i === 0 ? 0 : size * 1.08}">${escapeXml(l)}</tspan>`)
    .join('');
  const titleY = lines.length > 1 ? 168 : 205;

  const slideW = 920;
  const slideH = Math.round((slideW * 9) / 16);
  const slideY = [326, 326 + slideH + 24];
  const slideImgs = slides
    .map((n, i) => {
      const href = dataUri(join(ROOT, 'public/Scenarios', set.folder, `${n}.png`));
      return `
      <clipPath id="c${i}"><rect x="40" y="${slideY[i]}" width="${slideW}" height="${slideH}" rx="18"/></clipPath>
      <image href="${href}" x="40" y="${slideY[i]}" width="${slideW}" height="${slideH}"
        preserveAspectRatio="xMidYMid slice" clip-path="url(#c${i})"/>
      <rect x="40" y="${slideY[i]}" width="${slideW}" height="${slideH}" rx="18"
        fill="none" stroke="#ddd5c4" stroke-width="2"/>`;
    })
    .join('');

  const logo = dataUri(join(ROOT, 'public/logo-icon.svg'));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect width="${W}" height="296" fill="${INK}"/>
  <text x="60" y="92" font-family="${SANS}" font-weight="600" font-size="24" letter-spacing="3"
    fill="${ACCENT}">UK PHONE SAFETY  ·  PART ${part} OF ${parts}</text>
  <text x="60" y="${titleY}" font-family="${SERIF}" font-weight="700" font-size="${size}"
    fill="#ffffff">${titleText}</text>
  ${slideImgs}
  <image href="${logo}" x="40" y="1412" width="60" height="60"/>
  <text x="116" y="1438" font-family="${SANS}" font-weight="700" font-size="30" fill="${INK}">ProtectMyMobile</text>
  <text x="116" y="1472" font-family="${SANS}" font-weight="400" font-size="22" fill="${MUTED}">Free UK phone theft guide</text>
  <rect x="664" y="1410" width="296" height="64" rx="32" fill="${INK}"/>
  <text x="812" y="1451" text-anchor="middle" font-family="${SANS}" font-weight="600" font-size="23"
    fill="#ffffff">protectmymobile.org</text>
</svg>`;
}

function pinCopy(set: SafetySlideSet, part: number, parts: number) {
  const title =
    part === 1
      ? `${set.title}: how to stop phone theft in the UK`
      : `${set.title} (part ${part} of ${parts}): UK phone theft tips`;
  const lead =
    part === 1
      ? `${set.summary} ${set.whatHappens.split('. ')[0]}.`
      : `${set.prevention[(part - 2) % set.prevention.length]} ${set.summary}`;
  const description = clip(
    `${lead} Free illustrated guide from ProtectMyMobile, including what to do in the first minutes if your phone is stolen.`,
    500,
  );
  return {
    title: clip(title, 100),
    description,
    altText: clip(`Illustrated phone safety slides: ${set.title}, part ${part} of ${parts}. ${set.summary}`, 500),
  };
}

function toJpeg(png: Buffer, outBase: string): string {
  const pngPath = `${outBase}.png`;
  writeFileSync(pngPath, png);
  try {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '85', pngPath, '--out', `${outBase}.jpg`], {
      stdio: 'ignore',
    });
    rmSync(pngPath);
    return `${outBase}.jpg`;
  } catch {
    return pngPath;
  }
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function main(): void {
  const fontFiles = readdirSync(FONT_DIR)
    .filter((f) => f.endsWith('.ttf'))
    .map((f) => join(FONT_DIR, f));
  if (existsSync(OUT_IMG)) rmSync(OUT_IMG, { recursive: true });
  mkdirSync(OUT_IMG, { recursive: true });
  mkdirSync(OUT_DATA, { recursive: true });

  // Render every pin, grouped by set.
  const bySet = safetySlideSets.map((set) => {
    const pairs = slidePairs(set.slides);
    return pairs.map((slides, i): Omit<Pin, 'publishAt'> => {
      const part = i + 1;
      const svg = pinSvg(set, part, pairs.length, slides);
      const png = new Resvg(svg, {
        font: { loadSystemFonts: false, fontFiles, defaultFontFamily: SANS },
      })
        .render()
        .asPng();
      const written = toJpeg(Buffer.from(png), join(OUT_IMG, `${set.id}-${part}`));
      const file = written.split('/').pop()!;
      const link = `${SITE}/slides/${set.id}?utm_source=pinterest&utm_medium=social&utm_campaign=${set.id}`;
      console.log(`  ${file}`);
      return {
        file,
        setId: set.id,
        part,
        parts: pairs.length,
        slides,
        ...pinCopy(set, part, pairs.length),
        link,
        mediaUrl: `${SITE}/pins/${file}`,
        board: BOARDS[set.id] ?? 'Phone Theft Prevention Tips',
      };
    });
  });

  // Schedule round-robin: every set's part 1 first, then part 2s, and so on,
  // so consecutive days never repeat a set.
  const maxParts = Math.max(...bySet.map((p) => p.length));
  const ordered = Array.from({ length: maxParts }, (_, i) => bySet.map((p) => p[i]).filter(Boolean)).flat();
  const start = new Date(`${SCHEDULE_START}T${SCHEDULE_UTC_TIME}Z`);
  const pins: Pin[] = ordered.map((pin, day) => ({
    ...pin,
    publishAt: new Date(start.getTime() + day * 86_400_000).toISOString().slice(0, 19),
  }));

  writeFileSync(join(OUT_DATA, 'pins.json'), `${JSON.stringify(pins, null, 2)}\n`);
  const header = ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords'];
  const rows = pins.map((p) =>
    [p.title, p.mediaUrl, p.board, '', p.description, p.link, p.publishAt, KEYWORDS].map(csvCell).join(','),
  );
  writeFileSync(join(OUT_DATA, 'pins.csv'), `${[header.join(','), ...rows].join('\n')}\n`);

  console.log(`\n${pins.length} pins, ${pins[0].publishAt} → ${pins[pins.length - 1].publishAt} (UTC)`);
}

main();
