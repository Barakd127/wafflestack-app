#!/usr/bin/env python3
"""
Fix the silent JS escape-stripping bug.

Single-backslash sequences like \\cdot in single-quoted TS strings get
silently stripped by JS at parse time — the runtime string ends up as
'cdot' not '\\cdot'. KaTeX then renders 'ncdot(n-1)cdot...' instead of
'n \\cdot (n-1) \\cdot ...' with proper dots.

Fix: every single-backslash before an alphabetic character becomes
double-backslash. The TS source then evaluates to a single backslash
at runtime, which is what KaTeX expects.

Idempotent: \\\\X stays \\\\X. Only \\X (where X is alphabetic and
NOT preceded by another \\) gets doubled.
"""
import re
from pathlib import Path

SRC = Path("src/data/lesson-content.ts")

FORMULA_LINE = re.compile(r"^(\s*formula:\s*)'([^']*)'(.*)$")

# Match a single-backslash followed by a letter, NOT preceded by another \
# Use negative lookbehind to skip already-escaped sequences.
SINGLE_BACKSLASH = re.compile(r"(?<!\\)\\([A-Za-z{])")


def fix(latex: str) -> str:
    return SINGLE_BACKSLASH.sub(r"\\\\\1", latex)


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    lines = text.splitlines()
    fixed = 0
    for i, line in enumerate(lines):
        m = FORMULA_LINE.match(line)
        if not m:
            continue
        prefix, latex, suffix = m.groups()
        new = fix(latex)
        if new != latex:
            lines[i] = f"{prefix}'{new}'{suffix}"
            fixed += 1
    SRC.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Fixed {fixed} formula lines (escaped single \\ → \\\\).")


if __name__ == "__main__":
    main()
