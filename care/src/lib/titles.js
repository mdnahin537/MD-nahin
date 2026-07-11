// Server-side fallback title composer. The wizard (client) computes and
// shows this live as the user taps through B1-B4/I1-I2, and lets them
// edit it (design §5.2 B6: "Auto-composed title preview, editable") — so
// in normal use the client always sends its own (possibly user-edited)
// title. This is the safety net for direct API calls with no title, and
// the reference implementation the client-side copy (public/js/wizard.js)
// mirrors. Kept intentionally tiny (~30 lines) rather than shared via a
// build step, per §8's no-framework/no-build-step stance.

const SYMPTOM_SHORT = {
  nothing_happened: "didn't respond to a click",
  wrong_thing: 'did the wrong thing',
  work_disappeared: "work didn't save",
  display_broken: 'display looks broken',
  froze_crashed: 'froze or crashed',
  slow: 'running slow',
  error_message: 'showed an error',
  something_else: 'something felt off',
  ai_wrong_answer: 'AI gave a bad answer',
  ai_call_failed: 'AI call failed',
  wont_import: "file wouldn't import",
  pdf_missing_content: 'PDF missing content',
  license_wont_activate: "license won't activate",
};

const FREQUENCY_LABEL = { every_time: 'every time', sometimes: 'sometimes', once: 'once' };

export function composeTitle({ type, areaLabel, symptom, frequency, ask }) {
  if (type === 'bug') {
    const symptomText = SYMPTOM_SHORT[symptom] || 'something went wrong';
    const freqText = FREQUENCY_LABEL[frequency];
    return freqText ? `${areaLabel} — ${symptomText} (${freqText})` : `${areaLabel} — ${symptomText}`;
  }
  // idea
  const askTrimmed = (ask || '').trim();
  if (askTrimmed) {
    const short = askTrimmed.length > 70 ? `${askTrimmed.slice(0, 67)}…` : askTrimmed;
    return `${areaLabel} — ${short}`;
  }
  return `${areaLabel} — new idea`;
}
