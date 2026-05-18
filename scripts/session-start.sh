#!/usr/bin/env bash
# Hunter Studio — Session Start Bootstrap
# Runs automatically at every Claude Code web session start via SessionStart hook.
# Safe to run repeatedly. Idempotent.

set -uo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
NC='\033[0m'
BOLD='\033[1m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
dim()  { echo -e "${DIM}$1${NC}"; }

echo ""
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Hunter Studio — Claude Code Web Session${NC}"
echo -e "  Model: sonnet-4-6  |  Effort: xhigh"
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo ""

# ── Node / npx check ───────────────────────────────────────────────────────
NODE_VER=$(node --version 2>/dev/null || echo "not found")
ok "Node.js $NODE_VER"
ok "npx $(npx --version 2>/dev/null)"
ok "Claude Code $(claude --version 2>/dev/null | head -1)"

echo ""

# ── MCP status (mcpServers in settings.json auto-start — just report) ──────
echo -e "${BOLD}MCP Servers (auto-configured):${NC}"
dim "  sequential-thinking  fetch  context7  playwright  filesystem"

# API-key MCPs — report status based on env vars
if [[ -n "${BRAVE_API_KEY:-}" ]]; then
  ok "brave-search (BRAVE_API_KEY set)"
else
  warn "brave-search — add BRAVE_API_KEY in environment config to activate"
fi

if [[ -n "${FIRECRAWL_API_KEY:-}" ]]; then
  ok "firecrawl (FIRECRAWL_API_KEY set)"
else
  warn "firecrawl — add FIRECRAWL_API_KEY in environment config to activate"
fi

if [[ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]]; then
  ok "github-mcp (token set)"
else
  warn "github-mcp — add GITHUB_PERSONAL_ACCESS_TOKEN in environment config to activate"
fi

echo ""

# ── gStack install if missing ───────────────────────────────────────────────
GSTACK_DIR="$HOME/.claude/skills/gstack"
if [[ -d "$GSTACK_DIR" ]]; then
  ok "gStack: installed at $GSTACK_DIR"
else
  echo -e "${YELLOW}⚠${NC}  gStack not found — installing..."
  mkdir -p "$(dirname "$GSTACK_DIR")"
  if git clone --quiet --single-branch --depth 1 \
       https://github.com/garrytan/gstack.git "$GSTACK_DIR" 2>/dev/null; then
    if [[ -f "$GSTACK_DIR/setup" ]]; then
      bash "$GSTACK_DIR/setup" >/dev/null 2>&1 && ok "gStack: installed" || warn "gStack setup failed — try /gstack-upgrade"
    else
      ok "gStack: cloned (no setup script found)"
    fi
  else
    warn "gStack: clone failed (network may be restricted) — use /gstack-upgrade later"
  fi
fi

echo ""

# ── Skills check ───────────────────────────────────────────────────────────
echo -e "${BOLD}Active Skills:${NC}"
dim "  review  security-review  simplify  claude-api  session-start-hook"
dim "  update-config  keybindings-help  fewer-permission-prompts  loop  init"

echo ""
echo -e "${DIM}Hard constraints: Halal only | Payoneer/Gumroad payouts | No secrets in commits${NC}"
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo ""
