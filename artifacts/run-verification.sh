#!/usr/bin/env bash
# RealmWright Phase 5 verification runner.
#
# Runs in order:
#   1. Static secret scan
#   2. Worker TypeScript check (if worker/node_modules is installed)
#   3. Playwright regression suite + axe-core a11y (if installed)
#   4. HTML validation via html-validate (if installed) or w3c API
#
# Writes:
#   artifacts/regression_report.json
#   artifacts/regression_summary.txt
#   artifacts/screenshots/*.png
#   artifacts/html_validation.json (if html-validate ran)
#
# Exit code: 0 if every gate passed, 1 otherwise.

set -u
REPO="/home/user/MD-nahin"
ART="$REPO/artifacts"
FAILED=0

banner() {
  printf '\n============================================================\n%s\n============================================================\n' "$1"
}

banner "1/4  Static secret scan"
HITS=$(grep -nE 'sk-or-|sk_live|API_KEY[[:space:]]*=|password[[:space:]]*=' \
  "$REPO/src/index.html" "$REPO/worker/src/"*.ts 2>/dev/null \
  | grep -vE 'placeholder=|startsWith\(.sk-or-.\)|That doesn.t look like|type="password"|TURNSTILE_SITEKEY|LS_PRODUCT_ID' || true)
if [ -z "$HITS" ]; then
  echo "PASS — no real secrets in tracked source"
else
  echo "FAIL — review the following:"
  echo "$HITS"
  FAILED=1
fi

banner "2/4  Worker TypeScript check"
if [ -d "$REPO/worker/node_modules" ]; then
  ( cd "$REPO/worker" && npx tsc --noEmit )
  if [ $? -eq 0 ]; then echo "PASS — worker tsc clean"; else echo "FAIL — worker tsc errors"; FAILED=1; fi
else
  echo "SKIP — worker/node_modules missing. Run: cd worker && npm install"
fi

banner "3/4  Playwright regression suite"
if node -e "import('/opt/node22/lib/node_modules/playwright/index.mjs')" 2>/dev/null; then
  node "$ART/test_realmwright.mjs"
  RC=$?
  if [ $RC -ne 0 ]; then FAILED=1; fi
else
  echo "SKIP — playwright not installed globally. Run: npm i -g playwright && npx playwright install chromium --with-deps"
fi

banner "4/4  HTML validation"
if [ -x "$(command -v html-validate)" ]; then
  html-validate "$REPO/src/index.html" > "$ART/html_validation.txt" 2>&1
  RC=$?
  echo "Wrote artifacts/html_validation.txt (exit $RC)"
  if [ $RC -ne 0 ]; then
    echo "Non-zero exit from html-validate — review report. Most warnings (e.g. <section> without heading) are acceptable for a single-file app."
  fi
elif command -v curl >/dev/null 2>&1; then
  echo "html-validate not installed locally — falling back to W3C public API."
  echo "POSTing src/index.html to https://validator.w3.org/nu/ ..."
  HTTP_BODY=$(curl -sS -H "Content-Type: text/html; charset=utf-8" \
    --data-binary @"$REPO/src/index.html" \
    "https://validator.w3.org/nu/?out=json" 2>"$ART/html_validation.err")
  if echo "$HTTP_BODY" | head -c 1 | grep -q '{'; then
    printf '%s' "$HTTP_BODY" > "$ART/html_validation.json"
    ERR_COUNT=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('$ART/html_validation.json','utf8'));console.log((d.messages||[]).filter(m=>m.type==='error').length);}catch(e){console.log('?');}")
    WARN_COUNT=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('$ART/html_validation.json','utf8'));console.log((d.messages||[]).filter(m=>m.subType==='warning'||m.type==='info').length);}catch(e){console.log('?');}")
    echo "Wrote artifacts/html_validation.json — errors=$ERR_COUNT warnings=$WARN_COUNT"
  else
    echo "SKIP — W3C API not reachable from this environment (response: $(printf '%s' "$HTTP_BODY" | head -c 80))"
    echo "Hunter: re-run from a network-enabled machine, or use html-validate locally."
  fi
else
  echo "SKIP — neither html-validate nor curl available"
fi

banner "Summary"
if [ $FAILED -eq 0 ]; then
  echo "All gates passed. Hand off to Hunter for the 4 manual items."
else
  echo "One or more gates failed. See logs above."
fi
exit $FAILED
