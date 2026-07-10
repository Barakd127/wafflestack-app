#!/usr/bin/env bash
#
# Lock down `master` on Barakd127/wafflestack-app so it can only change via an
# approved Pull Request. This is the single most important step — `master` ships
# straight to production (Vercel + GitHub Pages), so without this, any push goes live.
#
# Requires: gh CLI, authenticated as a repo admin (Barak).  Run from the repo root:
#     bash scripts/setup-branch-protection.sh
#
# Run this AFTER this PR (which adds .github/CODEOWNERS) is merged to master, so the
# "require code owner reviews" rule has an owner to point at.
#
set -euo pipefail

REPO="Barakd127/wafflestack-app"
BRANCH="master"

echo "Applying branch protection to ${REPO}@${BRANCH} ..."

gh api --method PUT "repos/${REPO}/branches/${BRANCH}/protection" --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

echo ""
echo "Done. master now requires a Pull Request with 1 approving code-owner review before merge."
echo "Force-pushes and branch deletion are blocked."
echo ""
echo "Note: enforce_admins is false — Barak keeps an emergency direct-push escape hatch."
echo "Collaborators like Shirley (Write, non-admin) are fully gated."
echo "Set \"enforce_admins\": true and re-run to bind the gate to everyone, including admins."
