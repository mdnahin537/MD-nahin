// ESM resolve hook so Node's --experimental-strip-types loader can follow the
// source's extensionless relative imports (e.g. `import './cors'`). The source
// keeps them extensionless because the Cloudflare/wrangler bundler resolves them
// that way; Node's loader needs the explicit `.ts`. This hook bridges the two so
// the tests run the REAL adapter code unchanged.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier) && context.parentURL) {
    try {
      const base = new URL(specifier, context.parentURL);
      const tsURL = new URL(base.href + '.ts');
      if (existsSync(fileURLToPath(tsURL))) {
        return next(specifier + '.ts', context);
      }
    } catch {
      /* fall through to default resolution */
    }
  }
  return next(specifier, context);
}
