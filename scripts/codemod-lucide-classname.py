#!/usr/bin/env python3
"""Codemod: in .astro files, lucide-react components must receive className
(React prop), not class (which React drops). Rewrites class= -> className=
only inside tags of components imported from 'lucide-react'."""
import re, glob, sys

changed_files = 0
total = 0
for f in glob.glob('src/**/*.astro', recursive=True):
    s = open(f).read()
    imp = re.findall(r'import \{([^}]*)\} from ["\']lucide-react["\']', s)
    if not imp:
        continue
    names = set()
    for g in imp:
        for n in g.split(','):
            n = n.strip().split(' as ')[-1].strip()
            if n:
                names.add(n)
    if not names:
        continue
    pattern = re.compile(r'<(' + '|'.join(sorted(names, key=len, reverse=True)) + r')\b[^>]*?/?>', re.DOTALL)
    def fix(m):
        global total
        tag = m.group(0)
        n = len(re.findall(r'\bclass=', tag))
        if not n:
            return tag
        total += n
        return re.sub(r'\bclass=', 'className=', tag)
    out = pattern.sub(fix, s)
    if out != s:
        open(f, 'w').write(out)
        changed_files += 1
        print(f)
print(f"rewrote {total} class props in {changed_files} files")
