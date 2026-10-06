// Card titles are kept unique across a project. References don't need it -
// a #[Title](id) token resolves by id, so a rename or a duplicate can't break
// a link - but the "#" picker, the Library and the graph all show titles, and
// two identical ones there are indistinguishable.

const TRAILING_NUMBER = /^(.*\S)\s+(\d+)$/;

export const FALLBACK_TITLE = 'untitled';

// Appends the lowest free " N". A title that already ends in a number counts
// up from there, so copying "Goblin 2" gives "Goblin 3" rather than
// "Goblin 2 2".
export const uniqueTitle = (desired, taken) => {
  const wanted = String(desired ?? '').trim() || FALLBACK_TITLE;
  const used = taken instanceof Set ? taken : new Set(taken ?? []);
  if (!used.has(wanted)) return wanted;

  const match = wanted.match(TRAILING_NUMBER);
  const stem = match ? match[1] : wanted;
  let n = match ? Number(match[2]) + 1 : 2;
  while (used.has(`${stem} ${n}`)) n += 1;
  return `${stem} ${n}`;
};

// Every title in the project except the card being renamed - that card's own
// title must not count against it, or committing an unchanged title would
// bump it every time.
export const titlesInUse = (cards, exceptId) =>
  new Set(Object.entries(cards ?? {})
    .filter(([id]) => id !== exceptId)
    .map(([, card]) => String(card?.title ?? '').trim())
    .filter(Boolean));
