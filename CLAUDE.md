# Hunter's Claude Code Studio — Project Memory

## Identity
This is MD-nahin: Hunter's professional development workspace configured for Claude Code.

## Stack & Tools
- Runtime: Node.js / Python (project-dependent)
- Version control: Git + GitHub (via MCP)
- Package managers: npm / pip
- Code quality: ESLint, Prettier, TypeScript where applicable

## Coding Standards
- No trailing comments explaining *what* code does — name things clearly instead
- Prefer editing existing files over creating new ones
- No placeholder TODOs in committed code
- Keep functions small and single-purpose
- Commit messages: imperative mood, concise ("Add auth middleware" not "Added auth middleware")

## Common Commands
```bash
npm run dev          # start dev server
npm run build        # production build
npm run test         # run test suite
npm run lint         # lint check
npm run lint:fix     # auto-fix lint issues
git status           # always check before committing
```

## Git Workflow
- Branch from `main` for features: `git checkout -b feature/name`
- Always run lint + tests before pushing
- Never force-push to `main`
- Ask before any `git reset --hard` or destructive ops

## File Conventions
- No `.env` files committed — use `.env.example` with dummy values
- Secrets live in environment variables, never in source code
- Large generated files go in `.gitignore`

## Claude Behaviour
- Be direct and concise
- Don't pad responses with filler
- Ask before doing anything irreversible
- Prefer parallel tool calls when tasks are independent
- When in doubt about scope, do less and ask
