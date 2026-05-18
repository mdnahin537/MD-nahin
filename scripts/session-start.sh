#!/usr/bin/env bash
# Hunter Studio — Session Start Bootstrap
# Runs automatically at every Claude Code web session start.
# Installs all skills and verifies MCP config. Fully idempotent.

set -uo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
dim()  { echo -e "${DIM}$1${NC}"; }

echo ""
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Hunter Studio — Claude Code Web Session${NC}"
echo -e "  Effort: xhigh  |  $(date '+%Y-%m-%d %H:%M')"
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo ""

# ── Runtime check ──────────────────────────────────────────────────────────
ok "Node.js $(node --version 2>/dev/null)"
ok "Claude Code $(claude --version 2>/dev/null | head -1)"

echo ""
echo -e "${BOLD}Installing skills...${NC}"

SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"

install_skill() {
  local name="$1"
  local src="$2"
  if [ -d "$SKILLS_DIR/$name" ]; then
    dim "  already installed: $name"
  else
    cp -r "$src" "$SKILLS_DIR/$name"
    ok "installed: $name"
  fi
}

clone_if_missing() {
  local dest="$1"
  local url="$2"
  if [ ! -d "$dest" ]; then
    git clone --quiet --depth 1 "$url" "$dest" 2>/dev/null && echo "cloned" || echo "failed"
  fi
}

# ── Anthropic official skills ───────────────────────────────────────────────
clone_if_missing /tmp/anthropic-skills https://github.com/anthropics/skills.git > /dev/null 2>&1
if [ -d /tmp/anthropic-skills/skills ]; then
  for skill in frontend-design webapp-testing mcp-builder skill-creator \
               docx pdf pptx xlsx web-artifacts-builder; do
    install_skill "$skill" "/tmp/anthropic-skills/skills/$skill"
  done
else
  warn "Anthropic skills: clone failed (network)"
fi

# ── obra/superpowers skills ─────────────────────────────────────────────────
clone_if_missing /tmp/superpowers-core https://github.com/obra/superpowers.git > /dev/null 2>&1
if [ -d /tmp/superpowers-core/skills ]; then
  for skill_path in /tmp/superpowers-core/skills/*/; do
    skill=$(basename "$skill_path")
    install_skill "$skill" "$skill_path"
  done
else
  warn "Superpowers: clone failed (network)"
fi

# ── Trail of Bits skills ────────────────────────────────────────────────────
clone_if_missing /tmp/tob-skills https://github.com/trailofbits/skills.git > /dev/null 2>&1
if [ -d /tmp/tob-skills/plugins ]; then
  for skill in ask-questions-if-underspecified modern-python \
               property-based-testing differential-review \
               skill-improver debug-buttercup; do
    src="/tmp/tob-skills/plugins/$skill/skills/$skill"
    [ -d "$src" ] && install_skill "$skill" "$src"
  done
else
  warn "Trail of Bits skills: clone failed (network)"
fi

# ── gStack ──────────────────────────────────────────────────────────────────
GSTACK_DIR="$HOME/.claude/skills/gstack"
if [ -d "$GSTACK_DIR" ]; then
  dim "  already installed: gstack"
else
  clone_if_missing "$GSTACK_DIR" https://github.com/garrytan/gstack.git > /dev/null 2>&1
  if [ -d "$GSTACK_DIR" ]; then
    [ -f "$GSTACK_DIR/setup" ] && bash "$GSTACK_DIR/setup" >/dev/null 2>&1
    ok "installed: gstack"
  else
    warn "gStack: clone failed"
  fi
fi

echo ""

# ── MCP status ─────────────────────────────────────────────────────────────
echo -e "${BOLD}MCP Servers (auto-start via settings.json):${NC}"
dim "  sequential-thinking  fetch  context7  playwright  filesystem"

[[ -n "${BRAVE_API_KEY:-}" ]]                   && ok "brave-search active"   || warn "brave-search — add BRAVE_API_KEY in env config"
[[ -n "${FIRECRAWL_API_KEY:-}" ]]               && ok "firecrawl active"      || warn "firecrawl — add FIRECRAWL_API_KEY in env config"
[[ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]]    && ok "github-mcp active"     || warn "github-mcp — add GITHUB_PERSONAL_ACCESS_TOKEN in env config"

echo ""
echo -e "${DIM}Constraints: Halal only | Payoneer/Gumroad | No secrets in commits${NC}"
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo ""
