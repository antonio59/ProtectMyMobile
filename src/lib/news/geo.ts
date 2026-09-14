const UK_SIGNALS = [
  "united kingdom",
  "northern ireland",
  "met police",
  "metropolitan police",
  "evening standard",
  "my london",
  "mylondon",
  "oxford street",
  "covent garden",
  "britain",
  "british",
  "england",
  "scotland",
  "wales",
  "london",
  "westminster",
  "camden",
  "shoreditch",
  "soho",
  "brixton",
  "clapham",
  "hackney",
  "islington",
  "piccadilly",
  "kensington",
  "chelsea",
  "manchester",
  "birmingham",
  "liverpool",
  "glasgow",
  "edinburgh",
  "bristol",
  "leeds",
  "sheffield",
  "u.k.",
  "uk",
];

const FOREIGN_SIGNALS = [
  "kakinada",
  "mumbai",
  "delhi",
  "hyderabad",
  "nairobi",
  "bangladesh",
  "philippines",
  "australia",
  "sydney",
  "melbourne",
  "united states",
  "new york",
  "california",
  "los angeles",
  "toronto",
  "south africa",
  "india",
  "indian",
  "nigeria",
  "kenya",
  "pakistan",
  "canada",
  "brazil",
];

const JUNK_EXCERPT = [
  '{"@context"',
  "this content is provided by",
  "exco player",
  "allow and continue",
  "may use cookies or similar",
];

function hasSignal(blob: string, signal: string): boolean {
  if (signal.includes(" ") || signal.includes(".")) {
    return blob.includes(signal);
  }
  const escaped = signal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(blob);
}

export function sanitizeNewsExcerpt(excerpt: string | undefined, fallback = ""): string {
  if (!excerpt) return fallback;
  let text = excerpt.replace(/\{"@context"[\s\S]*/, "").trim();
  const lower = text.toLowerCase();
  if (JUNK_EXCERPT.some((s) => lower.includes(s))) {
    return fallback;
  }
  return text;
}

export function isUkPhoneTheftStory(input: {
  title: string;
  excerpt?: string;
  sourceUrl?: string;
  sourceName?: string;
}): boolean {
  const blob = [
    input.title,
    input.excerpt ?? "",
    input.sourceUrl ?? "",
    input.sourceName ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (FOREIGN_SIGNALS.some((s) => hasSignal(blob, s))) return false;
  if (JUNK_EXCERPT.some((s) => blob.includes(s))) return false;
  return UK_SIGNALS.some((s) => hasSignal(blob, s));
}
