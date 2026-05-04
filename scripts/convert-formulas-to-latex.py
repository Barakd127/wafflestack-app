#!/usr/bin/env python3
"""
Convert pseudo-Unicode-math formula strings inside lesson-content.ts to proper
LaTeX so KaTeX can render them with real fraction bars, sub/super-scripts and
Greek letters. Idempotent — running twice is a no-op (the input no longer
contains the legacy unicode markers after the first pass).

This is a one-off pass for the 79 `formula: '...'` strings; safer to do it
mechanically with a script than 79 Edit calls.
"""
import re
import sys
from pathlib import Path

SRC = Path("src/data/lesson-content.ts")

# ── Unicode → LaTeX direct substitutions ─────────────────────────────────────
SUBS = [
    # Greek letters
    ("μ", r"\mu "),
    ("σ", r"\sigma "),
    ("Σ", r"\sum "),
    ("α", r"\alpha "),
    ("β", r"\beta "),
    ("χ", r"\chi "),
    ("Φ", r"\Phi "),
    ("φ", r"\varphi "),
    ("π", r"\pi "),
    ("ρ", r"\rho "),
    ("θ", r"\theta "),
    ("Ω", r"\Omega "),
    # Math operators
    ("≤", r"\le "),
    ("≥", r"\ge "),
    ("≠", r"\ne "),
    ("±", r"\pm "),
    ("·", r"\cdot "),
    ("→", r"\to "),
    ("⟹", r"\Rightarrow "),
    ("⟺", r"\iff "),
    ("∈", r"\in "),
    ("∪", r"\cup "),
    ("∩", r"\cap "),
    ("∅", r"\emptyset "),
    ("∞", r"\infty "),
    # Subscript/superscript Unicode → LaTeX
    ("²", r"^2"),
    ("³", r"^3"),
    ("ᵢ", r"_i"),
    ("ⱼ", r"_j"),
    ("ₖ", r"_k"),
    ("ₙ", r"_n"),
    ("ₐ", r"_a"),
    ("ᵧ", r"_y"),
    ("ₓ", r"_x"),
    ("₀", r"_0"),
    ("₁", r"_1"),
    ("₂", r"_2"),
    ("₃", r"_3"),
    ("₄", r"_4"),
    ("₅", r"_5"),
    # Bars (overline)
    ("x̄", r"\bar{x}"),
    ("ȳ", r"\bar{y}"),
    ("X̄", r"\bar{X}"),
    ("Ȳ", r"\bar{Y}"),
    # Caps
    ("p̂", r"\hat{p}"),
    ("Ŷ", r"\hat{Y}"),
    ("Ŷᵢ", r"\hat{Y}_i"),
]


def apply_subs(s: str) -> str:
    for src, dst in SUBS:
        s = s.replace(src, dst)
    return s


# ── Convert "A / B" patterns to \frac{A}{B} ──────────────────────────────────
# Only replace simple top-level cases. Conservative — leave nested / alone.
# Strategy: find pattern "(...) / (...)", or "X / Y" where X,Y are simple
# identifiers/expressions without parentheses.
FRAC_PATTERNS = [
    # "(...) / (...)": fully parenthesized numerator and denominator
    (
        re.compile(r"\(([^()]+)\)\s*/\s*\(([^()]+)\)"),
        lambda m: r"\frac{" + m.group(1).strip() + r"}{" + m.group(2).strip() + r"}",
    ),
    # "(...) / X" — parenthesised numerator, simple denominator
    (
        re.compile(r"\(([^()]+)\)\s*/\s*([A-Za-z0-9_^{}+\-]+)"),
        lambda m: r"\frac{" + m.group(1).strip() + r"}{" + m.group(2).strip() + r"}",
    ),
    # "X / (...)" — simple numerator, parenthesised denominator
    (
        re.compile(r"([A-Za-z0-9_^{}+\-]+)\s*/\s*\(([^()]+)\)"),
        lambda m: r"\frac{" + m.group(1).strip() + r"}{" + m.group(2).strip() + r"}",
    ),
    # "X / Y" — both simple (only when surrounded by whitespace/equals)
    # Be careful: this might catch things like "n/2" we don't want to change.
    # Limit to "= X/Y" or "= X / Y" patterns.
    (
        re.compile(r"=\s*([A-Za-z0-9_^{}]+)\s*/\s*([A-Za-z0-9_^{}]+)(?=\s|$|;)"),
        lambda m: r"= \frac{" + m.group(1).strip() + r"}{" + m.group(2).strip() + r"}",
    ),
]


def apply_fracs(s: str) -> str:
    for pat, repl in FRAC_PATTERNS:
        s = pat.sub(repl, s)
    return s


# ── Sqrt: √(X) → \sqrt{X} ─────────────────────────────────────────────────────
SQRT_PATTERNS = [
    (re.compile(r"√\(([^()]+)\)"), lambda m: r"\sqrt{" + m.group(1).strip() + r"}"),
    (re.compile(r"√\[([^\[\]]+)\]"), lambda m: r"\sqrt{" + m.group(1).strip() + r"}"),
    # √word — single-token sqrt
    (re.compile(r"√([A-Za-z0-9_^{}]+)"), lambda m: r"\sqrt{" + m.group(1).strip() + r"}"),
]


def apply_sqrt(s: str) -> str:
    for pat, repl in SQRT_PATTERNS:
        s = pat.sub(repl, s)
    return s


# ── Per-formula transformer ──────────────────────────────────────────────────
def transform_formula(latex: str) -> str:
    """Apply all transformations to a single formula string."""
    # Order matters: sqrt before frac before subs (so √(...)=>\sqrt{...} happens
    # before the / inside gets touched).
    out = latex
    out = apply_sqrt(out)
    out = apply_fracs(out)
    out = apply_subs(out)
    # Cleanup: collapse double spaces from greek-letter substitutions
    out = re.sub(r"\s{2,}", " ", out)
    out = out.strip()
    return out


# ── Main: walk the file, transform each formula: '...' line ──────────────────
FORMULA_LINE = re.compile(r"^(\s*formula:\s*)'([^']*)'(.*)$")


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    converted = 0
    for i, line in enumerate(lines):
        m = FORMULA_LINE.match(line)
        if not m:
            continue
        prefix, latex, suffix = m.groups()
        new_latex = transform_formula(latex)
        if new_latex != latex:
            lines[i] = f"{prefix}'{new_latex}'{suffix}\n" if line.endswith("\n") else f"{prefix}'{new_latex}'{suffix}"
            converted += 1
    SRC.write_text("".join(lines), encoding="utf-8")
    print(f"Converted {converted}/{sum(1 for l in lines if FORMULA_LINE.match(l))} formula lines.")


if __name__ == "__main__":
    main()
