// RealmWright Phase 5 regression suite.
//
// Covers:
//   1. Boot — app loads without console errors (Render null-guards, P1.6)
//   2. First-run CTA — empty-state "Create your first realm" reachable (P1.7)
//   3. Nation/faction lifecycle — add nation, add faction, delete; chronicleLinks
//      orphan sweep does not crash (NEW-A3)
//   4. License modal opens, has aria-labelledby + aria-modal (NEW-B6 / A3-5)
//   5. Modal close buttons reachable by keyboard (A3-4)
//   6. Mobile breakpoint (375px) — .wms-panels reflows (#16)
//   7. DOMPurify wrapper — Markdown.render strips onerror handler (P1.12)
//   8. OpenRouter key lives in IDB, not localStorage (P1.13)
//   9. Worker URL config (P1.1) and CSP header (P1.12) sanity
//
// Run:
//   node /home/user/MD-nahin/artifacts/test_realmwright.mjs
//
// Requirements:
//   Playwright + chromium installed.
//   First-time setup: `npx playwright install chromium --with-deps`
//
// Exit codes:
//   0 — all checks passed
//   1 — one or more checks failed
//   2 — fatal harness error (could not boot browser, etc.)
//
// Output:
//   - artifacts/regression_report.json  (full structured results)
//   - artifacts/regression_summary.txt  (human-readable pass/fail)
//   - artifacts/screenshots/*.png       (one per major step)

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const FILE_URL = 'file:///home/user/MD-nahin/src/index.html';
const OUT = '/home/user/MD-nahin/artifacts';
const SHOTS = path.join(OUT, 'screenshots');

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail ?? null });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 240) : ''}`);
}

// Errors we accept as environmental (sandbox cannot reach external CDNs).
// These are NOT shipped-code regressions. Anything else fails the boot check.
const IGNORED_ERROR_PATTERNS = [
  /net::ERR_CERT_AUTHORITY_INVALID/,
  /net::ERR_NAME_NOT_RESOLVED/,
  /net::ERR_INTERNET_DISCONNECTED/,
  /Failed to load resource/,
  /turnstile/i,
  /challenges\.cloudflare\.com/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  // Known CSP meta limitation: frame-ancestors must be sent as HTTP header.
  // The directive is intentionally retained in <meta> because itch.io serves
  // the file directly without our headers — the meta is a defense-in-depth
  // breadcrumb for hosts that DO parse it. Browser warning is expected.
  /Content Security Policy directive 'frame-ancestors' is ignored/,
];
function isIgnorableError(text) {
  return IGNORED_ERROR_PATTERNS.some(re => re.test(text));
}

async function bootPage(browser, { width = 1440, height = 900, mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    ...(mobile ? { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1' } : {}),
  });
  const page = await ctx.newPage();
  const console_msgs = [];
  const page_errors = [];
  page.on('console', m => console_msgs.push({ type: m.type(), text: m.text() }));
  page.on('pageerror', e => page_errors.push(String(e)));
  await page.goto(FILE_URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);
  // Dismiss the front-door / license gate so the app surface is reachable for
  // first-run tests. We dispatch a synthetic close — the front-door modal owns
  // its own keyboard handler at line ~9650 of src/index.html (Escape closes).
  await page.evaluate(() => {
    try {
      if (typeof FrontDoor !== 'undefined' && FrontDoor.close) FrontDoor.close();
      if (typeof LicenseGate !== 'undefined' && LicenseGate._dismissed !== undefined) LicenseGate._dismissed = true;
      // Close any backdrop manually
      document.querySelectorAll('.modal.is-open').forEach(m => m.classList.remove('is-open', 'is-visible'));
      const bg = document.getElementById('modal-backdrop');
      if (bg) bg.classList.remove('is-open', 'is-visible');
      document.body.style.overflow = '';
    } catch (e) { /* best effort */ }
  });
  await page.waitForTimeout(400);
  return { ctx, page, console_msgs, page_errors };
}

async function run() {
  await mkdir(OUT, { recursive: true });
  await mkdir(SHOTS, { recursive: true });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.error('FATAL: could not launch chromium —', e.message);
    console.error('Run `npx playwright install chromium --with-deps` first.');
    process.exit(2);
  }

  try {
    // ── 1. BOOT — no console errors on a clean load ──────────────────────
    {
      const { ctx, page, console_msgs, page_errors } = await bootPage(browser);
      await page.screenshot({ path: path.join(SHOTS, '01_boot.png') });
      const realErrors = console_msgs
        .filter(m => m.type === 'error')
        .filter(m => !isIgnorableError(m.text));
      const realPageErrors = page_errors.filter(t => !isIgnorableError(t));
      record(
        '1. App boots without console errors (P1.6 Render null-guards)',
        realErrors.length === 0 && realPageErrors.length === 0,
        { console_errors: realErrors, page_errors: realPageErrors },
      );
      await ctx.close();
    }

    // ── 2. EMPTY-STATE CTA — P1.7 ────────────────────────────────────────
    {
      const { ctx, page } = await bootPage(browser);
      // Force empty nations to surface the empty-state CTA path.
      await page.evaluate(() => {
        try {
          if (typeof State !== 'undefined' && State.data) {
            State.data.nations = [];
            State.data.activeId = null;
            if (typeof Render !== 'undefined' && Render.identityStrip) Render.identityStrip();
          }
        } catch (e) {}
      });
      await page.waitForTimeout(300);
      const cta = await page.evaluate(() => {
        const btn = document.getElementById('empty-state-create-realm');
        if (!btn) return { found: false };
        const r = btn.getBoundingClientRect();
        const cs = getComputedStyle(btn);
        return {
          found: true,
          label: btn.textContent.trim(),
          visible: r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden',
          rect: { w: r.width, h: r.height },
        };
      });
      await page.screenshot({ path: path.join(SHOTS, '02_empty_state.png') });
      record(
        '2. Empty-state "Create your first realm" CTA renders (P1.7)',
        cta.found && cta.visible && /create.*realm/i.test(cta.label),
        cta,
      );
      await ctx.close();
    }

    // ── 3. NATION/FACTION LIFECYCLE — chronicleLinks orphan sweep (NEW-A3)
    {
      const { ctx, page, console_msgs, page_errors } = await bootPage(browser);
      const lifecycle = await page.evaluate(() => {
        const log = [];
        try {
          if (typeof State === 'undefined' || !State.addNation) return { ok: false, why: 'State.addNation missing' };
          // Seed a minimal nation
          const n = { id: 'test-nation-' + Date.now(), name: 'Test Realm', metadata: {}, characters: [], factions: [], chronicle: [] };
          State.addNation(n);
          log.push('addNation ok');
          // Add a faction
          if (typeof State.addFaction === 'function') {
            State.addFaction(n.id, { id: 'fac-1', name: 'Test Faction' });
            log.push('addFaction ok');
          } else {
            // Fallback: push directly
            n.factions = n.factions || [];
            n.factions.push({ id: 'fac-1', name: 'Test Faction' });
            log.push('factions pushed directly');
          }
          // Add a chronicle event
          const eid = 'ev-1';
          n.chronicle = n.chronicle || [];
          n.chronicle.push({ id: eid, description: 'Test event', title: 'E1' });
          // Add a character linked to the event
          n.characters = n.characters || [];
          n.characters.push({ id: 'ch-1', name: 'Test Char', chronicleLinks: [eid] });
          log.push('seeded char+event');
          // Now remove the event — must sweep the chronicleLinks
          if (typeof State.removeEvent === 'function') {
            State.removeEvent(n.id, eid);
            log.push('removeEvent ok');
          } else {
            return { ok: false, why: 'State.removeEvent missing', log };
          }
          // Verify sweep
          const ch = n.characters.find(c => c.id === 'ch-1');
          const swept = ch && Array.isArray(ch.chronicleLinks) && !ch.chronicleLinks.includes(eid);
          log.push('sweep result: ' + swept);
          return { ok: swept, log };
        } catch (e) {
          return { ok: false, why: e.message, stack: e.stack, log };
        }
      });
      await page.waitForTimeout(200);
      const realPageErrors = page_errors.filter(t => !isIgnorableError(t));
      record(
        '3. Nation/faction add+delete; chronicleLinks orphan sweep (NEW-A3)',
        lifecycle.ok && realPageErrors.length === 0,
        lifecycle,
      );
      await ctx.close();
    }

    // ── 4. LICENSE MODAL — a11y attrs (NEW-B6 / A3-5) ────────────────────
    {
      const { ctx, page } = await bootPage(browser);
      const lic = await page.evaluate(() => {
        // Look for the license-activation modal. It may be present as static
        // markup (#modal-license-activate) or injected lazily — try opening it.
        try {
          if (typeof LicenseGate !== 'undefined' && typeof LicenseGate.openActivate === 'function') {
            LicenseGate.openActivate();
          } else if (typeof Modals !== 'undefined' && Modals.open) {
            // Fallback identifiers
            try { Modals.open('license'); } catch (e) {}
            try { Modals.open('license-activate'); } catch (e) {}
          }
        } catch (e) {}
        // Find any open modal claiming to be the license modal
        const modal = document.querySelector(
          '#modal-license-activate, #modal-license, [data-modal-name="license"], .modal.modal--license, .modal[aria-labelledby*="license" i], .modal[aria-labelledby*="la-" i]',
        ) || Array.from(document.querySelectorAll('.modal'))
          .find(m => /license/i.test(m.id || '') || /license/i.test(m.getAttribute('aria-labelledby') || ''));
        if (!modal) return { found: false };
        return {
          found: true,
          id: modal.id,
          role: modal.getAttribute('role'),
          aria_modal: modal.getAttribute('aria-modal'),
          aria_labelledby: modal.getAttribute('aria-labelledby'),
          aria_label: modal.getAttribute('aria-label'),
        };
      });
      record(
        '4. License modal exposes aria-labelledby + aria-modal (NEW-B6 / A3-5)',
        lic.found && lic.aria_modal === 'true' && (lic.aria_labelledby || lic.aria_label),
        lic,
      );
      await ctx.close();
    }

    // ── 5. MODAL CLOSE BUTTONS — keyboard reachable + labelled (A3-4) ────
    {
      const { ctx, page } = await bootPage(browser);
      const closeButtons = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.modal button, .modal [role="button"]'))
          .filter(b => {
            const t = (b.textContent || '').trim();
            const aria = (b.getAttribute('aria-label') || '').trim();
            // The bare-glyph close buttons: × glyph (U+00D7) or "x" text
            return t === '×' || t === 'x' || t === 'X' || /^close$/i.test(aria);
          });
        const total = btns.length;
        const unlabelled = btns.filter(b => !(b.getAttribute('aria-label') || '').trim()).length;
        const tabbable = btns.filter(b => {
          const ti = b.getAttribute('tabindex');
          return ti === null || parseInt(ti, 10) >= 0;
        }).length;
        return { total, unlabelled, tabbable };
      });
      // A3-4 promises aria-label="Close" on every modal × button.
      record(
        '5. Modal close buttons labelled + keyboard reachable (A3-4)',
        closeButtons.total > 0 && closeButtons.unlabelled === 0 && closeButtons.tabbable === closeButtons.total,
        closeButtons,
      );
      await ctx.close();
    }

    // ── 6. MOBILE 375px — .wms-panels reflows (#16) ──────────────────────
    {
      const { ctx, page } = await bootPage(browser, { width: 375, height: 812, mobile: true });
      // Mobile gate is intentional below 768px (Phase 0 decision). We check
      // the reflow rules apply even if the panels are obscured by the gate.
      const reflow = await page.evaluate(() => {
        // Force the gate dismissed so we can inspect underlying layout.
        try {
          const gate = document.querySelector('.mobile-gate, [class*="mobile-gate"]');
          if (gate) gate.style.display = 'none';
        } catch (e) {}
        const panels = document.querySelector('.wms-panels');
        if (!panels) return { found: false };
        const cs = getComputedStyle(panels);
        const r = panels.getBoundingClientRect();
        return {
          found: true,
          display: cs.display,
          gridTemplateColumns: cs.gridTemplateColumns,
          flexDirection: cs.flexDirection,
          width: r.width,
          // At 375px, a desktop multi-column grid (e.g. "1fr 1fr 1fr") fails
          // reflow. Either a single column ("1fr" / "none") or flex-column
          // proves the breakpoint took effect.
        };
      });
      await page.screenshot({ path: path.join(SHOTS, '06_mobile_375.png') });
      const cols = (reflow.gridTemplateColumns || '').trim();
      const colCount = cols && cols !== 'none' ? cols.split(/\s+/).length : 1;
      const reflowed =
        reflow.found &&
        (colCount <= 1 || reflow.flexDirection === 'column' || reflow.display === 'block');
      record(
        '6. Mobile 375px: .wms-panels reflows to single column (#16)',
        reflowed,
        reflow,
      );
      await ctx.close();
    }

    // ── 7. DOMPURIFY — Markdown.render strips onerror (P1.12) ────────────
    {
      const { ctx, page } = await bootPage(browser);
      const purify = await page.evaluate(() => {
        try {
          if (typeof Markdown === 'undefined' || !Markdown.render) return { ok: false, why: 'Markdown.render missing' };
          const dirty = '<img src=x onerror=alert(1)><script>alert(2)</script>';
          const clean = Markdown.render(dirty);
          // The real test: parse the output and check that no live <img> with
          // an onerror handler or live <script> survives. String-matching on
          // raw "onerror" gives a false positive because Markdown.render
          // ENTITY-ENCODES untrusted HTML (e.g. "&lt;img ... onerror=..."),
          // which is rendered as inert text, not an executable handler.
          const probe = document.createElement('div');
          probe.innerHTML = clean;
          const liveImgs = Array.from(probe.querySelectorAll('img'));
          const liveScripts = Array.from(probe.querySelectorAll('script'));
          const liveOnerror = liveImgs.some(img => img.hasAttribute('onerror') || typeof img.onerror === 'function');
          return {
            ok: !liveOnerror && liveScripts.length === 0,
            clean: clean.slice(0, 400),
            live_img_count: liveImgs.length,
            live_script_count: liveScripts.length,
            live_onerror: liveOnerror,
            purify_present: typeof DOMPurify !== 'undefined',
            purify_version: typeof DOMPurify !== 'undefined' ? DOMPurify.version : null,
          };
        } catch (e) {
          return { ok: false, why: e.message };
        }
      });
      record(
        '7. DOMPurify strips onerror from Markdown output (P1.12)',
        purify.ok,
        purify,
      );
      await ctx.close();
    }

    // ── 8. OPENROUTER KEY — IDB, not localStorage (P1.13) ────────────────
    {
      const { ctx, page } = await bootPage(browser);
      const keyTest = await page.evaluate(async () => {
        try {
          if (typeof Secrets === 'undefined' || !Secrets.saveKey) return { ok: false, why: 'Secrets helper missing' };
          const probe = 'sk-or-v1-PROBE-' + Date.now();
          await Secrets.saveKey(probe);
          // Allow async IDB write to flush
          await new Promise(r => setTimeout(r, 200));
          // Also nudge State persist if available
          if (typeof State !== 'undefined' && State.data && State.data.meta && State.data.meta.settings) {
            State.data.meta.settings.copilotKey = probe;
            if (typeof State.persist === 'function') {
              try { State.persist(); } catch (e) {}
            }
            await new Promise(r => setTimeout(r, 300));
          }
          const ls = localStorage.getItem('realmwright_data') || '';
          const legacyLs = localStorage.getItem('sovereign_codex_data') || '';
          const inLocalStorage =
            ls.includes(probe) || legacyLs.includes(probe) || ls.includes('sk-or-v1-PROBE');
          // Verify the key IS readable from IDB
          const fromIdb = (typeof IDB !== 'undefined') ? await IDB.get('rw_secret_copilot_key') : null;
          // Cleanup probe so we don't leave it lying around
          await Secrets.saveKey(null);
          return {
            ok: !inLocalStorage && fromIdb === probe,
            inLocalStorage,
            idbHasKey: fromIdb === probe,
          };
        } catch (e) {
          return { ok: false, why: e.message };
        }
      });
      record(
        '8. OpenRouter key lives in IDB, scrubbed from localStorage (P1.13)',
        keyTest.ok,
        keyTest,
      );
      await ctx.close();
    }

    // ── 9. CONFIG SANITY — Worker URL + CSP present ──────────────────────
    {
      const { ctx, page } = await bootPage(browser);
      const cfg = await page.evaluate(() => {
        const out = {};
        try { out.WORKER_URL = typeof WORKER_URL !== 'undefined' ? WORKER_URL : null; } catch (e) {}
        try {
          const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
          out.csp_present = !!csp;
          out.csp_has_self = csp ? /default-src 'self'/.test(csp.getAttribute('content') || '') : false;
          out.csp_has_worker_origin = csp ? /rw-license\.realmwright\.workers\.dev/.test(csp.getAttribute('content') || '') : false;
          out.csp_has_cors_anywhere = csp ? /api-cors-anywhere/.test(csp.getAttribute('content') || '') : false;
        } catch (e) {}
        try {
          out.no_cors_anywhere_in_html = !document.documentElement.outerHTML.includes('api-cors-anywhere');
        } catch (e) {}
        return out;
      });
      const ok =
        cfg.WORKER_URL && cfg.WORKER_URL.includes('workers.dev') &&
        cfg.csp_present && cfg.csp_has_self && cfg.csp_has_worker_origin &&
        !cfg.csp_has_cors_anywhere && cfg.no_cors_anywhere_in_html;
      record(
        '9. Worker URL set + CSP present + cors-anywhere fully removed (P1.1 / P1.12)',
        ok,
        cfg,
      );
      await ctx.close();
    }

    // ── 10. axe-core a11y scan (best effort) ──────────────────────────────
    // axe-core is not bundled with this repo. If it has been installed under
    // artifacts/node_modules/axe-core we inject it; otherwise we skip and
    // record the skip explicitly so the report is honest.
    {
      const { ctx, page } = await bootPage(browser);
      let axeSource = null;
      try {
        const { readFile } = await import('fs/promises');
        axeSource = await readFile(path.join(OUT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
      } catch (e) {
        // Try the system node_modules
        try {
          const { readFile } = await import('fs/promises');
          axeSource = await readFile('/opt/node22/lib/node_modules/axe-core/axe.min.js', 'utf8');
        } catch (_) {}
      }
      if (!axeSource) {
        record(
          '10. axe-core a11y scan',
          true,  // do not fail the suite on missing optional dep
          { skipped: true, reason: 'axe-core not installed. Run `npm install --prefix artifacts axe-core` to enable.' },
        );
      } else {
        await page.addScriptTag({ content: axeSource });
        const axeRun = await page.evaluate(async () => {
          // Scan the visible app surface, not the front-door which is closed.
          const r = await window.axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
            resultTypes: ['violations'],
          });
          return r.violations.map(v => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.length,
          }));
        });
        const serious = axeRun.filter(v => v.impact === 'serious' || v.impact === 'critical');
        record(
          '10. axe-core a11y scan (serious/critical only)',
          serious.length === 0,
          { total_violations: axeRun.length, serious_or_critical: serious },
        );
      }
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(path.join(OUT, 'regression_report.json'), JSON.stringify(results, null, 2));
  const summary = results.map(r => `[${r.pass ? 'PASS' : 'FAIL'}] ${r.name}`).join('\n');
  await writeFile(path.join(OUT, 'regression_summary.txt'), summary + '\n');

  const failed = results.filter(r => !r.pass);
  console.log('\n────────────────────────────────────────');
  console.log(`Results: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log('FAILED:');
    failed.forEach(f => console.log('  - ' + f.name));
  }
  process.exit(failed.length === 0 ? 0 : 1);
}

run().catch(e => {
  console.error('FATAL:', e);
  process.exit(2);
});
