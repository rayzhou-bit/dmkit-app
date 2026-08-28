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

