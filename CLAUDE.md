# Hunter's Claude Code — Master Operating System
# Version 2.0 | Live Build

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## WHO I AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hunter (MD Nahin) — Dhaka, Bangladesh.

Roles:
- AI automation freelancer (Make.com, n8n, Zapier) — Upwork + LinkedIn clients
- Software product builder (RealmWright, HTML tools)
- Digital product creator (Gumroad via Payoneer — $29 products)
- OpenClaw skill ecosystem builder
- Shop manager and student — limited daily hours

No traditional coding background. Strategy is mine. Execution is AI.
High-quality thinking + AI execution = maximum leverage with minimum time.

HARD CONSTRAINTS — non-negotiable on every task:
- Halal only: no gambling, interest-based finance, adult content, haram verticals
  → Flag any haram adjacency proactively before building anything
- Payments: Gumroad + Payoneer only. Stripe-dependent platforms are non-viable.
- Never commit secrets. Never expose credentials. Always use .env.example.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## REAL INSTALLED TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MCP Servers (install once via: bash scripts/setup-mcps.sh):

  context7           → Live library docs. Use for any npm/pip library questions.
                       Invoke by saying "use context7" in the message.
  playwright         → Real browser testing. Claude controls a live Chrome window.
  filesystem         → Read/write files beyond the project directory.
  sequential-thinking → Multi-step structured reasoning chains.
  puppeteer          → Headless browser automation.
  fetch              → Retrieve web page content.
  brave-search       → Real-time web search. Needs BRAVE_API_KEY.
  firecrawl          → Web scraping and content extraction. Needs FIRECRAWL_API_KEY.
  github             → GitHub API — repos, PRs, issues. Needs GITHUB_PERSONAL_ACCESS_TOKEN.

Skills (real, invoke with /skill-name inside Claude Code):

  /review            → Code review. Run before any commit or client delivery.
  /security-review   → OWASP scan. Run on any auth, payment, or data-handling code.
  /simplify          → Refactor and clean up changed code.
  /init              → Generate CLAUDE.md from an existing codebase.
  /claude-api        → Build or debug Anthropic SDK apps with prompt caching.
  /loop              → Set up a recurring task on an interval.
  /update-config     → Edit settings.json and hooks.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## MEMORY ROUTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLAUDE.md = the single source of permanent memory. No other memory system.

Write here for:
  - Architecture and tech stack decisions
  - Rejected approaches — tag [REJECTED] + reason so they are never repeated
  - Client preferences and business rules
  - Anything that must survive across sessions

Decision tree (run silently at every session start):
  1. CLAUDE.md loaded? → Apply context immediately. Never ask Hunter to repeat it.
  2. Important decision made this session? → Write to CLAUDE.md before the session ends.
  3. Approach rejected? → Tag [REJECTED] in CLAUDE.md with the reason. Now.
  4. Scope unclear? → Do less and ask. Never assume and over-build.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## MODEL & EFFORT SELECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Switch models inside Claude Code with /model:
  claude-opus-4-7    → Architecture, strategy, the hardest problems
  claude-sonnet-4-6  → Default — everyday builds, features, debugging
  claude-haiku-4-5   → Trivial tasks, formatting, quick renames

Effort level (set in settings.json "effortLevel" or state in message):
  low    → Trivial: rename, reformat
  medium → Daily coding, small changes
  high   → Complex debugging, multi-file refactors
  xhigh  → Architecture, security, strategy — DEFAULT for this workspace

Thinking depth (write these words in your message):
  "think"        → Light extended reasoning
  "think harder" → Deeper analysis
  "ultrathink"   → Maximum reasoning budget (32K tokens)
                   Use for: hardest bugs, critical architecture, anything where
                   being wrong is expensive.

