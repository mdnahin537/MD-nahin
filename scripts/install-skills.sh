#!/usr/bin/env bash
# install-skills.sh — makes Hunter's skills present in every Claude Code session.
#
# WHY this exists: Claude Code on the web runs in an ephemeral container that is
# wiped between sessions. The git repo is the only thing that survives. So this
# script — committed to the repo — re-installs the skills at the start of every
# session by cloning gStack and linking its skills into ~/.claude/skills/.
#
# Safe to run repeatedly. Skips work already done. Never fails the session.

set -uo pipefail   # NOT -e: a session must never die because setup hiccuped

SKILLS_DIR="$HOME/.claude/skills"
GSTACK_DIR="$SKILLS_DIR/gstack"
GSTACK_REPO="https://github.com/garrytan/gstack.git"

mkdir -p "$SKILLS_DIR"

# Resolve the vendored-skills dir as an ABSOLUTE path NOW, before any `cd` below
# changes the working directory. (Step 2 cd's into the gStack clone — if we waited
# until Step 6 to resolve a relative path, it would resolve against the wrong dir
# and the vendored skills would silently go missing. That exact bug cost an hour.)
VENDOR=""
_sp="${BASH_SOURCE[0]:-}"
if [ -n "$_sp" ] && [ -f "$_sp" ]; then
  _sd="$(cd "$(dirname "$_sp")" && pwd)"
  [ -d "$(dirname "$_sd")/vendor/skills" ] && VENDOR="$(dirname "$_sd")/vendor/skills"
fi
if [ -z "$VENDOR" ] && [ -n "${CLAUDE_PROJECT_DIR:-}" ] && [ -d "$CLAUDE_PROJECT_DIR/vendor/skills" ]; then
  VENDOR="$CLAUDE_PROJECT_DIR/vendor/skills"
fi

# Device awareness: on the cloud/mobile container, browser + iOS + deploy skills
# can't work (Chrome download is blocked, no device). Exclude them so they never
# appear in the menu and can't be fired by accident. On desktop they're included.
IS_CLOUD=0
[ "${CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE:-}" = "cloud_default" ] && IS_CLOUD=1

# Skills that are pure machinery, not user-facing, OR can't run on mobile.
INTERNAL="agents|bin|browser-skills|contrib|docs|extension|hosts|lib|model-overlays|node_modules|scripts|test"
CLOUD_EXCLUDE="browse|qa|qa-only|scrape|connect-chrome|open-gstack-browser|setup-browser-cookies|pair-agent|benchmark|benchmark-models|ios-clean|ios-design-review|ios-fix|ios-qa|ios-sync|land-and-deploy|setup-deploy|canary|sync-gbrain|setup-gbrain"

log() { echo "[skills] $1"; }

# Retry a command up to 4x with exponential backoff (2s,4s,8s). Ephemeral cloud
# containers have flaky first-boot networking; one failed fetch must NOT silently
# drop a whole batch of skills. This is the fix for inconsistent skill counts
# between sessions — every network op below now retries instead of giving up.
retry() {
  local n=0 max=4 delay=2
  until "$@"; do
    n=$((n + 1))
    [ "$n" -ge "$max" ] && return 1
    sleep "$delay"; delay=$((delay * 2))
  done
  return 0
}

# ── Step 1: clone gStack if missing ──────────────────────────────────────────
if [ ! -d "$GSTACK_DIR/.git" ] && [ ! -f "$GSTACK_DIR/VERSION" ]; then
  log "Cloning gStack..."
  retry git clone --depth 1 --single-branch "$GSTACK_REPO" "$GSTACK_DIR" >/dev/null 2>&1 \
    || { log "Clone failed after retries (network?). Skills unchanged."; exit 0; }
fi

# ── Step 2: deps + generate SKILL.md files (needs bun) ───────────────────────
if command -v bun >/dev/null 2>&1; then
  cd "$GSTACK_DIR" || exit 0
  if [ ! -d node_modules ]; then
    log "Installing gStack deps..."
    bun install >/dev/null 2>&1 || log "bun install hiccup — continuing"
  fi
  if [ ! -f "review/SKILL.md" ]; then
    log "Generating skill docs..."
    bun run scripts/gen-skill-docs.ts --host claude >/dev/null 2>&1 \
      || log "doc-gen hiccup — continuing"
  fi
else
  log "bun not found — skills need bun on this machine (install: https://bun.sh)."
