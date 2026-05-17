# Hunter's Professional Claude Code Studio

A fully configured, research-backed Claude Code environment. Every tool here is real and verified.

---

## What's in This Repo

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project memory — Claude reads this at session start |
| `.claude/settings.json` | Permissions, model config, attribution |
| `scripts/setup-mcps.sh` | One-shot MCP server installer |

---

## Quick Start

### 1. Clone and enter

```bash
git clone https://github.com/mdnahin537/MD-nahin.git
cd MD-nahin
```

### 2. Install MCP servers (run once, from your terminal — not inside Claude)

```bash
bash scripts/setup-mcps.sh
```

For API-key servers (Brave Search, Firecrawl, GitHub), set your keys first:

```bash
export BRAVE_API_KEY=your_key_here
export FIRECRAWL_API_KEY=fc-your_key_here
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
bash scripts/setup-mcps.sh
```

### 3. Launch Claude Code

```bash
claude
```

---

## MCP Servers Included

### No API Key Required

| Server | Package | What it does |
|--------|---------|--------------|
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Structured multi-step reasoning chains |
| `filesystem` | `@modelcontextprotocol/server-filesystem` | Read/write your local files |
| `puppeteer` | `@modelcontextprotocol/server-puppeteer` | Headless browser automation |
| `fetch` | `@kazuph/mcp-fetch` | Retrieve web page content |
| `playwright` | `@playwright/mcp` | Live browser testing with a real Chrome window |
| `context7` | `@upstash/context7-mcp` | Live library docs — eliminates stale API hallucinations |

### Requires API Key

| Server | Get Key | What it does |
|--------|---------|--------------|
| `brave-search` | [brave.com/search/api](https://brave.com/search/api/) | Real-time web search (free tier available) |
| `firecrawl` | [firecrawl.dev](https://www.firecrawl.dev/) | Web scraping & competitor analysis |
| `github` | [github.com/settings/tokens](https://github.com/settings/tokens) | Repos, PRs, issues, CI — bidirectional |

---

## Permissions Model

`.claude/settings.json` uses a three-tier permission model:

**Allow** (no prompt) — safe read-only and standard dev commands:
- All git read operations (`status`, `diff`, `log`, `branch`)
- All `npm run *` scripts
- All file reads
- `find`, `grep`, `ls`, `cat`

**Ask** (requires approval) — consequential operations:
- `git push`, `git reset`, `git rebase`, `git merge`
- `rm`, `sudo`, `chmod`
- Package installs (`npm install`, `pip install`)
- Network requests (`curl`, `wget`)

**Deny** (always blocked):
- Reading `.env` files
- Reading secrets/credentials directories
- Reading SSH keys

---

## Project Memory (CLAUDE.md)

`CLAUDE.md` is automatically loaded by Claude Code at the start of every session.
It contains:
- Coding standards and conventions
- Common commands for this project
- Git workflow rules
- Behaviour guidelines for Claude

Edit it freely — it's yours. Keep it concise: under ~100 lines loads fastest.

---

## What Is NOT Real (Common Misconceptions)

Several "Claude Code setup guides" circulate online with fabricated features:

| Claimed feature | Reality |
|----------------|---------|
| `/plugin install` | No plugin command exists in Claude Code |
| `claude-plugins-official` marketplace | Does not exist |
| `garrytan/gstack` | No such public repo from Garry Tan |
| `npx ui-skills add` | `ui-skills` is not a real npm package |
| `/plugin marketplace add` | Not a real command |

Claude Code's actual extension points are: **MCP servers**, **hooks** in `settings.json`, and **CLAUDE.md** project memory.

---

## Useful Claude Code Commands

```bash
claude                    # start interactive session
claude mcp list           # see installed MCP servers
claude mcp add <name>     # add an MCP server
claude mcp remove <name>  # remove an MCP server
claude doctor             # check installation health
claude update             # update to latest version
/init                     # generate CLAUDE.md from codebase (inside Claude)
/config                   # open config menu (inside Claude)
/help                     # list all slash commands (inside Claude)
```

---

## Further Reading

- [Claude Code Official Docs](https://code.claude.com/docs/en/setup)
- [Settings Reference](https://code.claude.com/docs/en/settings)
- [MCP Protocol](https://github.com/modelcontextprotocol/servers)
- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers)
- [Awesome Claude MCP](https://github.com/win4r/Awesome-Claude-MCP-Servers)
