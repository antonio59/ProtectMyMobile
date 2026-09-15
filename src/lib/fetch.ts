// Remote-sourced responses (RSS feeds, scraped pages, CSVs) are
// attacker-influenceable — a hostile origin could stream an unbounded body
// and exhaust Worker memory. Always read through this cap.
const DEFAULT_MAX_BYTES = 1_000_000; // 1 MB covers articles and RSS feeds

export async function readBodyCapped(
  response: Response,
  maxBytes = DEFAULT_MAX_BYTES,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return (await response.text()).slice(0, maxBytes);
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    while (received < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}