Automatic selection rules:
  Strategic decision / architecture     → claude-opus-4-7 + ultrathink
  Normal feature / everyday build       → claude-sonnet-4-6 + xhigh effort
  Simple task (rename, format, small fix) → claude-haiku-4-5 + low effort
  Huge codebase (many files open)       → claude-opus-4-7 (largest context window)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BEHAVIORAL ROUTING — AUTO-TRIGGER RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When Hunter says "build UI" / "make a component" / "design a page"
  → Ask for aesthetic direction if not specified
  → Apply Design System Spec (below)
  → After generation: self-review spacing, accessibility, motion performance

When Hunter says "I have an idea" / "I want to build X"
  → Write a one-paragraph scope brief first
  → Lock architecture before touching code
  → Surface halal check if the domain is ambiguous

When Hunter says "review" / "check my code" / "is this ready"
  → Run /review skill
  → If auth or payments: also run /security-review

When Hunter says "test this" / "open the browser" / "does this work"
  → Use playwright MCP for live browser testing

When Hunter says "research [X]" / "find information on [X]" / "scrape [site]"
  → Use firecrawl MCP (web scraping) or brave-search MCP (search)

When Hunter says "check the docs for [library]"
  → Use context7 MCP explicitly — say "use context7 for [library]"

When Hunter says "deploy"
  → Lint + tests pass first → then push and PR

When Hunter says "I need a database" / "set up storage"
  → Default to Supabase (PostgreSQL). Never store user data in flat files.

When Hunter says "build a Make.com / n8n / Zapier automation"
  → Generate JSON blueprint only
  → Never execute — Hunter pastes and connects accounts himself
  → Document trigger → filter → action chain clearly

When Hunter says "build an OpenClaw skill"
  → Follow openclaw-skill-builder protocol

When Hunter says "loop until done" / "keep going" / "don't stop"
  → Use /loop skill for recurring, or keep iterating autonomously if in-session

When Hunter says "simplify" / "clean this up"
  → Run /simplify skill on changed files

Before ANY git commit or client delivery:
  → /review must pass
  → No hardcoded secrets anywhere
  → /security-review if auth or payments involved


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CODING STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Name things clearly — comments should only explain WHY, never WHAT
- Prefer editing existing files over creating new ones
- No placeholder TODOs in committed code
- Keep functions small and single-purpose
- No backwards-compatibility hacks unless explicitly required
- Validate only at system boundaries (user input, external APIs) — not internally

Git:
- Branch from main: git checkout -b feature/name
- Commit messages: imperative mood ("Add auth middleware" not "Added auth middleware")
- Never force-push to main
- Ask before git reset --hard or any destructive op

Files:
- No .env committed — use .env.example with dummy values
- Secrets in environment variables only
- Generated/build output in .gitignore


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## DESIGN SYSTEM — SPEC-FIRST APPROACH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before building ANY UI, define this spec (customize per project):

```json
{
  "aesthetic": "STATE DIRECTION — brutalist / editorial / luxury / retro-futuristic",
  "typography": {
    "primary": "distinctive display font — NOT Inter, Roboto, or Space Grotesk",
    "body": "readable but characterful",
    "intent": "authoritative / playful / editorial / etc."
  },
  "colors": {
    "surface": "#0a0a0a or your base",
    "accent": "one sharp accent color",
    "rule": "state any forbidden colors — e.g. never safe blue as primary"
  },
  "layout": {
    "anchor": "one dominant visual anchor per screen",
    "grid": "asymmetric — no generic card grid",
    "density": "generous whitespace OR controlled density"
  },
  "motion": "purposeful hierarchy only — no decorative animation for its own sake",
  "forbidden": [
    "generic SaaS card grid",
    "Inter / Roboto / Arial / Space Grotesk as primary font",
    "purple-gradient-on-white AI aesthetic",
    "carousel without narrative purpose",
    "safe blue as primary color"
  ]
}
```

Default for Hunter's products: editorial-dark with one bold accent color.
Every screen must have one dominant visual anchor — no equally-weighted grids.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## COMMON COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```bash
npm run dev          # start dev server
npm run build        # production build
npm run test         # run test suite
npm run lint         # lint check
npm run lint:fix     # auto-fix lint issues
claude mcp list      # see installed MCP servers
claude doctor        # check installation health
```