fi

# ── Step 3: privacy — turn gStack telemetry off (Hunter's rule: don't phone home)
if [ -x "$GSTACK_DIR/bin/gstack-config" ]; then
  "$GSTACK_DIR/bin/gstack-config" set telemetry off  >/dev/null 2>&1 || true
fi

# ── Step 4: link each real skill into ~/.claude/skills/ ──────────────────────
linked=0
for skill_dir in "$GSTACK_DIR"/*/; do
  name=$(basename "$skill_dir")
  echo "$name" | grep -qE "^($INTERNAL)$" && continue
  [ "$IS_CLOUD" -eq 1 ] && echo "$name" | grep -qE "^($CLOUD_EXCLUDE)$" && continue
  [ ! -f "$skill_dir/SKILL.md" ] && continue
  target="$SKILLS_DIR/$name"
  [ -e "$target" ] && continue
  mkdir -p "$target"
  ln -sf "$skill_dir/SKILL.md" "$target/SKILL.md"
  linked=$((linked + 1))
done

# ── Step 5: link OpenClaw-specific skills (nested under openclaw/skills/) ────
# These are unique skills not in the top-level gStack dirs — only 4 of them.
OPENCLAW_SKILLS_DIR="$GSTACK_DIR/openclaw/skills"
if [ -d "$OPENCLAW_SKILLS_DIR" ]; then
  for skill_dir in "$OPENCLAW_SKILLS_DIR"/*/; do
    [ ! -f "$skill_dir/SKILL.md" ] && continue
    name=$(basename "$skill_dir")
    target="$SKILLS_DIR/$name"
    [ -e "$target" ] && continue
    mkdir -p "$target"
    ln -sf "$skill_dir/SKILL.md" "$target/SKILL.md"
    linked=$((linked + 1))
  done
fi

# ── Step 6: copy VENDORED skills from Hunter's own repo ──────────────────────
# These 12 (frontend-design, the 7 ui-ux-pro-max sub-skills, the 4 OpenClaw
# skills) used to be fetched over the network every session — two separate clones
# plus a curl — so a flaky boot would silently drop them and skill counts swung
# between sessions. They now live as REAL files in the repo under vendor/skills/.
# The repo is guaranteed present every session (it's what carries this script), so
# copying from it is 100% reliable with ZERO network. This is the permanent fix
# for "gStack comes but the others don't": the others now come from a place even
# more reliable than the gStack clone.
#
# VENDOR was resolved at the top (before any cd). If it's still empty, this script
# was piped in via curl|bash from another repo — fall back to a lightweight clone of
# Hunter's repo just to grab the vendored skills.
if [ -z "$VENDOR" ]; then
  MDREPO="$SKILLS_DIR/md-nahin-vendor"
  if [ ! -d "$MDREPO/.git" ]; then
    retry git clone --depth 1 --single-branch \
      https://github.com/mdnahin537/MD-nahin.git "$MDREPO" >/dev/null 2>&1 || true
  fi
  [ -d "$MDREPO/vendor/skills" ] && VENDOR="$MDREPO/vendor/skills"
fi

if [ -n "$VENDOR" ] && [ -d "$VENDOR" ]; then
  for src in "$VENDOR"/*/; do
    name=$(basename "$src")
    [ -f "$src/SKILL.md" ] || continue
    [ "$IS_CLOUD" -eq 1 ] && echo "$name" | grep -qE "^($CLOUD_EXCLUDE)$" && continue
    target="$SKILLS_DIR/$name"
    [ -e "$target" ] && continue
    cp -r "$src" "$target"
    linked=$((linked + 1))
  done
else
  log "vendored skills dir not found — design/OpenClaw skills unavailable this session"
fi

# Count real skills: every entry with a reachable SKILL.md, excluding helper clones.
# Symlinked skill dirs count too — the old `find -type d` silently skipped them,
# undercounting by 7 and causing the confusing "41 vs 48" mismatch in the logs.
total=0
for d in "$SKILLS_DIR"/*/; do
  name=$(basename "$d")
  case "$name" in gstack|ui-ux-pro-max-repo|md-nahin-vendor) continue ;; esac
  [ -f "$d/SKILL.md" ] && total=$((total + 1))
done
log "Ready. $linked new, $total skills available.$([ "$IS_CLOUD" -eq 1 ] && echo ' (mobile: browser/iOS skills excluded)')"
exit 0
