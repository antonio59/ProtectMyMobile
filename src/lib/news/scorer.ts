import type { RelevanceResult } from "./types";

const IRRELEVANT_KEYWORDS = [
  "car", "vehicle", "motorbike", "motorcycle", "bicycle", "van", "truck", "lorry",
];

const HIGHLY_RELEVANT_KEYWORDS = [
  "phone theft", "mobile phone theft", "smartphone theft", "phone stolen",
  "mobile stolen", "stolen phones", "stolen mobile", "stolen smartphone",
  "iphone theft", "iphone stolen", "phone snatched", "mobile snatched",
  "phones seized", "mobile seized", "phone raid", "phones recovered",
  "pick-pocket", "pickpocket", "moped gang", "phone grab", "mobile grab",
];

const RELEVANT_KEYWORDS = [
  "phone", "mobile", "smartphone", "iphone", "android", "samsung", "device",
  "handset", "snatch", "snatched", "grab", "grabbed", "seized", "seize",
  "recovered", "recovery", "raid", "arrested", "arrest", "e-bike", "theft",
  "stolen", "robbed", "robbery",
];

const LOCATION_KEYWORDS = [
  "london", "westminster", "camden", "shoreditch", "soho", "brixton",
  "clapham", "hackney", "islington", "tube", "underground", "bus",
  "oxford street", "piccadilly", "covent garden", "southbank", "kensington",
  "chelsea", "manchester", "birmingham", "liverpool", "glasgow", "edinburgh",
  "bristol", "leeds", "sheffield",
];

interface ScoringRule {
  name: string;
  maxPoints: number;
  perMatch: number;
  keywords: string[];
}

const SCORING_RULES: ScoringRule[] = [
  {
    name: "High relevance",
    maxPoints: 60,
    perMatch: 30,
    keywords: HIGHLY_RELEVANT_KEYWORDS,
  },
  {
    name: "Regular relevance",
    maxPoints: 40,
    perMatch: 10,
    keywords: RELEVANT_KEYWORDS,
  },
];

export function calculateRelevanceScore(
  title: string,
  snippet: string,
): RelevanceResult {
  const text = (title + " " + snippet).toLowerCase();
  const reasons: string[] = [];

  if (IRRELEVANT_KEYWORDS.some((k) => text.includes(k))) {
    return {
      score: 0,
      shouldImport: false,
      reason: "Contains irrelevant vehicle keywords",
    };
  }

  let score = 0;

  for (const rule of SCORING_RULES) {
    let matches = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        matches++;
        reasons.push(`${rule.name}: "${keyword}"`);
      }
    }
    score += Math.min(matches * rule.perMatch, rule.maxPoints);
  }

  const locationMatches = LOCATION_KEYWORDS.filter((loc) =>
    text.includes(loc),
  );
  if (locationMatches.length > 0) {
    score += 15;
    reasons.push(`Location: "${locationMatches[0]}"`);
  }

  const titleLower = title.toLowerCase();
  const hasPhoneTerm =
    titleLower.includes("phone") || titleLower.includes("mobile");
  const hasCrimeTerm =
    ["theft", "stolen", "snatch", "rob", "seized", "recovered", "raid", "arrested"].some(
      (t) => titleLower.includes(t),
    );
  if (hasPhoneTerm && hasCrimeTerm) {
    score += 15;
    reasons.push("Phone crime in title");
  }

  score = Math.min(score, 100);
  const shouldImport = score >= 45;
  return {
    score,
    shouldImport,
    reason: reasons.length > 0 ? reasons.join(", ") : "Low relevance",
  };
}
