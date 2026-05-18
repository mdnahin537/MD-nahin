#!/usr/bin/env bash
# Hunter's MCP Server Setup Script
# Run this once from your terminal (NOT inside Claude Code).
# All servers install at user scope (-s user) so they work across every project.
#
# Usage: bash scripts/setup-mcps.sh
# For API-key servers, set the env vars first or edit the commands below.

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[MCP]${NC} $1"; }
warn()  { echo -e "${YELLOW}[SKIP]${NC} $1"; }

echo ""
echo "═══════════════════════════════════════════════"
echo "  Hunter's MCP Studio Setup"
echo "═══════════════════════════════════════════════"
echo ""

# ─── TIER 1: No API keys required ───────────────────────────────────────────

info "Installing: sequential-thinking (structured reasoning chains)"
claude mcp add sequential-thinking -s user -- \
  npx -y @modelcontextprotocol/server-sequential-thinking

info "Installing: filesystem (read/write local files)"
claude mcp add filesystem -s user -- \
  npx -y @modelcontextprotocol/server-filesystem \
  "$HOME/Documents" "$HOME/Desktop" "$HOME/Downloads" "$HOME/Projects"

info "Installing: puppeteer (headless browser automation)"
claude mcp add puppeteer -s user -- \
  npx -y @modelcontextprotocol/server-puppeteer

info "Installing: fetch (web page content retrieval)"
claude mcp add fetch -s user -- \
  npx -y @kazuph/mcp-fetch

info "Installing: playwright (live browser testing)"
claude mcp add playwright -s user -- \
  npx -y @playwright/mcp@latest

info "Installing: context7 (live library docs — kills stale hallucinations)"
claude mcp add context7 -s user -- \
  npx -y @upstash/context7-mcp@latest

info "Installing: chrome-devtools (browser console, network, errors)"
claude mcp add chrome-devtools -s user -- \
  npx -y chrome-devtools-mcp@latest

# ─── TIER 2: Requires API keys ──────────────────────────────────────────────

echo ""
echo "─── API-key servers ───────────────────────────"
echo "Set these env vars before running, or edit the commands below."
echo ""

# Brave Search — free tier: https://brave.com/search/api/
if [[ -n "${BRAVE_API_KEY:-}" ]]; then
  info "Installing: brave-search (real-time web search)"
  claude mcp add brave-search -s user -- \
    env BRAVE_API_KEY="$BRAVE_API_KEY" \
    npx -y @modelcontextprotocol/server-brave-search
else
  warn "brave-search — set BRAVE_API_KEY and re-run"
  warn "  Get a free key: https://brave.com/search/api/"
fi

# Firecrawl — web scraping: https://www.firecrawl.dev/
if [[ -n "${FIRECRAWL_API_KEY:-}" ]]; then
  info "Installing: firecrawl (web scraping & competitor analysis)"
  claude mcp add firecrawl -s user -- \
    env FIRECRAWL_API_KEY="$FIRECRAWL_API_KEY" \
    npx -y firecrawl-mcp
else
  warn "firecrawl — set FIRECRAWL_API_KEY and re-run"
  warn "  Get a key: https://www.firecrawl.dev/"
fi

# GitHub — requires a Personal Access Token
if [[ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]]; then
  info "Installing: github (repo, PR, issues, CI management)"
  claude mcp add github -s user -- \
    env GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN" \
    npx -y @modelcontextprotocol/server-github
else
  warn "github MCP — set GITHUB_PERSONAL_ACCESS_TOKEN and re-run"
  warn "  Create token: https://github.com/settings/tokens"
  warn "  Scopes needed: repo, read:user, read:org"
fi

# ─── TIER 3: UI polish skills (ibelick/ui-skills npm package) ───────────────

echo ""
echo "─── UI design-engineering skills ──────────────"
info "Installing ui-skills polish pipeline"

npx ui-skills add baseline-ui
npx ui-skills add fixing-accessibility
npx ui-skills add fixing-motion-performance

# ─── Verify ─────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════"
info "Done. Listing installed MCP servers:"
echo ""
claude mcp list
echo ""
echo "═══════════════════════════════════════════════"
echo ""
echo "NEXT:"
echo "  1. Install plugins:  bash scripts/setup-plugins.sh   (then paste into Claude)"
echo "  2. Install gStack:   bash scripts/setup-gstack.sh"
echo ""
