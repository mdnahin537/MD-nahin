# Vendored skills

These skills are **committed copies**, not fetched over the network. The install
script (`scripts/install-skills.sh`) copies them into `~/.claude/skills/` at the
start of every session. Because they live in this repo — which is guaranteed
present every session — they load with **zero network dependency**, so they can
never silently go missing the way network-fetched skills can.

## Why these are vendored and gStack is not

gStack carries runtime machinery (its `bin/` and `lib/`) that must be cloned to
actually execute, so it stays a clone. These 12 are self-contained (markdown +
small scripts + data), so copying them in is both safe and far more reliable.

## Provenance & licenses

| Skill(s) | Source | License |
|---|---|---|
| `frontend-design` | anthropics/claude-code | Anthropic (see SKILL.md) |
| `ui-ux-pro-max`, `design-system`, `ui-styling`, `design`, `brand`, `slides`, `banner-design` | nextlevelbuilder/ui-ux-pro-max-skill | MIT © Next Level Builder |
| `gstack-openclaw-*` (4) | garrytan/gstack (openclaw/skills) | per gStack repo |

To refresh a vendored skill to its latest upstream version, re-copy it from the
source repo into this directory and commit. They do not auto-update by design —
reliability is the priority here, not bleeding-edge freshness.
