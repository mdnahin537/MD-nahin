# RealmWright — Community Care

The engine of customer-driven development for RealmWright: game masters report
bugs and request features, the ranking turns that into a public roadmap, and the
private **Owner Desk** turns it into your build list. It runs on **one free
Cloudflare account** and costs **$0/month** with no server to maintain.

- **Board** (public): `https://<your-host>/` — read with no login.
- **Report a problem or idea** (the wizard): `https://<your-host>/report/`
- **Owner Desk** (only you): `https://<your-host>/desk` — invisible to everyone else.

Everything is plain HTML/CSS/JS and a single Cloudflare Worker. No build step, no
framework. The whole thing is `wrangler deploy`.

---

## What you're looking at

```
care/
  wrangler.toml         Cloudflare config (you edit two lines: host name + Google client id)
  migrations/           the database tables (applied once with one command)
  public/               every page the browser loads (board, wizard, item, desk, privacy)
  src/                  the Worker (API, login, ranking, desk) — you don't edit this
  scripts/
    seed.mjs            fills a LOCAL test database with fake data (never touches production)
    mock-google.mjs     a fake Google, for local testing only (never deployed)
```

---

## Part A — Try it on your own computer first (no accounts needed)

You can run the whole thing locally with fake data before you ever touch
Cloudflare or Google. This is the safest way to see it work.

1. Install Node.js (nodejs.org, the "LTS" button) if you don't have it.
2. In a terminal, from the `care/` folder:
   ```
   npm install
   npm run migrate:local        # creates the local test database
   npm run seed:local           # OR: node scripts/seed.mjs 200   (fills it with fake data)
   ```
3. In one terminal window, start the fake Google (for testing login locally):
   ```
   npm run mock-google
   ```
4. In another terminal window, start the site:
   ```
   npm run dev
   ```
5. Open `http://localhost:8787/` — that's your board. `/report/` is the wizard.
   To see the Owner Desk locally, the fake login needs to sign you in as the
   owner; the local `.dev.vars` file already sets `OWNER_SUB=mock-owner-sub-001`
   for exactly this.

`node scripts/seed.mjs 10` (tiny), `200` (a realistic desk), or `5000` (stress
test) all work. Local data is completely separate from anything you deploy.

---

## Part B — Go live (about 30 minutes, one time)

You'll create **two free accounts** and paste a handful of values. You never
share a password with this project — only scoped, revocable tokens.

### Step 1 — Create a fresh Cloudflare account

1. Go to **dash.cloudflare.com** and sign up with an email **separate from your
   money/licensing account** (keeping the two apart is deliberate).
2. That's all you need here for now. You do **not** need to buy anything.

### Step 2 — Install the deploy tool and log in

From the `care/` folder on your computer:
```
npm install
npx wrangler login          # opens your browser, click "Allow"
```
This authorizes the tool for this one account. (If you'd rather not use the
browser login, you can instead create a **scoped API token** at
Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers" template, and
run `npx wrangler` with that token in the `CLOUDFLARE_API_TOKEN` environment
variable. Either way, never paste your Cloudflare **password** anywhere.)

### Step 3 — Create the database

```
npx wrangler d1 create realmwright-care
```
It prints a block like:
```
[[d1_databases]]
binding = "DB"
database_name = "realmwright-care"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
Open **`care/wrangler.toml`** and replace the placeholder `database_id`
(`00000000-0000-0000-0000-000000000000`) with the real `database_id` it printed.

Then create the tables in the real database:
```
npm run migrate:remote
```

### Step 4 — Create the Google sign-in

1. Go to **console.cloud.google.com** (free, no card).
2. Create a new project (top bar → "New Project"), name it anything.
3. Left menu → **APIs & Services → OAuth consent screen**:
   - User type: **External**, then **Create**.
   - Fill the app name (e.g. "RealmWright Community"), your email, save.
   - On the "Publishing status" screen, click **Publish app** (so anyone can
     sign in, not just test users).
4. Left menu → **APIs & Services → Credentials → Create Credentials → OAuth
   client ID**:
   - Application type: **Web application**.
   - Under **Authorized redirect URIs**, add exactly:
     `https://<your-host>/auth/callback`
     (You'll know `<your-host>` after Step 5's first deploy — it's your
     `*.workers.dev` address. It's fine to deploy once first, copy the address,
     then come back and add it here.)
   - Click **Create**. Google shows a **Client ID** and a **Client secret** —
     keep this tab open for the next two steps.
5. Open **`care/wrangler.toml`** and set `GOOGLE_CLIENT_ID` to the Client ID
   (the Client ID is not secret — it's visible in the browser during login
   either way, so it lives in the config file, not the secret store).
