"""Codemod: tighten oversized button padding.

Buttons scaled padding at every breakpoint while font size barely grew,
producing bloated CTAs on desktop. Collapse the breakpoint ladders so
padding grows at most one step. Touch targets stay >=44px via the
.touch-target class or remaining py scale.
"""
from pathlib import Path

ROOT = Path("src")

RULES = [
    # Homepage hero CTAs
    ("px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base",
     "px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"),
    # Homepage ghost CTA
    ("px-6 md:px-8 py-3 md:py-4 text-sm sm:text-base",
     "px-6 py-3 text-sm sm:text-base"),
    # Homepage section CTAs (visitor safety / emergency)
    ("px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4",
     "px-4 sm:px-5 py-2.5 sm:py-3"),
    # Homepage bottom CTA
    ("px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4",
     "px-5 sm:px-6 py-2.5 sm:py-3"),
    # Standard page CTAs (products, the-problem, 404)
    ("px-4 sm:px-6 py-2.5 sm:py-3",
     "px-4 sm:px-5 py-2.5"),
]

changed = {}
for path in sorted(ROOT.rglob("*")):
    if path.suffix not in (".astro", ".tsx", ".ts"):
        continue
    text = original = path.read_text(encoding="utf-8")
    for old, new in RULES:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")
        changed[str(path)] = sum(
            1 for a, b in zip(original.splitlines(), text.splitlines()) if a != b
        )

for f, n in changed.items():
    print(f"{n:4d}  {f}")
print(f"\n{len(changed)} files changed")
