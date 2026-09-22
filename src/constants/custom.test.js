import {
  buildCustomContent,
  customHasContent,
  normalizeCustomBlocks,
  CUSTOM_BLOCK_TYPES,
} from './custom';

describe('buildCustomContent', () => {
  it('with no args, blocks is an empty array', () => {
    const content = buildCustomContent();
    expect(content.blocks).toEqual([]);
  });

  it('two calls do not share blocks array identity', () => {
    const a = buildCustomContent();
    const b = buildCustomContent();
    expect(a.blocks).not.toBe(b.blocks);
  });

  it('deep-copies block objects from the source, not just the array', () => {
    const source = { blocks: [{ id: 'b1', type: 'text', text: 'hi' }] };
    const content = buildCustomContent(source);
    expect(content.blocks).toEqual([{ id: 'b1', type: 'text', text: 'hi', image: '', alt: '' }]);
    expect(content.blocks).not.toBe(source.blocks);
    expect(content.blocks[0]).not.toBe(source.blocks[0]);
  });

  it('round-trips losslessly through JSON (undefined-never-written invariant)', () => {
    const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'hi' }, { id: 'b2', type: 'image', image: 'data:...', alt: 'x.png' }] });
    expect(JSON.parse(JSON.stringify(content))).toEqual(content);
  });

  it('coerces null/undefined source values to an empty array', () => {
    const content = buildCustomContent({ blocks: undefined });
    expect(content.blocks).toEqual([]);
  });
});

describe('normalizeCustomBlocks', () => {
  it('is not an array -> empty array', () => {
    expect(normalizeCustomBlocks('junk')).toEqual([]);
    expect(normalizeCustomBlocks(undefined)).toEqual([]);
    expect(normalizeCustomBlocks(null)).toEqual([]);
  });

  it('drops non-object entries and entries with an unrecognized type', () => {
    const blocks = normalizeCustomBlocks([
      { id: 'b1', type: 'text', text: 'hi' },
      'junk',
      null,
      { id: 'b2', type: 'video', text: 'unsupported' },
    ]);
    expect(blocks).toEqual([{ id: 'b1', type: 'text', text: 'hi', image: '', alt: '' }]);
  });

  it('every block always has all 4 value keys, regardless of type', () => {
    const blocks = normalizeCustomBlocks([
      { id: 'b1', type: 'text', text: 'hi' },
      { id: 'b2', type: 'image', image: 'data:...', alt: 'x.png' },
    ]);
    expect(blocks[0]).toEqual({ id: 'b1', type: 'text', text: 'hi', image: '', alt: '' });
    expect(blocks[1]).toEqual({ id: 'b2', type: 'image', text: '', image: 'data:...', alt: 'x.png' });
  });

  it('coerces missing/null/undefined fields to empty strings', () => {
    const blocks = normalizeCustomBlocks([{ id: 'b1', type: 'text' }]);
    expect(blocks[0]).toEqual({ id: 'b1', type: 'text', text: '', image: '', alt: '' });
  });
});

describe('customHasContent', () => {
  it.each([
    ['undefined content', undefined, false],
    ['default custom content', buildCustomContent(), false],
    ['empty blocks list', buildCustomContent({ blocks: [] }), false],
    ['one blank text block', buildCustomContent({ blocks: [{ id: 'b1', type: CUSTOM_BLOCK_TYPES.text, text: '' }] }), false],
    ['one text block with whitespace only', buildCustomContent({ blocks: [{ id: 'b1', type: CUSTOM_BLOCK_TYPES.text, text: '   ' }] }), false],
    ['one text block with content', buildCustomContent({ blocks: [{ id: 'b1', type: CUSTOM_BLOCK_TYPES.text, text: 'hi' }] }), true],
    ['one blank image block', buildCustomContent({ blocks: [{ id: 'b1', type: CUSTOM_BLOCK_TYPES.image, image: '' }] }), false],
    ['one image block with content', buildCustomContent({ blocks: [{ id: 'b1', type: CUSTOM_BLOCK_TYPES.image, image: 'data:...' }] }), true],
    ['a blank text block alongside a filled image block', buildCustomContent({ blocks: [{ id: 'b1', type: CUSTOM_BLOCK_TYPES.text, text: '' }, { id: 'b2', type: CUSTOM_BLOCK_TYPES.image, image: 'data:...' }] }), true],
  ])('%s', (_, content, expected) => {
    expect(customHasContent(content)).toBe(expected);
  });
});
