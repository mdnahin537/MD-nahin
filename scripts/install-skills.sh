#!/usr/bin/env bash
# install-skills.sh — makes Hunter's skills present in every Claude Code session.
#
# WHY this exists: Claude Code on the web runs in an ephemeral container that is
# wiped between sessions. The git repo is the only thing that survives. So this
# script — committed to the repo — re-installs ALL skill sets at the start of
# every session by cloning each repo into ~/.claude/skills/.
#
# Skill sets installed:
#   1. gStack          — garrytan/gstack (34 skills)
#   2. Superpowers     — obra/superpowers (14 skills)
#   3. ui-ux-pro-max   — nextlevelbuilder/ui-ux-pro-max-skill (7 skills)
#   4. playwright      — lackeyjb/playwright-skill (1 skill)
#   5. code-review     — awesome-skills/code-review-skill (1 skill)
#
# Safe to run repeatedly. Skips work already done. Never fails the session.

set -uo pipefail   # NOT -e: a session must never die because setup hiccuped

SKILLS_DIR="$HOME/.claude/skills"
GSTACK_DIR="$SKILLS_DIR/gstack"
GSTACK_REPO="https://github.com/garrytan/gstack.git"

# Extra skill repos are cloned into a SOURCES dir that lives OUTSIDE the skills
# directory, so the raw repo checkouts never get picked up as skills themselves.
# Only the actual skill folders get copied into ~/.claude/skills/.
SOURCES_DIR="$HOME/.claude/skill-sources"
mkdir -p "$SOURCES_DIR"

SUPERPOWERS_DIR="$SOURCES_DIR/superpowers"
SUPERPOWERS_REPO="https://github.com/obra/superpowers.git"

UIUX_DIR="$SOURCES_DIR/ui-ux-pro-max"
UIUX_REPO="https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git"

PLAYWRIGHT_DIR="$SOURCES_DIR/playwright-skill"
PLAYWRIGHT_REPO="https://github.com/lackeyjb/playwright-skill.git"

CODEREVIEW_DIR="$SOURCES_DIR/code-review-skill"
CODEREVIEW_REPO="https://github.com/awesome-skills/code-review-skill.git"

mkdir -p "$SKILLS_DIR"

# Device awareness: on the cloud/mobile container, browser + iOS + deploy skills
# can't work (Chrome download is blocked, no device). Exclude them so they never
# appear in the menu and can't be fired by accident. On desktop they're included.
IS_CLOUD=0
[ "${CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE:-}" = "cloud_default" ] && IS_CLOUD=1

# Skills that are pure machinery, not user-facing, OR can't run on mobile.
INTERNAL="agents|bin|browser-skills|contrib|docs|extension|hosts|lib|model-overlays|node_modules|scripts|spec|test"
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

total=$(find "$SKILLS_DIR" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
log "gStack: $linked new skills linked."

# ── Step 5: Superpowers (obra/superpowers) ────────────────────────────────────
if [ ! -d "$SUPERPOWERS_DIR/.git" ]; then
  log "Cloning Superpowers..."
  git clone --depth 1 --single-branch "$SUPERPOWERS_REPO" "$SUPERPOWERS_DIR" >/dev/null 2>&1 \
    || { log "Superpowers clone failed (network?). Skipping."; }
fi
if [ -d "$SUPERPOWERS_DIR/skills" ]; then
  for skill_dir in "$SUPERPOWERS_DIR/skills"/*/; do
    name=$(basename "$skill_dir")
    [ ! -f "$skill_dir/SKILL.md" ] && continue
    target="$SKILLS_DIR/$name"
    [ -e "$target" ] && continue
    cp -r "$skill_dir" "$target"
    log "  + superpowers/$name"
  done
fi

# ── Step 6: ui-ux-pro-max (nextlevelbuilder) ─────────────────────────────────
if [ ! -d "$UIUX_DIR/.git" ]; then
  log "Cloning ui-ux-pro-max..."
  git clone --depth 1 --single-branch "$UIUX_REPO" "$UIUX_DIR" >/dev/null 2>&1 \
    || { log "ui-ux-pro-max clone failed (network?). Skipping."; }
fi
if [ -d "$UIUX_DIR/.claude/skills" ]; then
  for skill_dir in "$UIUX_DIR/.claude/skills"/*/; do
    name=$(basename "$skill_dir")
    [ ! -f "$skill_dir/SKILL.md" ] && continue
    target="$SKILLS_DIR/$name"
    [ -e "$target" ] && continue
    cp -r "$skill_dir" "$target"
    log "  + ui-ux-pro-max/$name"
  done
fi

# ── Step 7: playwright-skill (lackeyjb) ──────────────────────────────────────
if [ ! -d "$PLAYWRIGHT_DIR/.git" ]; then
  log "Cloning playwright-skill..."
  git clone --depth 1 --single-branch "$PLAYWRIGHT_REPO" "$PLAYWRIGHT_DIR" >/dev/null 2>&1 \
    || { log "playwright-skill clone failed (network?). Skipping."; }
fi
if [ -d "$PLAYWRIGHT_DIR/skills/playwright-skill" ]; then
  target="$SKILLS_DIR/playwright-skill"
  if [ ! -e "$target" ]; then
    cp -r "$PLAYWRIGHT_DIR/skills/playwright-skill" "$target"
    log "  + playwright-skill"
  fi
fi

# ── Step 8: code-review-excellence (awesome-skills) ──────────────────────────
if [ ! -d "$CODEREVIEW_DIR/.git" ]; then
  log "Cloning code-review-excellence..."
  git clone --depth 1 --single-branch "$CODEREVIEW_REPO" "$CODEREVIEW_DIR" >/dev/null 2>&1 \
    || { log "code-review clone failed (network?). Skipping."; }
fi
if [ -f "$CODEREVIEW_DIR/SKILL.md" ]; then
  target="$SKILLS_DIR/code-review-excellence"
  if [ ! -e "$target" ]; then
    cp -r "$CODEREVIEW_DIR" "$target"
    log "  + code-review-excellence"
  fi
fi

total=$(find "$SKILLS_DIR" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
log "Ready. $total skills available.$([ "$IS_CLOUD" -eq 1 ] && echo ' (mobile: browser/iOS skills excluded)')"
exit 0
