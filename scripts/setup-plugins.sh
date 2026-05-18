#!/usr/bin/env bash
# Hunter's Plugin Setup — Reference Script
#
# IMPORTANT: These are slash commands that run INSIDE Claude Code, not in bash.
# This script just prints them so you can paste them into your Claude session
# one at a time (or all at once).
#
# Usage:
#   bash scripts/setup-plugins.sh           # prints commands to copy
#   bash scripts/setup-plugins.sh | pbcopy  # macOS: copy to clipboard
#   bash scripts/setup-plugins.sh | xclip   # Linux: copy to clipboard

cat <<'PLUGINS'

═══════════════════════════════════════════════════════════════
  HUNTER'S CLAUDE CODE PLUGINS — PASTE INSIDE CLAUDE SESSION
═══════════════════════════════════════════════════════════════

# ── Official Anthropic plugins (claude-plugins-official is pre-installed) ──

/plugin install superpowers@claude-plugins-official
/plugin install frontend-design@claude-plugins-official
/plugin install feature-dev@claude-plugins-official
/plugin install code-review@claude-plugins-official
/plugin install security-guidance@claude-plugins-official
/plugin install ralph-loop@claude-plugins-official
/plugin install context7@claude-plugins-official
/plugin install github@claude-plugins-official
/plugin install figma@claude-plugins-official
/plugin install vercel@claude-plugins-official
/plugin install supabase@claude-plugins-official
/plugin install playwright@claude-plugins-official
/plugin install typescript-lsp@claude-plugins-official
/plugin install pyright-lsp@claude-plugins-official

# ── Community plugins (add the marketplace first, then install) ──

/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem@claude-mem

# ── Activate all installed plugins without restarting ──

/reload-plugins

═══════════════════════════════════════════════════════════════
  AFTER INSTALL:
  - Run /plugin and visit the "Installed" tab to verify
  - Code intelligence plugins (typescript-lsp, pyright-lsp) need their
    language server binaries on $PATH:
        npm install -g typescript-language-server typescript
        pip install pyright
  - Check the /plugin "Errors" tab if any plugin fails to load
═══════════════════════════════════════════════════════════════

PLUGINS
