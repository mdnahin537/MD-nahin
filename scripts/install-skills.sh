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

# Device awareness: on the cloud/mobile container, browser + iOS + deploy skills
# can't work (Chrome download is blocked, no device). Exclude them so they never
# appear in the menu and can't be fired by accident. On desktop they're included.
IS_CLOUD=0
[ "${CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE:-}" = "cloud_default" ] && IS_CLOUD=1

# Skills that are pure machinery, not user-facing, OR can't run on mobile.
INTERNAL="agents|bin|browser-skills|contrib|docs|extension|hosts|lib|model-overlays|node_modules|scripts|test"
CLOUD_EXCLUDE="browse|qa|qa-only|scrape|connect-chrome|open-gstack-browser|setup-browser-cookies|pair-agent|benchmark|benchmark-models|ios-clean|ios-design-review|ios-fix|ios-qa|ios-sync|land-and-deploy|setup-deploy|canary|sync-gbrain|setup-gbrain"

log() { echo "[skills] $1"; }

# ── Step 1: clone gStack if missing ──────────────────────────────────────────
if [ ! -d "$GSTACK_DIR/.git" ] && [ ! -f "$GSTACK_DIR/VERSION" ]; then
  log "Cloning gStack..."
  git clone --depth 1 --single-branch "$GSTACK_REPO" "$GSTACK_DIR" >/dev/null 2>&1 \
    || { log "Clone failed (network?). Skills unchanged."; exit 0; }
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

# ── Step 6: Anthropic's frontend-design skill (pure markdown, works everywhere)
# This is NOT a browser skill — it's a single SKILL.md design-thinking framework.
# It was misclassified as desktop-only before. Fetch it directly (no plugin needed).
FD_DIR="$SKILLS_DIR/frontend-design"
FD_URL="https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/frontend-design/skills/frontend-design/SKILL.md"
if [ ! -f "$FD_DIR/SKILL.md" ]; then
  mkdir -p "$FD_DIR"
  if curl -fsSL "$FD_URL" -o "$FD_DIR/SKILL.md" 2>/dev/null; then
    linked=$((linked + 1))
  else
    rmdir "$FD_DIR" 2>/dev/null || true
    log "frontend-design fetch failed (network?) — skipping, non-blocking"
  fi
fi

# ── Step 7: ui-ux-pro-max (community design intelligence) ────────────────────
# Audited 2026-05: MIT, no telemetry, no unknown endpoints. Core design-system +
# ui-styling are pure-stdlib Python, fully offline. The image-gen sub-skills
# (design/brand) read .env and call Google Gemini — OPT-IN only, need a key.
# We install by symlinking the self-contained sub-skill dirs (the npm CLI is just
# a file-copier; we skip it to avoid any phone-home).
UUPM_REPO="$SKILLS_DIR/ui-ux-pro-max-repo"
UUPM_URL="https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git"
if [ ! -d "$UUPM_REPO/.git" ]; then
  git clone --depth 1 --single-branch "$UUPM_URL" "$UUPM_REPO" >/dev/null 2>&1 \
    || log "ui-ux-pro-max clone failed (network?) — skipping, non-blocking"
fi
if [ -d "$UUPM_REPO/.claude/skills" ]; then
  for sk in design-system ui-styling design brand slides banner-design ui-ux-pro-max; do
    src="$UUPM_REPO/.claude/skills/$sk"
    [ -f "$src/SKILL.md" ] || continue
    [ -e "$SKILLS_DIR/$sk" ] && continue
    ln -sfn "$src" "$SKILLS_DIR/$sk"
    linked=$((linked + 1))
  done
fi

total=$(find "$SKILLS_DIR" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
log "Ready. $linked new, $total skills available.$([ "$IS_CLOUD" -eq 1 ] && echo ' (mobile: browser/iOS skills excluded)')"
exit 0
