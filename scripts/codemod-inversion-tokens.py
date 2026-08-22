"""Codemod: replace inversion-unsafe literal classes with semantic tokens.

Order matters: compound surface+text patterns first, then standalone whites.
Only touches src/**/*.{astro,tsx,ts}. Prints a per-file change count.
"""
import re
from pathlib import Path

ROOT = Path("src")

# (pattern, replacement) — applied in order, plain string replacement
RULES = [
    # Compound: inverting surface paired with literal white text
    ("bg-primary text-white", "bg-primary text-primary-foreground"),
    ("bg-destructive/50 text-white", "bg-destructive/50 text-destructive-foreground"),
    ("bg-destructive text-white", "bg-destructive text-destructive-foreground"),
    ("bg-emergency text-white", "bg-emergency text-emergency-foreground"),
    ("bg-foreground text-white", "bg-foreground text-background"),
    # classList JS pairs (banks.astro, news.astro)
    ("'bg-primary', 'text-white'", "'bg-primary', 'text-primary-foreground'"),
    ('"bg-primary", "text-white"', '"bg-primary", "text-primary-foreground"'),
    # White opacity utilities inside inverted sections
    ("bg-white/90", "bg-card/90"),
    ("bg-white/80", "bg-card/80"),
    ("bg-white/70", "bg-card/70"),
    ("bg-white/30", "bg-background/30"),
    ("bg-white/20", "bg-background/20"),
    ("bg-white/10", "bg-background/10"),
    ("border-white/20", "border-background/20"),
    ("border-white/10", "border-background/10"),
    ("divide-white/20", "divide-background/20"),
    ("hover:bg-white/30", "hover:bg-background/30"),
    # Bare bg-white surfaces
    ("hover:bg-white", "hover:bg-card"),
]

BARE_BG_WHITE = re.compile(r"\bbg-white\b")
BARE_TEXT_WHITE = re.compile(r"\btext-white\b")

changed_files = {}
for path in sorted(ROOT.rglob("*")):
    if path.suffix not in (".astro", ".tsx", ".ts"):
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in RULES:
        text = text.replace(old, new)
    # Bare bg-white (no opacity suffix left after rules above) -> bg-card
    text = BARE_BG_WHITE.sub("bg-card", text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        n = sum(1 for a, b in zip(original.splitlines(), text.splitlines()) if a != b)
        changed_files[str(path)] = n

for f, n in changed_files.items():
    print(f"{n:4d}  {f}")
print(f"\n{len(changed_files)} files changed")

# Report remaining bare text-white occurrences for manual review
print("\n--- Remaining text-white (manual review) ---")
for path in sorted(ROOT.rglob("*")):
    if path.suffix not in (".astro", ".tsx", ".ts"):
        continue
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if BARE_TEXT_WHITE.search(line):
            print(f"{path}:{i}: {line.strip()[:120]}")
