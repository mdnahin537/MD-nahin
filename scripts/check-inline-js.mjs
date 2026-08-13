import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const htmlPath = process.argv[2];

if (!htmlPath) {
  throw new Error('Usage: node scripts/check-inline-js.mjs <html-file>');
}

const html = readFileSync(htmlPath, 'utf8');
// A literal "<script>" appears inside the HTML's security notes. Requiring
// the opening tag at the start of a markup line avoids treating prose as code.
const scriptTag = /^[\t ]*<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gim;
const srcAttribute = /\bsrc\s*=/i;
const typeAttribute = /\btype\s*=\s*(["'])(.*?)\1/i;
const classicTypes = new Set([
  '',
  'text/javascript',
  'application/javascript',
  'application/ecmascript',
  'text/ecmascript',
]);

let inlineCount = 0;
let match;

while ((match = scriptTag.exec(html)) !== null) {
  const attributes = match[1];
  const source = match[2];

  if (srcAttribute.test(attributes)) continue;

  const declaredType = typeAttribute.exec(attributes)?.[2]?.trim().toLowerCase() ?? '';
  if (declaredType === 'module') {
    throw new Error('Inline module scripts require a module-aware syntax validator.');
  }
  if (!classicTypes.has(declaredType)) continue;

  inlineCount += 1;
  new Script(source, {
    filename: `${htmlPath}:inline-script-${inlineCount}`,
    displayErrors: true,
  });
}

if (inlineCount === 0) {
  throw new Error(`No inline JavaScript found in ${htmlPath}`);
}

console.log(`Validated ${inlineCount} inline JavaScript block(s) in ${htmlPath}.`);
