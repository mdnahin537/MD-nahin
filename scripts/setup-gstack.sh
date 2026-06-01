#!/usr/bin/env bash
# gStack — Garry Tan's 23+ specialist Claude Code skills
# https://github.com/garrytan/gstack
#
# Run this in your terminal (NOT inside Claude Code).
# It clones gstack into ~/.claude/skills/gstack and runs its setup.

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[gstack]${NC} $1"; }
warn()  { echo -e "${YELLOW}[gstack]${NC} $1"; }
fail()  { echo -e "${RED}[gstack]${NC} $1"; exit 1; }

GSTACK_DIR="$HOME/.claude/skills/gstack"

if [[ -d "$GSTACK_DIR" ]]; then
  warn "gStack already exists at $GSTACK_DIR"
  warn "To update, run: cd $GSTACK_DIR && git pull && ./setup"
  warn "Or use the in-session command: /gstack-upgrade"
  exit 0
fi

info "Cloning gStack into $GSTACK_DIR"
mkdir -p "$(dirname "$GSTACK_DIR")"
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR" \
  || fail "Clone failed. Check your network."

info "Running gStack setup..."
cd "$GSTACK_DIR"
./setup || fail "Setup failed. See $GSTACK_DIR for details."

info "Done. gStack installed."
echo ""
echo "Try inside Claude Code:"
echo "  /office-hours      — start a new product idea"
echo "  /autoplan          — chain CEO + design + eng reviews"
echo "  /ship              — test, review, push, open PR"
echo "  /cso               — OWASP + STRIDE security audit"
echo "  /gstack-upgrade    — update gStack from inside a session"
