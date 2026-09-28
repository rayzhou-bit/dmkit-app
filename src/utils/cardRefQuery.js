// Finds the "#query" span the caret currently sits inside, i.e. whether
// typing a card-reference picker should be open right now. A `#` only
// counts as a trigger at the very start of the text or right after
// whitespace (so mid-word "a#b" never fires), and the caret must still be
// inside that same token - any whitespace between the `#` and the caret
// closes the window.
export const getActiveRefQuery = (text, caretIndex) => {
  if (typeof text !== 'string' || typeof caretIndex !== 'number') return null;
  const caret = Math.max(0, Math.min(caretIndex, text.length));

  for (let i = caret - 1; i >= 0; i--) {
    const char = text[i];
    if (/\s/.test(char)) return null;
    if (char === '#') {
      const precededByWhitespace = i === 0 || /\s/.test(text[i - 1]);
      if (!precededByWhitespace) return null;
      return { query: text.slice(i + 1, caret), start: i };
    }
  }
  return null;
};

export default getActiveRefQuery;
