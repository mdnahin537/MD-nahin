// Headless browser test of RealmWright single-file HTML
// Captures console messages, errors, and screenshots at desktop + mobile.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const FILE_URL = 'file:///home/user/MD-nahin/src/index.html';
const OUT = '/home/user/MD-nahin/artifacts';

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {
    desktop: { console: [], pageErrors: [], requests: [], failedRequests: [] },
    mobile:  { console: [], pageErrors: [], requests: [], failedRequests: [] },
    interactions: {}
  };

  // ── DESKTOP 1440px ─────────────────────────────────────────────────────
  const ctxD = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageD = await ctxD.newPage();
  pageD.on('console', m => report.desktop.console.push({ type: m.type(), text: m.text().slice(0, 400) }));
  pageD.on('pageerror', e => report.desktop.pageErrors.push(String(e).slice(0, 600)));
  pageD.on('requestfailed', r => report.desktop.failedRequests.push({ url: r.url(), reason: r.failure()?.errorText || 'unknown' }));
  pageD.on('request', r => { const u = r.url(); if (!u.startsWith('file://')) report.desktop.requests.push(u); });

  await pageD.goto(FILE_URL, { waitUntil: 'load', timeout: 30000 }).catch(e => report.desktop.pageErrors.push('goto: ' + e.message));
  await pageD.waitForTimeout(2500);
  await pageD.screenshot({ path: path.join(OUT, 'desktop_initial.png'), fullPage: false });

  // Inspect environment
  report.interactions.desktop_init = await pageD.evaluate(() => {
    const out = {};
    try { out.turnstile_present = !!window.turnstile; } catch(e) { out.turnstile_present = 'err:'+e.message; }
    try { out.licenseGate = typeof LicenseGate !== 'undefined'; } catch(e) { out.licenseGate = 'err:'+e.message; }
    try { out.demoCounter_hasKey = (typeof DemoCounter !== 'undefined') ? DemoCounter.hasKey() : 'undef'; } catch(e) { out.demoCounter_hasKey = 'err:'+e.message; }
    try { out.frontDoor_modal = !!document.getElementById('modal-front-door'); } catch(e) {}
    try { out.fd_turnstile = !!document.getElementById('fd-turnstile'); } catch(e) {}
    try { out.LS_PRODUCT_ID = (typeof LS_PRODUCT_ID !== 'undefined') ? LS_PRODUCT_ID : 'undef'; } catch(e) { out.LS_PRODUCT_ID = 'err:'+e.message; }
    try { out.TURNSTILE_SITEKEY = (typeof TURNSTILE_SITEKEY !== 'undefined') ? TURNSTILE_SITEKEY : 'undef'; } catch(e) { out.TURNSTILE_SITEKEY = 'err:'+e.message; }
    try { out.WORKER_URL = (typeof WORKER_URL !== 'undefined') ? WORKER_URL : 'undef'; } catch(e) {}
    try { out.title = document.title; } catch(e) {}
    try { out.body_has_text = document.body.textContent.trim().length > 0; } catch(e) {}
    try {
      const newNationBtn = Array.from(document.querySelectorAll('button,a')).find(el => /new realm|create.*realm|new nation|create.*nation/i.test(el.textContent || ''));
      out.has_new_nation_btn = !!newNationBtn;
      out.new_nation_label = newNationBtn ? newNationBtn.textContent.trim().slice(0,80) : null;
    } catch(e) {}
    try {
      const sliders = Array.from(document.querySelectorAll('input[type=range]'));
      out.slider_count = sliders.length;
      out.slider_first_attrs = sliders[0] ? { min: sliders[0].min, max: sliders[0].max, value: sliders[0].value } : null;
    } catch(e) {}
    return out;
  });

  // Try opening the "create new realm" modal if a button exists
  try {
    // Common modal trigger pattern: data-open="new-nation"
    const opened = await pageD.evaluate(() => {
      const trig = document.querySelector('[data-open="new-nation"], [data-modal="new-nation"]')
        || Array.from(document.querySelectorAll('button')).find(b => /new realm|create realm|create nation|new nation/i.test(b.textContent||''));
      if (trig) { trig.click(); return trig.outerHTML.slice(0,200); }
      return null;
    });
    report.interactions.opened_modal_trigger = opened;
    await pageD.waitForTimeout(600);
    await pageD.screenshot({ path: path.join(OUT, 'desktop_new_realm_attempt.png'), fullPage: false });
    // Inspect modal state
    report.interactions.modal_state = await pageD.evaluate(() => {
      const m = document.getElementById('modal-new-nation') || document.querySelector('.modal.is-open');
      if (!m) return { visible: false };
      const r = m.getBoundingClientRect();
      const cs = getComputedStyle(m);
      return {
        id: m.id,
        visible: r.width > 0 && r.height > 0,
        rect: { w: r.width, h: r.height, x: r.x, y: r.y },
        display: cs.display,
        opacity: cs.opacity,
        classList: Array.from(m.classList),
      };
    });
  } catch (e) {
    report.interactions.opened_modal_trigger_error = e.message;
  }

  // Try moving the first slider (bug #14)
  try {
    const sliderResult = await pageD.evaluate(() => {
      const s = document.querySelector('input[type=range]');
      if (!s) return { found: false };
      const before = s.value;
      const newVal = String(Math.min(parseFloat(s.max||'100'), parseFloat(before)+10));
      s.value = newVal;
      s.dispatchEvent(new Event('input', { bubbles: true }));
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return { found: true, before, after: s.value, id: s.id, name: s.name };
    });
    report.interactions.slider = sliderResult;
  } catch (e) {
    report.interactions.slider_error = e.message;
  }

  // ── MOBILE 375px ───────────────────────────────────────────────────────
  const ctxM = await browser.newContext({ viewport: { width: 375, height: 812 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1' });
  const pageM = await ctxM.newPage();
  pageM.on('console', m => report.mobile.console.push({ type: m.type(), text: m.text().slice(0, 400) }));
  pageM.on('pageerror', e => report.mobile.pageErrors.push(String(e).slice(0, 600)));
  pageM.on('requestfailed', r => report.mobile.failedRequests.push({ url: r.url(), reason: r.failure()?.errorText || 'unknown' }));

  await pageM.goto(FILE_URL, { waitUntil: 'load', timeout: 30000 }).catch(e => report.mobile.pageErrors.push('goto: ' + e.message));
  await pageM.waitForTimeout(2500);
  await pageM.screenshot({ path: path.join(OUT, 'mobile_initial.png'), fullPage: false });

  report.interactions.mobile_init = await pageM.evaluate(() => {
    const out = {};
    try {
      const gate = document.querySelector('.mobile-gate, [class*="mobile-gate"]');
      out.mobile_gate_visible = !!gate && getComputedStyle(gate).display !== 'none';
    } catch(e) {}
    try {
      // Compute body horizontal overflow
      out.body_scroll_w = document.documentElement.scrollWidth;
      out.body_client_w = document.documentElement.clientWidth;
      out.overflow_x = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    } catch(e) {}
    try {
      out.has_hamburger_or_nav = !!document.querySelector('[aria-label*="menu"],[class*="hamburger"],nav');
    } catch(e) {}
    return out;
  });

  await browser.close();
  await writeFile(path.join(OUT, 'browser_test_report.json'), JSON.stringify(report, null, 2));
  // Trim console arrays for stdout summary
  const summary = {
    desktop: {
      console_count: report.desktop.console.length,
      console_errors: report.desktop.console.filter(c => c.type === 'error'),
      console_warnings: report.desktop.console.filter(c => c.type === 'warning').slice(0, 5),
      pageErrors: report.desktop.pageErrors,
      failedRequests: report.desktop.failedRequests,
      external_requests: [...new Set(report.desktop.requests)].slice(0, 20),
    },
    mobile: {
      console_count: report.mobile.console.length,
      console_errors: report.mobile.console.filter(c => c.type === 'error'),
      pageErrors: report.mobile.pageErrors,
      failedRequests: report.mobile.failedRequests,
    },
    interactions: report.interactions,
  };
  console.log(JSON.stringify(summary, null, 2));
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