6. While you have `care/wrangler.toml` open, set **`CONTACT_EMAIL`** to the
   address you want the **Privacy & terms** page to link to for questions and
   data-deletion requests (e.g. `CONTACT_EMAIL = "you@yourdomain.com"`). It is
   not a secret — it's meant to be public — so it lives here, not in the secret
   store. If you leave it empty, the privacy page still works; it just shows a
   plain "the address on our store page" placeholder instead of a live mailto
   link. (Use an address you're comfortable publishing.)

### Step 5 — Deploy, then set your secrets

Deploy once to get your address:
```
npm run deploy
```
It prints your live URL, e.g. `https://realmwright-care.<you>.workers.dev`.
That address is your `<your-host>`. Go back to **Step 4.4** and make sure the
redirect URI uses this exact address, and re-check `SITE` values if you set any.

Now set the four secrets (these are stored encrypted by Cloudflare, never in the
repo). Run each line and paste the value when asked:
```
npx wrangler secret put GOOGLE_CLIENT_SECRET   # the Client secret from Google (Step 4.4)
npx wrangler secret put SESSION_SECRET         # a long random string — see below
npx wrangler secret put OWNER_SUB              # YOUR Google account id — see below
```
- **`SESSION_SECRET`** — any long random string; it signs login cookies. Generate
  one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  and paste the output.
- **`OWNER_SUB`** — this is the Google user id that makes the Owner Desk yours.
  The easiest way to get it: after deploying, visit `https://<your-host>/report/`,
  sign in with **your** Google account, then visit `https://<your-host>/api/me`.
  It won't show your id directly, so instead run this once against your database
  to see the `sub` of the account that just logged in:
  ```
  npx wrangler d1 execute realmwright-care --remote --command "SELECT sub, name, email FROM users ORDER BY created_at DESC LIMIT 5;"
  ```
  Find your name in the list, copy its `sub` value, and use it for `OWNER_SUB`.
  Then deploy again so it takes effect: `npm run deploy`.

Optional secret (only if you want AI digests when Cloudflare's built-in AI is
unavailable):
```
npx wrangler secret put OPENROUTER_KEY          # optional — a fallback AI provider key
```
The desk works fully without it — the digest and Build Brief are computed from
your data with no AI at all; AI only adds one summary sentence per hot thread.

### Step 6 — Final deploy and check

```
npm run deploy
```
- Visit `/` — the board (empty at first; that's expected).
- Visit `/report/` — file a couple of your own known bugs to seed it warm.
- Visit `/desk` — your cockpit. Anyone else who visits `/desk` sees a plain
  "not found" page; it's invisible, not just locked.

---

## What each secret is for (quick reference)

| Name | Where it's set | What it does | Secret? |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | `wrangler.toml` | identifies your app to Google | no (public by design) |
| `GOOGLE_CLIENT_SECRET` | `wrangler secret put` | proves your app to Google during login | **yes** |
| `SESSION_SECRET` | `wrangler secret put` | signs the login cookie so it can't be forged | **yes** |
| `OWNER_SUB` | `wrangler secret put` | your Google id — unlocks the Owner Desk for you only | **yes** |
| `OPENROUTER_KEY` | `wrangler secret put` | optional fallback AI for desk digests | **yes**, optional |
| `database_id` | `wrangler.toml` | points the Worker at your D1 database | no |

Never commit real secrets. `care/.dev.vars` (local dummies) is gitignored;
`care/.dev.vars.example` shows the shape with fake values.

---

## Everyday operations

- **Deploy an update:** `npm run deploy`
- **Back up the database (monthly is plenty):**
  `npx wrangler d1 export realmwright-care --remote --output backup-YYYY-MM-DD.sql`
  (Cloudflare also keeps automatic point-in-time restore for D1.)
- **Add real blocklist words before launch:** edit
  `src/data/blocklist.json` (plain lowercase phrases), then `npm run deploy`.
  A match hides the post from public view and queues it in the desk — it never
  auto-rejects. (It lives under `src/`, not `public/`, on purpose — anything
  under `public/` is servable directly by URL, and the list itself shouldn't
  be readable by whoever it's meant to catch.)
- **Free-tier headroom:** the Owner Desk header shows today's usage. The board
  feed is edge-cached, and every page is a static asset, so even a big traffic
  spike costs almost nothing.

---

## Still to wire up (needs the live board URL — do after Part B)

These were intentionally left for after you have a live address:

1. **The two buttons inside RealmWright itself.** In `realmwright-v7.html`, a new
   "Community" section in Settings gets two rows — "Find a problem or new idea"
   (opens `/report/`) and "See what people are saying" (opens `/`) — plus the
   quiet disclosure line and the offline toast. That change lives on the product
   branch and needs your live `<your-host>` URL, so it's deliberately not in this
   folder yet.
2. **Seed it warm.** File your first few known bugs/ideas and mark genuinely
   shipped work "shipped" so the board looks alive on day one.
3. **Put the board URL on your itch.io and Lemon Squeezy pages** as living
   "we listen" proof.

---

## For the curious: how it stays free and fast

- Every **page** is a static asset (unlimited, free); only `/api/*`, `/auth/*`,
  and `/desk` run the Worker.
- The **board feed** is edge-cached for 60 seconds, so 50,000 readers cost about
  one computation per minute.
- The **ranking** uses score *bands* (an item must double its net to change
  band), so a single vote almost never reshuffles the list — and net-negative
  items can never sit above accepted ones.
- The **wizard** turns navigation into data: a complete bug report is six taps
  and zero typing.
- The **desk** is deterministic first — it works with zero AI; AI only makes it
  sing.
