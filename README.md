# Hunter's Professional Claude Code Studio

A fully configured, research-verified Claude Code environment. Every tool here is real and sourced.

---

## What's in This Repo

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Master Operating System — Claude reads this at every session start |
| `.claude/settings.json` | Permissions, model config, attribution |
| `scripts/setup-mcps.sh` | Installs MCP servers + ui-skills polish pipeline |
| `scripts/setup-plugins.sh` | Reference for `/plugin install` commands (paste inside Claude) |
| `scripts/setup-gstack.sh` | Installs Garry Tan's gStack (23+ specialist commands) |

---

## Three-Stage Install

### Stage 1 — Terminal: MCP servers + ui-skills

```bash
# Optional: export API keys first
export BRAVE_API_KEY=your_key_here
export FIRECRAWL_API_KEY=fc-your_key_here
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

bash scripts/setup-mcps.sh
```

### Stage 2 — Terminal: gStack

```bash
bash scripts/setup-gstack.sh
```

Clones gStack to `~/.claude/skills/gstack` and runs its setup script.

### Stage 3 — Inside Claude: official + community plugins

Launch Claude Code, then paste the commands from `setup-plugins.sh`:

```bash
bash scripts/setup-plugins.sh        # prints the commands
# OR on macOS:
bash scripts/setup-plugins.sh | pbcopy
```

Then in your Claude session, paste each `/plugin install ...` line.

---

## What Gets Installed

### Official Anthropic plugins (`claude-plugins-official` marketplace)

| Plugin | What it does |
|--------|--------------|
| `superpowers` | Structured build methodology, TDD-first |
| `frontend-design` | Production UI — kills generic AI aesthetics |
| `feature-dev` | 7-phase structured feature workflow |
| `code-review` | Multi-agent PR review |
| `security-guidance` | Auto-scans every file edit for vulnerabilities |
| `ralph-loop` | Iterates autonomously until task complete |
| `context7` | Live, version-accurate library docs |
| `github` | PRs, issues, code search inside session |
| `figma` | Two-way Code ↔ Canvas |
| `vercel` | One-command deployment |
| `supabase` | Database, auth, storage, edge functions |
| `playwright` | Real browser testing |
| `typescript-lsp` | Real-time TypeScript checking |
| `pyright-lsp` | Real-time Python checking |

### Community plugins

| Plugin | Source | What it does |
|--------|--------|--------------|
| `ui-ux-pro-max` | `nextlevelbuilder/ui-ux-pro-max-skill` | 67 UI styles, 161 palettes, complete design systems |
| `claude-mem` | `thedotmack/claude-mem` | Persistent SQLite + Chroma memory across sessions |

### gStack (Garry Tan / YC)

23+ specialist slash commands acting as CEO, designer, eng manager, QA lead, security officer, release manager. Highlights: `/office-hours`, `/autoplan`, `/cso`, `/qa`, `/ship`, `/land-and-deploy`. See `CLAUDE.md` for the full command list.

### MCP servers

| Server | Tier |
|--------|------|
| `context7` — live library docs | Free |
| `playwright` — real Chrome control | Free |
| `chrome-devtools` — browser inspection | Free |
| `filesystem` — local file access | Free |
| `sequential-thinking` — reasoning chains | Free |
| `puppeteer` — headless browser | Free |
| `fetch` — web content retrieval | Free |
| `brave-search` — real-time web search | API key |
| `firecrawl` — web scraping | API key |
| `github` — full GitHub control | API key (PAT) |

### Design polish pipeline (`ibelick/ui-skills`)

Run after generating any UI:
- `baseline-ui` — spacing, typography, component states
- `fixing-accessibility` — keyboard nav, labels, focus, semantics
- `fixing-motion-performance` — reduced-motion, animation budgets

---

## Permissions Model

`.claude/settings.json` uses a three-tier permission model:

**Allow** (no prompt) — git reads, npm scripts, file reads, find/grep/ls
**Ask** (requires approval) — git push/reset/rebase, rm, sudo, package installs, curl
**Deny** (always blocked) — `.env` files, secrets dirs, SSH keys

---

## Model Defaults

For serious work, start every session with:

```
/model opusplan      # Opus 4.7 plans, Sonnet 4.6 executes
/effort xhigh        # default reasoning depth on Opus 4.7
```

For maximum reasoning on a single turn, include the keyword `ultrathink` in your message. Anthropic explicitly recognizes this keyword and allocates a deeper reasoning budget for that turn.

---

## Sources

Every component in this setup is verified against:
- [Claude Code Plugin docs](https://code.claude.com/docs/en/plugins-reference)
- [Discover plugins](https://code.claude.com/docs/en/discover-plugins)
- [Model config](https://code.claude.com/docs/en/model-config) (opusplan, xhigh, ultrathink)
- [claude.com/plugins](https://claude.com/plugins) (individual plugin pages)
- [github.com/garrytan/gstack](https://github.com/garrytan/gstack) (98.7k stars)
- [github.com/thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) (76.4k stars)
- [github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (79.8k stars)
- [github.com/ibelick/ui-skills](https://github.com/ibelick/ui-skills)
- [MCP servers directory](https://github.com/modelcontextprotocol/servers)
