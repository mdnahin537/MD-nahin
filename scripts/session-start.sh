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

ok "Node.js $(node --version 2>/dev/null)"
ok "Claude Code $(claude --version 2>/dev/null | head -1)"

SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"

install_skill() {
  local name="$1" src="$2"
  if [ ! -d "$SKILLS_DIR/$name" ] && [ -d "$src" ]; then
    cp -r "$src" "$SKILLS_DIR/$name" && echo -e "${GREEN}✓${NC} $name" || true
  fi
}

clone_once() {
  local dest="$1" url="$2"
  [ -d "$dest" ] || git clone --quiet --depth 1 "$url" "$dest" 2>/dev/null
}

echo ""
echo -e "${BOLD}Skills:${NC}"

# ── Anthropic official ──────────────────────────────────────────────────────
clone_once /tmp/anthropic-skills https://github.com/anthropics/skills.git
if [ -d /tmp/anthropic-skills/skills ]; then
  for skill in frontend-design webapp-testing mcp-builder skill-creator \
               docx pdf pptx xlsx web-artifacts-builder; do
    install_skill "$skill" "/tmp/anthropic-skills/skills/$skill"
  done
fi

# ── obra/superpowers ────────────────────────────────────────────────────────
clone_once /tmp/superpowers-core https://github.com/obra/superpowers.git
if [ -d /tmp/superpowers-core/skills ]; then
  for skill_path in /tmp/superpowers-core/skills/*/; do
    install_skill "$(basename "$skill_path")" "$skill_path"
  done
fi

# ── Trail of Bits (select) ──────────────────────────────────────────────────
clone_once /tmp/tob-skills https://github.com/trailofbits/skills.git
if [ -d /tmp/tob-skills/plugins ]; then
  for skill in ask-questions-if-underspecified modern-python \
               differential-review; do
    install_skill "$skill" "/tmp/tob-skills/plugins/$skill/skills/$skill"
  done
fi

# ── claude-design (from Claude.ai's internal design system) ────────────────
clone_once /tmp/claude-design-skill https://github.com/jiji262/claude-design-skill.git
if [ -f /tmp/claude-design-skill/SKILL.md ] && [ ! -d "$SKILLS_DIR/claude-design" ]; then
  mkdir -p "$SKILLS_DIR/claude-design"
  cp /tmp/claude-design-skill/SKILL.md "$SKILLS_DIR/claude-design/SKILL.md"
  echo -e "${GREEN}✓${NC} claude-design"
fi

# ── open-design select skills ───────────────────────────────────────────────
clone_once /tmp/open-design https://github.com/nexu-io/open-design.git
if [ -d /tmp/open-design/skills ]; then
  for skill in platform-design gsap-react article-magazine; do
    install_skill "$skill" "/tmp/open-design/skills/$skill"
  done
fi

# ── open-design brand reference library (150 DESIGN.md files) ──────────────
if [ -d /tmp/open-design/design-systems ]; then
  mkdir -p "$HOME/.claude/design-systems"
  for ds_dir in /tmp/open-design/design-systems/*/; do
    name=$(basename "$ds_dir")
    if [ -f "$ds_dir/DESIGN.md" ] && [ ! -f "$HOME/.claude/design-systems/$name.md" ]; then
      cp "$ds_dir/DESIGN.md" "$HOME/.claude/design-systems/$name.md"
    fi
  done
  ok "150 brand design systems (apple, vercel, stripe, tesla...) → ~/.claude/design-systems/"
fi

# ── gStack ──────────────────────────────────────────────────────────────────
GSTACK_DIR="$SKILLS_DIR/gstack"
clone_once "$GSTACK_DIR" https://github.com/garrytan/gstack.git
if [ -d "$GSTACK_DIR" ]; then
  [ -f "$GSTACK_DIR/setup" ] && bash "$GSTACK_DIR/setup" >/dev/null 2>&1 || true
  # Expose individual gStack skills as top-level so they trigger independently
  # investigate excluded — conflicts with systematic-debugging (same iron law, same triggers)
  for skill in design-consultation design-html design-review design-shotgun \
               office-hours plan-ceo-review plan-eng-review \
               ship qa cso skillify; do
    install_skill "$skill" "$GSTACK_DIR/$skill"
  done
fi

# ── Remove noise/conflict skills (runs AFTER installs — idempotent) ────────
for skill in debug-buttercup using-superpowers using-git-worktrees writing-skills \
             property-based-testing finishing-a-development-branch \
             requesting-code-review receiving-code-review theme-factory \
             skill-improver session-start-hook investigate; do
  [ -d "$SKILLS_DIR/$skill" ] && rm -rf "$SKILLS_DIR/$skill"
done

echo ""

# ── MCP status ─────────────────────────────────────────────────────────────
echo -e "${BOLD}MCP Servers (auto-start):${NC}"
dim "  sequential-thinking  fetch  context7  playwright  filesystem"
[[ -n "${BRAVE_API_KEY:-}" ]]                && ok "brave-search active" || warn "brave-search — add BRAVE_API_KEY in env config"
[[ -n "${FIRECRAWL_API_KEY:-}" ]]            && ok "firecrawl active"    || warn "firecrawl — add FIRECRAWL_API_KEY in env config"

echo ""
echo -e "${DIM}Halal only | Payoneer/Gumroad | No secrets in commits${NC}"
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo ""
