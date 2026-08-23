// Fetch real theft-from-the-person counts from police.uk for major UK city
// centres, latest 12 months vs prior 12 months. Prints JSON for use in
// src/pages/statistics.astro (cityComparison) and src/pages/[location].astro.

const CITIES = [
  { name: 'London (Westminster)', lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
  { name: 'Leeds', lat: 53.8008, lng: -1.5491 },
  { name: 'Liverpool', lat: 53.4084, lng: -2.9916 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchMonth(lat, lng, ym) {
  const url = `https://data.police.uk/api/crimes-street/theft-from-the-person?lat=${lat}&lng=${lng}&date=${ym}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ProtectMyMobile/1.0 (Theft Prevention Research)' } });
      if (res.status === 429) { await sleep(2000 * attempt); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    } catch (e) {
      if (attempt === 3) { console.error(`failed ${ym} ${lat},${lng}: ${e.message}`); return 0; }
      await sleep(1000 * attempt);
    }
  }
  return 0;
}

const lastUpdated = await (await fetch('https://data.police.uk/api/crime-last-updated')).json();
console.log('police.uk last updated:', lastUpdated.date);
const latestMonth = lastUpdated.date.slice(0, 7); // YYYY-MM

// Build last 24 months ending at latestMonth
const [ly, lm] = latestMonth.split('-').map(Number);
const months = [];
for (let i = 23; i >= 0; i--) {
  let y = ly, m = lm - i;
  while (m <= 0) { m += 12; y -= 1; }
  months.push(`${y}-${String(m).padStart(2, '0')}`);
}
const prior = months.slice(0, 12);
const latest = months.slice(12);

const results = [];
for (const city of CITIES) {
  let priorTotal = 0, latestTotal = 0;
  for (const ym of prior) { priorTotal += await fetchMonth(city.lat, city.lng, ym); await sleep(250); }
  for (const ym of latest) { latestTotal += await fetchMonth(city.lat, city.lng, ym); await sleep(250); }
  const change = priorTotal > 0 ? ((latestTotal - priorTotal) / priorTotal * 100).toFixed(1) : null;
  results.push({ city: city.name, priorPeriod: `${prior[0]}..${prior[11]}`, priorTotal, latestPeriod: `${latest[0]}..${latest[11]}`, latestTotal, changePct: change });
  console.log(city.name, 'prior:', priorTotal, 'latest:', latestTotal, 'change:', change + '%');
}

console.log('\nJSON:');
console.log(JSON.stringify(results, null, 2));
