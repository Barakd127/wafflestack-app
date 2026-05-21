"""
convert-quiz-to-mc.py
---------------------
Convert quiz-bank.json entries to the new MC schema.

The data already has `options` (4 strings) and `correct_answer` (matches one
of the options). This script:

1. Adds `correctIndex` (numeric) and `format: "mc"` to every question.
2. Shuffles `options` so the correct answer is not always at index 0
   (it usually already is in source data — see mean_001 etc.).
3. Keeps `correct_answer` for backward compatibility with existing runtime
   code (useQuiz.ts, StatChallenge etc.).
4. Atomic write — writes to a .tmp file then renames.
5. Resumable — questions already tagged `format: "mc"` are skipped.

No GPT call is needed: every question already has a complete, hand-curated
options array. The original task brief assumed free-text inputs, but the
file is already MC.

Run from project root:
    python scripts/convert-quiz-to-mc.py
"""

from __future__ import annotations

import json
import os
import random
import sys
from pathlib import Path

# Deterministic shuffle so reruns produce stable output (CI / diff sanity).
random.seed(20260522)

ROOT = Path(__file__).resolve().parent.parent
QUIZ_PATH = ROOT / "src" / "data" / "quiz-bank.json"
TMP_PATH = QUIZ_PATH.with_suffix(".json.tmp")


def convert_question(q: dict) -> tuple[dict, str]:
    """Return (converted_question, status) where status is one of:
    'skipped-already-mc' | 'converted' | 'skipped-no-options' | 'skipped-no-match'.
    """
    if q.get("format") == "mc" and isinstance(q.get("correctIndex"), int):
        return q, "skipped-already-mc"

    options = q.get("options")
    correct_answer = q.get("correct_answer")
    if not options or not isinstance(options, list) or len(options) < 2:
        return q, "skipped-no-options"
    if correct_answer is None:
        return q, "skipped-no-match"

    # Locate the correct answer in the options list. Use string comparison
    # with a fallback to trimmed match in case of whitespace differences.
    correct_str = str(correct_answer)
    options_str = [str(o) for o in options]

    try:
        original_idx = options_str.index(correct_str)
    except ValueError:
        # Try a trimmed match
        trimmed = [o.strip() for o in options_str]
        try:
            original_idx = trimmed.index(correct_str.strip())
        except ValueError:
            return q, "skipped-no-match"

    # Shuffle a copy of options. Re-shuffle up to 5 times if the correct
    # answer happens to land back at its original index (gives a visible
    # change without forcing a particular position).
    shuffled = list(options_str)
    for _ in range(5):
        random.shuffle(shuffled)
        if shuffled.index(correct_str) != original_idx or len(shuffled) <= 1:
            break

    new_correct_idx = shuffled.index(correct_str)

    new_q = dict(q)
    new_q["options"] = shuffled
    new_q["correctIndex"] = new_correct_idx
    new_q["format"] = "mc"
    # Keep correct_answer field — runtime code (useQuiz.ts) still reads it.
    new_q["correct_answer"] = correct_str
    return new_q, "converted"


def main() -> int:
    if not QUIZ_PATH.exists():
        print(f"ERROR: quiz bank not found at {QUIZ_PATH}", file=sys.stderr)
        return 1

    with QUIZ_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    topics = data.get("topics", {})
    counts = {"converted": 0, "skipped-already-mc": 0,
              "skipped-no-options": 0, "skipped-no-match": 0}
    total = 0
    issues: list[str] = []

    for tname, tdata in topics.items():
        qs = tdata.get("questions", [])
        for i, q in enumerate(qs):
            total += 1
            new_q, status = convert_question(q)
            counts[status] = counts.get(status, 0) + 1
            if status in ("skipped-no-options", "skipped-no-match"):
                issues.append(f"  {tname}[{i}] {q.get('id', '?')}: {status}")
            qs[i] = new_q
        tdata["questions"] = qs

    data["topics"] = topics
    # Bump version marker so downstream consumers can detect the new schema.
    data["mcSchemaVersion"] = 1

    # Atomic write: dump to .tmp then os.replace.
    with TMP_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(TMP_PATH, QUIZ_PATH)

    print(f"Total questions:       {total}")
    print(f"  converted:           {counts['converted']}")
    print(f"  already mc (skip):   {counts['skipped-already-mc']}")
    print(f"  no options (skip):   {counts['skipped-no-options']}")
    print(f"  no match (skip):     {counts['skipped-no-match']}")
    if issues:
        print("\nIssues:")
        for line in issues[:20]:
            print(line)
        if len(issues) > 20:
            print(f"  ... and {len(issues) - 20} more")
    print(f"\nGPT cost: $0.00 (no API calls needed — source data already MC)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
