export const isTextEntryTarget = (el) => {
  if (!el || typeof el.tagName !== 'string') return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return !el.readOnly && !el.disabled;
  if (tag === 'INPUT') {
    const textTypes = ['text', 'search', 'email', 'password', 'url', 'tel', 'number', ''];
    return !el.readOnly && !el.disabled && textTypes.includes(el.type);
  }
  return false;
};

export const isSpaceActivatedTarget = (el) => {
  if (!el || typeof el.tagName !== 'string') return false;
  const tag = el.tagName;
  if (tag === 'BUTTON' || tag === 'SELECT' || tag === 'SUMMARY') return true;
  if (tag === 'A' && el.hasAttribute('href')) return true;
  if (tag === 'INPUT') {
    return ['checkbox', 'radio', 'submit', 'button', 'reset'].includes(el.type);
  }
  return false;
};

// True when a mousedown at `target` would land on the SAME card whose
// title/content is currently being edited (Card/hooks.js's `isEditing` -
// component-local React state, not in Redux, so this is the only way to see
// it from a native DOM listener like Canvas/hooks.js's pan handler: a card's
// title/content textarea is only non-readOnly while it's actively being
// edited, so a focused, non-readOnly one IS "this card is in edit mode").
// Used to let normal text-selection/cursor placement happen on a card
// you're editing, instead of the drag being hijacked into a canvas pan.
export const isEditingCardTarget = (target, activeElement = document.activeElement) => {
  if (!isTextEntryTarget(activeElement)) return false;
  const activeCard = activeElement.closest ? activeElement.closest('.card') : null;
  const targetCard = target && target.closest ? target.closest('.card') : null;
  return !!activeCard && activeCard === targetCard;
};
