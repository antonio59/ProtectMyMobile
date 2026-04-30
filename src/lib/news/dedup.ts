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
  }
  return false;
}
