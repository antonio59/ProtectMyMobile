export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\|[^|]*$/, "")
    .replace(/-[^-]*(?:news|bbc|sky|guardian|standard|metro|mail|telegraph|mirror|itv)[^-]*$/, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Words that carry no disambiguating signal in theft-news headlines.
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for",
  "with", "as", "is", "are", "was", "were", "be", "been", "by", "from", "that",
  "this", "it", "its", "after", "into", "over", "amid", "near", "my", "your",
  "his", "her", "their", "out", "up", "off", "has", "have", "had",
]);

// Publisher names frequently appended to RSS headlines, e.g. " - Daily Star",
// " | BBC News". Dropped before tokenising so the outlet name doesn't skew the
// comparison. Only the final short segment after a separator is treated as the
// source — long trailing clauses (real content) are left intact.
const SOURCE_SUFFIX = /\s+[-|–—]\s+[^-|–—]{1,40}$/;

// Tuning: a pair counts as the same story when they share enough significant
// words. MIN_SHARED_TOKENS guards against two short generic headlines colliding.
const SIMILARITY_THRESHOLD = 0.6;
const CONTAINMENT_THRESHOLD = 0.8;
const MIN_SHARED_TOKENS = 4;

function tokenizeTitle(title: string): Set<string> {
  const tokens = title
    .replace(SOURCE_SUFFIX, "")
    .toLowerCase()
    .replace(/['’]s\b/g, "") // drop possessive 's -> star's => star
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  return new Set(tokens);
}

/**
 * True when two headlines describe the same underlying story even if reworded
 * or reordered across outlets. Uses Jaccard similarity over significant tokens,
 * with a containment fallback so a short headline fully contained in a longer
 * one still matches.
 */
function titlesAreSimilar(a: string, b: string): boolean {
  const tokensA = tokenizeTitle(a);
  const tokensB = tokenizeTitle(b);
  if (tokensA.size === 0 || tokensB.size === 0) return false;

  let shared = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) shared++;
  }
  if (shared < MIN_SHARED_TOKENS) return false;

  const union = tokensA.size + tokensB.size - shared;
  const jaccard = union === 0 ? 0 : shared / union;
  const containment = shared / Math.min(tokensA.size, tokensB.size);

  return jaccard >= SIMILARITY_THRESHOLD || containment >= CONTAINMENT_THRESHOLD;
}

export function isDuplicateTitle(title: string, existingTitles: string[]): boolean {
  const normalized = normalizeTitle(title);
  if (!normalized || normalized.length < 10) return false;

  for (const existing of existingTitles) {
    const existingNormalized = normalizeTitle(existing);
    if (!existingNormalized) continue;
    if (normalized === existingNormalized) return true;
    if (
      normalized.length > 20 &&
      existingNormalized.length > 20 &&
      (normalized.includes(existingNormalized) || existingNormalized.includes(normalized))
    ) {
      return true;
    }
    // Catch same-story rewrites from different outlets (reordered/reworded).
    if (titlesAreSimilar(title, existing)) return true;
  }
  return false;
}
