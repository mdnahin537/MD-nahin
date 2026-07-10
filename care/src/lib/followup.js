// The post-submit micro-interview (design §5.5, §11 resolution). The report
// is ALREADY saved when this runs — this only ever adds optional, tap-only
// enrichment on the confirmation screen. Rules held firm: tap-only, at most
// 2 questions ever, always skippable, never on the critical path, and if AI
// is unavailable the deterministic gap table still yields (or cleanly yields
// nothing). AI, when present, only rephrases — it never invents the gap.

// Deterministic gap table: given the structured report, find the single most
// valuable missing piece and offer tap options for it. Ordered by value; the
// first match wins. Each entry: { q (key), prompt, options:[{key,label}] }.
function detectGaps(payload) {
  const gaps = [];
  const area = payload.area;
  const part = payload.part;
  const vaguePart = !part || part === 'not-sure' || part === 'other';

  if (area === 'exports-data' && vaguePart) {
    gaps.push({
      q: 'which_export',
      prompt: 'Which export was it?',
      options: [
        { key: 'story_bible_pdf', label: 'Story Bible PDF' },
        { key: 'session_prep_pdf', label: 'Session Prep PDF' },
        { key: 'foundry', label: 'Foundry VTT' },
        { key: 'json', label: 'JSON' },
        { key: 'dont_know', label: 'Don’t know' },
      ],
    });
  }

  if (area === 'ai' && (payload.part === 'generator' || vaguePart)) {
    gaps.push({
      q: 'which_generator',
      prompt: 'Which generator was involved?',
      options: [
        { key: 'session_prep', label: 'Session Prep' },
        { key: 'strong_start', label: 'Strong Start' },
        { key: 'encounter', label: 'Encounter' },
        { key: 'names', label: 'Names' },
        { key: 'other', label: 'Another one' },
        { key: 'dont_know', label: 'Don’t know' },
      ],
    });
  }

  if (area === 'license-setup' && payload.symptom === 'license_wont_activate') {
    gaps.push({
      q: 'license_step',
      prompt: 'Where did activation stop?',
      options: [
        { key: 'entering_key', label: 'Entering the key' },
        { key: 'after_entering', label: 'Right after I entered it' },
        { key: 'never_prompted', label: 'It never asked me' },
        { key: 'dont_know', label: 'Not sure' },
      ],
    });
  }

  // Bug with no expected/actual AND no freetext: one tap to place the moment.
  if (
    payload.type === 'bug' &&
    !payload.expected && !payload.actual && !payload.freetext &&
    payload.symptom && payload.symptom !== 'work_disappeared' // that one already asks inline (B3)
  ) {
    gaps.push({
      q: 'when_moment',
      prompt: 'When did it happen?',
      options: [
        { key: 'right_away', label: 'Right when I opened it' },
        { key: 'mid_task', label: 'In the middle of working' },
        { key: 'on_save_export', label: 'When saving or exporting' },
        { key: 'random', label: 'Seemed random' },
      ],
    });
  }

  // Idea with importance but no "why": one tap for the payoff shape.
  if (payload.type === 'idea' && !payload.why) {
    gaps.push({
      q: 'idea_payoff',
      prompt: 'What would this help with most?',
      options: [
        { key: 'save_time', label: 'Saving prep time' },
        { key: 'at_the_table', label: 'Running the table live' },
        { key: 'organize', label: 'Keeping my world organized' },
        { key: 'quality', label: 'Better-quality results' },
      ],
    });
  }

  return gaps;
}

/**
 * Build the micro-interview question for a saved report. `alreadyAsked` is the
 * list of question keys already answered (so we never repeat and never exceed
 * 2 total). Returns { question } or { question: null }.
 *
 * The AI layer (when available) only rewrites the prompt wording to feel warm
 * and specific; the question KEY and the tap OPTIONS are always the
 * deterministic ones, so a hallucination can never change what we store or
 * offer. Feature-flagged by FEATURE_MICRO_INTERVIEW.
 */
export async function buildFollowupQuestion(env, payload, alreadyAsked, runText) {
  if (env.FEATURE_MICRO_INTERVIEW !== 'true') return { question: null };
  if ((alreadyAsked || []).length >= 2) return { question: null };

  const gaps = detectGaps(payload).filter((g) => !alreadyAsked.includes(g.q));
  if (gaps.length === 0) return { question: null };

  const gap = gaps[0];

  // Optional AI rephrasing — never blocks, never changes the options/key.
  if (runText) {
    try {
      const phrased = await runText(
        env,
        `Rewrite this one short question to sound warm and natural for a tabletop game master, 12 words max, no preamble, keep the meaning exactly: "${gap.prompt}"`,
        { system: 'You rephrase a single UI question. Output only the rewritten question, nothing else.', maxTokens: 40 }
      );
      if (phrased && phrased.length <= 120) {
        gap.prompt = phrased.replace(/^["']|["']$/g, '').trim();
      }
    } catch {
      // keep the deterministic prompt
    }
  }

  return { question: gap };
}

export { detectGaps };
