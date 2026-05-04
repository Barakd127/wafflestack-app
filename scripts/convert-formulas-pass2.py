#!/usr/bin/env python3
"""
Second-pass formula refinements after the first conversion. Targets:
  • Unicode minus (U+2212) → ASCII hyphen for KaTeX compatibility
  • Hebrew text inside formulas → \text{...} so KaTeX doesn't try to parse
    it as math identifiers
  • Trailing "/ n" or "/ \sum f_i" patterns → \frac{...}{...}
  • Cleanup of double spaces / weird whitespace introduced by greek subs
"""
import re
import sys
from pathlib import Path

SRC = Path("src/data/lesson-content.ts")

# Hebrew character range — anything in this set inside a formula needs \text{}
HEBREW_RE = re.compile(r"([֐-׿][֐-׿'׳ ]*)")


def wrap_hebrew(s: str) -> str:
    """Wrap any Hebrew word/phrase in \\text{} so KaTeX renders it as text."""
    return HEBREW_RE.sub(lambda m: r"\text{" + m.group(1).strip() + r"}", s)


def normalize(s: str) -> str:
    s = s.replace("−", "-")  # unicode minus → ASCII hyphen
    s = s.replace(" ", " ")  # nbsp → regular space
    s = re.sub(r"\s{2,}", " ", s)
    s = s.strip()
    return s


def slash_n_to_frac(s: str) -> str:
    """Convert ' / n' (or ' / X') trailing pattern to \\frac form when the
    numerator is a clear sum/expression and the denominator is a simple token."""
    # Pattern: "<lots of stuff> / <simpleToken>" at end of expression
    # Conservative: only if there's no \frac already and the slash is preceded
    # by a closing bracket/paren OR \sum followed by stuff.
    # Match: "(EXPR) / TOK" where EXPR ends in ) or ] or ends with simple math.
    out = s
    # "[...] / TOK"
    out = re.sub(
        r"\[([^\[\]]+)\]\s*/\s*([A-Za-z0-9_^{}]+)",
        lambda m: r"\frac{" + m.group(1).strip() + r"}{" + m.group(2).strip() + r"}",
        out,
    )
    return out


FORMULA_LINE = re.compile(r"^(\s*formula:\s*)'([^']*)'(.*)$")


def transform(latex: str) -> str:
    out = latex
    out = normalize(out)
    out = slash_n_to_frac(out)
    out = wrap_hebrew(out)
    return out


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    lines = text.splitlines()
    changed = 0
    for i, line in enumerate(lines):
        m = FORMULA_LINE.match(line)
        if not m:
            continue
        prefix, latex, suffix = m.groups()
        new_latex = transform(latex)
        if new_latex != latex:
            lines[i] = f"{prefix}'{new_latex}'{suffix}"
            changed += 1
    SRC.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Refined {changed} formula lines.")


if __name__ == "__main__":
    main()
