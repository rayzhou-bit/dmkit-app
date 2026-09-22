import { getCardType, hasCardContent, migrateLegacyTextImageCard, CARD_TYPES } from './cards';
import { buildMonsterContent } from './monster';
import { buildNoteContent } from './note';
import { buildCustomContent } from './custom';

describe('getCardType', () => {
  it.each([
    ['legacy card, no type, has content.text', { content: { text: 'hi' } }, CARD_TYPES.text],
    ['explicit type: text', { type: 'text', content: { text: 'hi' } }, CARD_TYPES.text],
    ['explicit type: image', { type: 'image', content: { image: 'data:...' } }, CARD_TYPES.image],
    ['no type, content.image non-empty', { content: { image: 'data:...' } }, CARD_TYPES.image],
    ['no type, content.image is empty string', { content: { image: '' } }, CARD_TYPES.text],
    ['undefined card', undefined, CARD_TYPES.text],
    ['null card', null, CARD_TYPES.text],
    ['explicit type: monster', { type: 'monster', content: buildMonsterContent() }, CARD_TYPES.monster],
    ['no type, has content.armorClass', { content: { armorClass: '' } }, CARD_TYPES.monster],
    ['no type, has content.portrait, not content.image', { content: { portrait: 'data:...' } }, CARD_TYPES.text],
    ['explicit type: note', { type: 'note', content: buildNoteContent() }, CARD_TYPES.note],
    // note is never legacy-inferred - it never existed without an explicit `type`.
    ['no type, has content.description and entries (no type stamped)', { content: buildNoteContent({ description: 'x' }) }, CARD_TYPES.text],
    ['explicit type: custom', { type: 'custom', content: buildCustomContent() }, CARD_TYPES.custom],
    // custom is never legacy-inferred either - it never existed without an explicit `type`.
    ['no type, has content.blocks (no type stamped)', { content: buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'x' }] }) }, CARD_TYPES.text],
  ])('%s', (_, card, expected) => {
    expect(getCardType(card)).toBe(expected);
  });
});

describe('hasCardContent', () => {
  it.each([
    ['undefined content', undefined, false],
    ['empty text', { text: '' }, false],
    ['non-empty text', { text: 'x' }, true],
    ['image set', { image: 'data:...' }, true],
    ['default monster content', buildMonsterContent(), false],
    ['monster with one trait filled (legacy string)', buildMonsterContent({ traits: 'Amphibious.' }), true],
    ['monster with a portrait set', buildMonsterContent({ portrait: 'data:...' }), true],
    // Regression: hasCardContent used to do String(content[key]).trim() for
    // every field - String([{...}]) is "[object Object]" (truthy), which
    // would have falsely reported an empty entry list as "has content".
    ['monster with an empty actions entry list', buildMonsterContent({ actions: [] }), false],
    ['monster with one all-blank actions entry', buildMonsterContent({ actions: [{ id: 'e1', name: '', description: '' }] }), false],
    ['monster with one filled actions entry', buildMonsterContent({ actions: [{ id: 'e1', name: 'Scimitar', description: '' }] }), true],
    ['default note content', buildNoteContent(), false],
    ['note with a portrait set', buildNoteContent({ portrait: 'data:...' }), true],
    ['note with a description set', buildNoteContent({ description: 'A dim tavern.' }), true],
    ['note with an empty entries list', buildNoteContent({ entries: [] }), false],
    ['note with one all-blank entry', buildNoteContent({ entries: [{ id: 'e1', name: '', description: '' }] }), false],
    ['note with one filled entry', buildNoteContent({ entries: [{ id: 'e1', name: 'Rosa', description: '' }] }), true],
    ['default custom content', buildCustomContent(), false],
    ['custom with an empty blocks list', buildCustomContent({ blocks: [] }), false],
    ['custom with one blank text block', buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: '' }] }), false],
    ['custom with one filled text block', buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'hi' }] }), true],
    ['custom with one filled image block', buildCustomContent({ blocks: [{ id: 'b1', type: 'image', image: 'data:...' }] }), true],
  ])('%s', (_, content, expected) => {
    expect(hasCardContent(content)).toBe(expected);
  });
});

describe('migrateLegacyTextImageCard', () => {
  it('converts an explicit type:text card into custom, its text as one block', () => {
    const card = { title: 'Greetings', type: 'text', content: { text: 'Welcome!' } };
    const migrated = migrateLegacyTextImageCard(card);
    expect(migrated.type).toBe('custom');
    expect(migrated.content.blocks).toEqual([{ id: 'legacy', type: 'text', text: 'Welcome!', image: '', alt: '' }]);
    expect(migrated.title).toBe('Greetings'); // everything else on the card carries over
  });

  it('converts a legacy no-type card (content.text, inferred as text) the same way', () => {
    const card = { title: 'Tools', content: { text: 'Use the buttons...' } };
    const migrated = migrateLegacyTextImageCard(card);
    expect(migrated.type).toBe('custom');
    expect(migrated.content.blocks).toEqual([{ id: 'legacy', type: 'text', text: 'Use the buttons...', image: '', alt: '' }]);
  });

  it('converts an explicit type:image card into custom, its image as one block', () => {
    const card = { title: 'A photo', type: 'image', content: { image: 'data:image/jpeg;base64,xxx', alt: 'cat.png' } };
    const migrated = migrateLegacyTextImageCard(card);
    expect(migrated.type).toBe('custom');
    expect(migrated.content.blocks).toEqual([{ id: 'legacy', type: 'image', text: '', image: 'data:image/jpeg;base64,xxx', alt: 'cat.png' }]);
  });

  it('an empty text card converts to an empty custom card (no phantom block)', () => {
    const migrated = migrateLegacyTextImageCard({ type: 'text', content: { text: '' } });
    expect(migrated.type).toBe('custom');
    expect(migrated.content.blocks).toEqual([]);
  });

  it('an empty image card converts to an empty custom card (no phantom block)', () => {
    const migrated = migrateLegacyTextImageCard({ type: 'image', content: { image: '', alt: '' } });
    expect(migrated.type).toBe('custom');
    expect(migrated.content.blocks).toEqual([]);
  });

  it('is a no-op (same reference) for monster/note/custom cards', () => {
    const monsterCard = { type: 'monster', content: buildMonsterContent() };
    const noteCard = { type: 'note', content: buildNoteContent() };
    const customCard = { type: 'custom', content: buildCustomContent() };
    expect(migrateLegacyTextImageCard(monsterCard)).toBe(monsterCard);
    expect(migrateLegacyTextImageCard(noteCard)).toBe(noteCard);
    expect(migrateLegacyTextImageCard(customCard)).toBe(customCard);
  });

  it('is idempotent - migrating an already-migrated card is a no-op', () => {
    const card = { type: 'text', content: { text: 'Welcome!' } };
    const once = migrateLegacyTextImageCard(card);
    const twice = migrateLegacyTextImageCard(once);
    expect(twice).toBe(once);
  });
});
