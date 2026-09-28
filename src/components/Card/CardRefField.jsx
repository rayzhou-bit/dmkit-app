import React, { useEffect, useRef } from 'react';

import CardRefDisplay from './CardRefDisplay';

// Maps a click point to a raw-text offset, using whichever segment span
// (see CardRefDisplay's data-ref-start) the click actually landed in.
// Within a text segment the displayed text is an exact slice of the raw
// string, so start + the in-node offset is exact; a chip span has no such
// 1:1 mapping (its label is the resolved live title, not raw text) so a
// click anywhere on it just lands the caret at the token's end.
// caretPositionFromPoint is the standard; caretRangeFromPoint is the
// WebKit/Safari fallback. Neither exists in jsdom, so this always falls
// through to `null` (caller defaults to end-of-text) under Vitest - real
// caret placement is verified in the browser, not unit tests.
const resolveCaretOffset = (clientX, clientY, container) => {
  let node;
  let offset;
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(clientX, clientY);
    if (!pos) return null;
    node = pos.offsetNode;
    offset = pos.offset;
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(clientX, clientY);
    if (!range) return null;
    node = range.startContainer;
    offset = range.startOffset;
  } else {
    return null;
  }

  let el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el !== container && el.dataset?.refStart === undefined) el = el.parentElement;
  if (!el || el === container || !container.contains(el)) return null;

  const start = parseInt(el.dataset.refStart, 10);
  return el.dataset.refChip ? start : start + offset;
};

// The display/edit swap shared by every ref-token-capable field
// (CustomTextBlock, TextContent, LibraryTextContent): renders `children`
// (the real textarea) while editing, or a CardRefDisplay otherwise.
// `beginEdit`/`readOnly` come from the field's own hook (useContentHooks or
// useDragSafeFieldHooks with alwaysToggle) - clicking the display goes
// through that same beginEdit, not a parallel mechanism, so Library drag-
// suppression (setEditingCard) keeps working unchanged.
const CardRefField = ({ value, readOnly, editRef, beginEdit, placeholder, className, children }) => {
  const displayRef = useRef();
  const pendingCaretRef = useRef(null);

  // Runs after the textarea has actually mounted (readOnly just flipped to
  // false) - setSelectionRange any earlier would hit a still-unmounted (or
  // stale-value) node. Defaults to end-of-text for any edit-entry that
  // didn't go through our own mousedown (e.g. a future keyboard path).
  useEffect(() => {
    if (readOnly || !editRef.current) return;
    const offset = pendingCaretRef.current ?? editRef.current.value.length;
    editRef.current.focus();
    editRef.current.setSelectionRange(offset, offset);
    pendingCaretRef.current = null;
  }, [readOnly]);

  if (!readOnly) return children;

  const handleMouseDown = (e) => {
    // A chip click navigates (its own onClick) - never swap into edit mode for it.
    if (e.target.closest('[data-ref-chip]')) return;
    // preventDefault + stopPropagation, same reasons CardRefPicker's own
    // mousedown handler needs both:
    // - preventDefault stops the browser's own default mousedown action -
    //   this display div isn't focusable, and that default action is to
    //   blur whatever's currently focused. Without this, that blur is
    //   queued to run after our own effect below focuses the textarea (the
    //   swap + focus happen synchronously-ish in React 18, but the
    //   browser's own default action still fires after script returns),
    //   so it fires anyway and immediately un-focuses the textarea we just
    //   focused, which fires the field's onBlur and swaps straight back to
    //   display before the click even finishes.
    // - stopPropagation keeps the mousedown from ever reaching a document-
    //   level mousedown listener (useOutsideClick, used by both the canvas
    //   card and the Library card to detect an outside click): beginEdit()
    //   below swaps this display div out for the textarea synchronously,
    //   so by the time such a listener would run, e.target has already
    //   been removed from the DOM - `.contains()` on a detached node is
    //   always false, so without this the swap itself looks like an
    //   outside click and deselects/deactivates the card.
    e.preventDefault();
    e.stopPropagation();
    pendingCaretRef.current = resolveCaretOffset(e.clientX, e.clientY, displayRef.current) ?? value.length;
    beginEdit();
  };

  return (
    <CardRefDisplay
      ref={displayRef}
      text={value}
      placeholder={placeholder}
      className={className}
      onMouseDown={handleMouseDown}
    />
  );
};

export default CardRefField;
