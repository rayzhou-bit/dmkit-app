import { getCardType, CARD_TYPES } from './cards';

describe('getCardType', () => {
  it.each([
    ['legacy card, no type, has content.text', { content: { text: 'hi' } }, CARD_TYPES.text],
    ['explicit type: text', { type: 'text', content: { text: 'hi' } }, CARD_TYPES.text],
    ['explicit type: image', { type: 'image', content: { image: 'data:...' } }, CARD_TYPES.image],
    ['no type, content.image non-empty', { content: { image: 'data:...' } }, CARD_TYPES.image],
    ['no type, content.image is empty string', { content: { image: '' } }, CARD_TYPES.text],
    ['undefined card', undefined, CARD_TYPES.text],
    ['null card', null, CARD_TYPES.text],
  ])('%s', (_, card, expected) => {
    expect(getCardType(card)).toBe(expected);
  });
});
