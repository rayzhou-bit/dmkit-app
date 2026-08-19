import { isTextEntryTarget, isSpaceActivatedTarget } from './focusUtils';

describe('isTextEntryTarget', () => {
  it('returns false for null', () => {
    expect(isTextEntryTarget(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isTextEntryTarget(undefined)).toBe(false);
  });

  it('returns false for a plain object with no tagName', () => {
    expect(isTextEntryTarget({})).toBe(false);
  });

  it('returns false for a real div with no contentEditable', () => {
    const el = document.createElement('div');
    expect(isTextEntryTarget(el)).toBe(false);
  });

  it('returns true for a contentEditable element (duck-typed)', () => {
    // jsdom does NOT implement Element.isContentEditable — a real
    // document.createElement('div') with contentEditable = 'true' set on it
    // will NOT return true for .isContentEditable in jsdom, even though a
    // real browser would. So we duck-type the target instead.
    const el = { tagName: 'DIV', isContentEditable: true };
    expect(isTextEntryTarget(el)).toBe(true);
  });

  it('returns true for a real textarea', () => {
    const el = document.createElement('textarea');
    expect(isTextEntryTarget(el)).toBe(true);
  });

  it('returns false for a real textarea that is readOnly', () => {
    const el = document.createElement('textarea');
    el.readOnly = true;
    expect(isTextEntryTarget(el)).toBe(false);
  });

  it('returns false for a real textarea that is disabled', () => {
    const el = document.createElement('textarea');
    el.disabled = true;
    expect(isTextEntryTarget(el)).toBe(false);
  });

  it('returns true for a real input with no type attribute set (jsdom defaults to "text")', () => {
    const el = document.createElement('input');
    expect(isTextEntryTarget(el)).toBe(true);
  });

  it.each(['text', 'search', 'email', 'password', 'url', 'tel', 'number'])(
    'returns true for a real input of type "%s"',
    (type) => {
      const el = document.createElement('input');
      el.type = type;
      expect(isTextEntryTarget(el)).toBe(true);
    }
  );

  it.each(['checkbox', 'radio', 'submit', 'button', 'reset', 'range', 'color', 'file'])(
    'returns false for a real input of type "%s"',
    (type) => {
      const el = document.createElement('input');
      el.type = type;
      expect(isTextEntryTarget(el)).toBe(false);
    }
  );

  it('returns false for a real text input that is readOnly', () => {
    const el = document.createElement('input');
    el.type = 'text';
    el.readOnly = true;
    expect(isTextEntryTarget(el)).toBe(false);
  });

  it('returns false for a real text input that is disabled', () => {
    const el = document.createElement('input');
    el.type = 'text';
    el.disabled = true;
    expect(isTextEntryTarget(el)).toBe(false);
  });

  it('returns true for an input with an empty-string type (duck-typed)', () => {
    // A real jsdom <input> never actually reports an empty string for
    // .type — it defaults to 'text' (see the test above). The '' entry in
    // focusUtils.js's textTypes array is therefore a branch that only fires
    // for a non-standard/duck-typed target, so we exercise it directly here.
    const el = { tagName: 'INPUT', type: '', readOnly: false, disabled: false };
    expect(isTextEntryTarget(el)).toBe(true);
  });
});

describe('isSpaceActivatedTarget', () => {
  it('returns true for a real button', () => {
    const el = document.createElement('button');
    expect(isSpaceActivatedTarget(el)).toBe(true);
  });

  it('returns true for a real select', () => {
    const el = document.createElement('select');
    expect(isSpaceActivatedTarget(el)).toBe(true);
  });

  it('returns true for a real summary', () => {
    const el = document.createElement('summary');
    expect(isSpaceActivatedTarget(el)).toBe(true);
  });

  it('returns true for a real anchor with href', () => {
    const el = document.createElement('a');
    el.setAttribute('href', '#');
    expect(isSpaceActivatedTarget(el)).toBe(true);
  });

  it('returns false for a real anchor with no href attribute', () => {
    const el = document.createElement('a');
    expect(isSpaceActivatedTarget(el)).toBe(false);
  });

  it.each(['checkbox', 'radio', 'submit', 'button', 'reset'])(
    'returns true for a real input of type "%s"',
    (type) => {
      const el = document.createElement('input');
      el.type = type;
      expect(isSpaceActivatedTarget(el)).toBe(true);
    }
  );

  it('returns false for a real text input', () => {
    const el = document.createElement('input');
    el.type = 'text';
    expect(isSpaceActivatedTarget(el)).toBe(false);
  });

  it('returns false for a real div', () => {
    const el = document.createElement('div');
    expect(isSpaceActivatedTarget(el)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isSpaceActivatedTarget(null)).toBe(false);
  });
});

describe('cross-cutting product behavior', () => {
  it('a read-only card textarea is neither text-entry nor space-activated, so pressing Space over an unfocused card engages pan mode', () => {
    // src/components/Card/Content.jsx renders its <textarea> with
    // readOnly={readOnly}, and the card starts out read-only until the user
    // clicks in to edit it (beginContentEdit). That is the exact DOM state a
    // card is in most of the time on the canvas. If either check above ever
    // started returning true for this state, Space would stop panning the
    // canvas whenever the pointer happened to be over a card — so this test
    // pins that behavior down for future refactors.
    const el = document.createElement('textarea');
    el.readOnly = true;

    expect(isTextEntryTarget(el)).toBe(false);
    expect(isSpaceActivatedTarget(el)).toBe(false);
  });

  it('a button is space-activated but not text-entry, so Space over a UI button like the zoom controls does not engage pan mode', () => {
    const el = document.createElement('button');

    expect(isTextEntryTarget(el)).toBe(false);
    expect(isSpaceActivatedTarget(el)).toBe(true);
  });
});
