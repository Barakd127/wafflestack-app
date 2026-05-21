#!/usr/bin/env bash
# proactive-stop-guard.sh
# Run at the START of every proactive-vision-builder cycle.
# Exits 1 (STOP) if ≥5 proactive/ commits in the last 6 hours.
# Exits 0 (PROCEED) otherwise, and prints the next cycle number.
#
# Fix for the broken STOP GUARD: fetch remotes BEFORE counting,
# so fresh cloud containers see commits from previous sessions.

set -euo pipefail

# 1. Fetch all remote branches so git log sees previous proactive/ commits
git fetch origin --quiet 2>/dev/null || true

# 2. Count proactive/ commits in the last 6 hours across all branches
COUNT=$(git log --all --oneline --since="6 hours ago" | grep -c "proactive/" || true)

if [ "$COUNT" -ge 5 ]; then
  echo "STOP: $COUNT proactive/ cycles detected in last 6 hours (limit: 5). Exiting."
  exit 1
fi

# 3. Read cycle state from repo-tracked JSON
STATE_FILE="AI/proactive-cycle-state.json"
if [ -f "$STATE_FILE" ]; then
  CURRENT_CYCLE=$(python3 -c "import json,sys; d=json.load(open('$STATE_FILE')); print(d.get('currentCycle',1))" 2>/dev/null || echo "1")
  PHASE=$(python3 -c "import json,sys; d=json.load(open('$STATE_FILE')); print(d.get('phase','exploration'))" 2>/dev/null || echo "exploration")
  FAILURES=$(python3 -c "import json,sys; d=json.load(open('$STATE_FILE')); print(d.get('consecutiveBuildFailures',0))" 2>/dev/null || echo "0")
else
  CURRENT_CYCLE=1
  PHASE="exploration"
  FAILURES=0
fi

# 4. Check hard stop conditions
if [ "$CURRENT_CYCLE" -gt 10 ]; then
  echo "STOP: 10 cycles complete. Proactive builder done."
  exit 1
fi

if [ "$FAILURES" -ge 3 ]; then
  echo "STOP: 3 consecutive build failures. Human review needed."
  exit 1
fi

echo "PROCEED: cycle=$CURRENT_CYCLE phase=$PHASE failures=$FAILURES recent_commits=$COUNT"
exit 0
