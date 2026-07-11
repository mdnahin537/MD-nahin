// Workers AI wrapper with the design's fallback chain (§7.2):
//   Workers AI  →  optional OPENROUTER_KEY  →  null (caller uses deterministic).
// Every caller (the micro-interview §5.5, the owner digest §7.2, the Build
// Brief §7.5) must work when this returns null — that's the "AI stubbed
// down, everything still renders instantly" guarantee. In LOCAL dev the AI
// binding is unavailable, so this returns null and the deterministic paths
// take over with zero configuration, which is exactly the tested scenario.

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const OPENROUTER_MODEL = 'meta-llama/llama-3.1-8b-instruct';
const TIMEOUT_MS = 8000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('ai timeout')), ms)),
  ]);
}

/**
 * Run a text prompt through the best available model. Returns the model's
 * text output, or null on ANY failure/unavailability. Never throws.
 *
 * @param {object} opts.system  system prompt (grounding/guardrails)
 * @param {number} opts.maxTokens
 */
export async function runText(env, prompt, { system = '', maxTokens = 400 } = {}) {
  // 1. Workers AI
  if (env.AI && typeof env.AI.run === 'function') {
    try {
      const model = env.AI_TEXT_MODEL || DEFAULT_MODEL;
      const messages = [];
      if (system) messages.push({ role: 'system', content: system });
      messages.push({ role: 'user', content: prompt });
      const res = await withTimeout(env.AI.run(model, { messages, max_tokens: maxTokens }), TIMEOUT_MS);
      const text = res && (res.response || res.result || (res.choices && res.choices[0]?.message?.content));
      if (text && String(text).trim()) return String(text).trim();
    } catch {
      // fall through to OpenRouter / null
    }
  }

  // 2. OpenRouter (optional secret)
  if (env.OPENROUTER_KEY) {
    try {
      const res = await withTimeout(
        fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENROUTER_KEY}` },
          body: JSON.stringify({
            model: env.OPENROUTER_MODEL || OPENROUTER_MODEL,
            messages: [
              ...(system ? [{ role: 'system', content: system }] : []),
              { role: 'user', content: prompt },
            ],
            max_tokens: maxTokens,
          }),
        }),
        TIMEOUT_MS
      );
      if (res.ok) {
        const body = await res.json();
        const text = body.choices?.[0]?.message?.content;
        if (text && text.trim()) return text.trim();
      }
    } catch {
      // fall through to null
    }
  }

  // 3. No AI available — caller falls back to deterministic behavior.
  return null;
}

/**
 * Ask the model for JSON and parse it. Returns the parsed object or null.
 * Tolerant of models that wrap JSON in prose or code fences.
 */
export async function runJson(env, prompt, opts = {}) {
  const text = await runText(env, prompt, opts);
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
