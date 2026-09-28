// Card-reference token format: #[Title](cardId). The id is ground truth -
// the title is only a readability hint for when raw text is visible
// (mid-edit); every renderer must resolve the live title from the id
// instead of trusting it, so a rename of the target just works. A token
// that doesn't fully match (unclosed, missing the (id) part, etc.) is left
// as plain text rather than partially parsed.
const TOKEN_RE = /#\[([^\]]*)\]\(([^)]+)\)/g;

// Splits raw text into an ordered list of segments - plain text and refs -
// each carrying its start/end offset in the raw string. Callers that need
// to map a click back to a raw-text caret position (see CardRefField) rely
// on these offsets being exact slices of `text`, not just character counts.
export const parseCardRefs = (text) => {
  if (typeof text !== 'string' || !text.length) return [];

  const segments = [];
  let lastIndex = 0;
  let match;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text))) {
    const [full, title, id] = match;
    const start = match.index;
    const end = start + full.length;

    if (start > lastIndex) {
      segments.push({ type: 'text', text: text.slice(lastIndex, start), start: lastIndex, end: start });
    }
    segments.push({ type: 'ref', id, title, start, end });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIndex), start: lastIndex, end: text.length });
  }

  return segments;
};

// Builds a token from {id, title}. `]` is stripped from the title hint so
// it can't prematurely close its own token - `(`/`[`/`)` are all fine, the
// parser never looks at the title when finding the id, and its own match
// for the title is non-greedy up to the first `]`.
export const buildCardRefToken = ({ id, title }) => `#[${(title ?? '').replace(/\]/g, '')}](${id})`;

export default parseCardRefs;
