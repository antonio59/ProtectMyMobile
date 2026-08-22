// Shared police.uk API helpers used by both the admin endpoint
// (src/pages/api/admin/fetch-police-uk.ts) and the backfill script
// (scripts/backfill-police-data.ts).

// UK major cities with coordinates.
export const UK_LOCATIONS = [
  // London Boroughs
  { name: 'Westminster', lat: 51.4975, lng: -0.1357 },
  { name: 'Camden', lat: 51.5290, lng: -0.1255 },
  { name: 'Southwark', lat: 51.5028, lng: -0.0877 },
  { name: 'Hackney', lat: 51.5450, lng: -0.0553 },
  { name: 'Newham', lat: 51.5255, lng: 0.0352 },
  { name: 'Lambeth', lat: 51.4571, lng: -0.1231 },
  { name: 'Tower Hamlets', lat: 51.5099, lng: -0.0059 },
  { name: 'Islington', lat: 51.5465, lng: -0.1058 },
  { name: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938 },
  { name: 'Haringey', lat: 51.6000, lng: -0.1119 },

  // Other UK Cities
  { name: 'Manchester City Centre', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham City Centre', lat: 52.4862, lng: -1.8904 },
  { name: 'Leeds City Centre', lat: 53.8008, lng: -1.5491 },
  { name: 'Glasgow City Centre', lat: 55.8642, lng: -4.2518 },
  { name: 'Liverpool City Centre', lat: 53.4084, lng: -2.9916 },
  { name: 'Bristol City Centre', lat: 51.4545, lng: -2.5879 },
  { name: 'Edinburgh City Centre', lat: 55.9533, lng: -3.1883 },
  { name: 'Sheffield City Centre', lat: 53.3811, lng: -1.4701 },
  { name: 'Cardiff City Centre', lat: 51.4816, lng: -3.1791 },
  { name: 'Newcastle City Centre', lat: 54.9783, lng: -1.6178 },
  { name: 'Nottingham City Centre', lat: 52.9548, lng: -1.1581 },
  { name: 'Belfast City Centre', lat: 54.5973, lng: -5.9301 },
  { name: 'Southampton City Centre', lat: 50.9097, lng: -1.4044 },
  { name: 'Brighton City Centre', lat: 50.8225, lng: -0.1372 },
];

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch one month of theft-from-the-person crimes for a coordinate, with
 * retry/backoff on 429 and transient errors. Returns [] on persistent failure.
 */
export async function fetchPoliceUKData(
  lat: number,
  lng: number,
  yearMonth: string,
  retries = 3,
  log: (msg: string) => void = (m) => console.log(m),
): Promise<any[]> {
  const url = `https://data.police.uk/api/crimes-street/theft-from-the-person?lat=${lat}&lng=${lng}&date=${yearMonth}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ProtectMyMobile/1.0 (Theft Prevention Research)' },
      });
      if (response.status === 429) {
        const delay = 2000 * attempt;
        log(`  Rate limit ${yearMonth} @ ${lat},${lng}, waiting ${delay}ms (attempt ${attempt})`);
        await sleep(delay);
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (attempt === retries) {
        console.error(`  Failed ${yearMonth} @ ${lat},${lng}:`, error.message);
        return [];
      }
      await sleep(1000 * attempt);
    }
  }
  return [];
}

/** Inclusive list of YYYY-MM strings from startMonth to endMonth. */
export function generateMonthRange(startMonth: string, endMonth: string): string[] {
  const months: string[] = [];
  const [startYear, startMo] = startMonth.split('-').map(Number);
  const [endYear, endMo] = endMonth.split('-').map(Number);
  let currentYear = startYear;
  let currentMonth = startMo;
  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMo)) {
    months.push(`${currentYear}-${String(currentMonth).padStart(2, '0')}`);
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  return months;
}
