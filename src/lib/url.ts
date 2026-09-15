// Feed/database-derived URLs are attacker-influenceable: only allow
// http(s) so javascript:/data: links can never reach rendered hrefs.
export function safeExternalUrl(value: unknown): string | null {
  try {
    const url = new URL(String(value ?? ''));
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}
