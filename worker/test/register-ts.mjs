// Registers the .ts resolve hook for the test run (see ts-resolve-hook.mjs).
// Used via: node --experimental-strip-types --import ./test/register-ts.mjs --test test/
import { register } from 'node:module';
register('./ts-resolve-hook.mjs', import.meta.url);
