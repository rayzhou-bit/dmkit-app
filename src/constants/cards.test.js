import { getCardType, hasCardContent, CARD_TYPES } from './cards';
import { buildMonsterContent } from './monster';

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
  ])('%s', (_, content, expected) => {
    expect(hasCardContent(content)).toBe(expected);
  });
});
