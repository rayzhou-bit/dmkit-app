import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import LibraryCard from './LibraryCard';
// The real store (not a hand-rolled fake) - LibraryCard's full tree
// (LibraryTitle's color/options dropdowns, LibraryContent's card-type
// dispatch, etc.) touches enough selectors that hand-rolling a fake store
// covering all of them would be more fragile than just using the real
// reducers, same precedent as data/redux/index.test.js. Importing the store
// module doesn't touch Firebase itself (only dispatching a save/auth thunk
// would, and this file never does).
import store, { actions } from '../../data/redux';

// This is the crux of the whole editable-Library-card feature: a click
// into a monster field must disarm the card's native `draggable` (or the
// browser's drag-and-drop would fight the field for the click), and blur
// must re-arm it. Tested against the real component tree's root element,
// not inferred from a hook's return value.
describe('LibraryCard - draggable disarms while a monster field is being edited', () => {
  it('draggable: true at rest, false while a field is focused, true again after blur', () => {
    store.dispatch(actions.project.setActiveTab({ id: 'ltab' }));
    store.dispatch(actions.project.createCard({ newId: 'lcard', type: 'monster' }));
    store.dispatch(actions.project.updateCardMonsterFields({ id: 'lcard', fields: { armorClass: '18' } }));

    const { container } = render(
      <Provider store={store}>
        <LibraryCard cardId='lcard' isExpanded={false} />
      </Provider>
    );

    // Select the card (click) so the expanded/editable view renders.
    const card = container.querySelector('.card');
    fireEvent.click(card);

    expect(card.draggable).toBe(true);

    const acInput = container.querySelector('#' + 'monster-field-lcard-armorClass');
    expect(acInput).not.toBeNull();

    fireEvent.click(acInput);
    expect(card.draggable).toBe(false);

    fireEvent.change(acInput, { target: { value: '20' } });
    fireEvent.blur(acInput);
    expect(card.draggable).toBe(true);
    expect(acInput.value).toBe('20');
  });

  it('a plain click on a collapse toggle or the add-entry button never disarms dragging', () => {
    store.dispatch(actions.project.updateCardMonsterFields({ id: 'lcard', fields: { armorClass: '18' } }));

    const { container, getByText } = render(
      <Provider store={store}>
        <LibraryCard cardId='lcard' isExpanded={false} />
      </Provider>
    );
    const card = container.querySelector('.card');
    fireEvent.click(card);
    expect(card.draggable).toBe(true);

    fireEvent.click(getByText('+ Add Action'));
    expect(card.draggable).toBe(true);

    fireEvent.click(getByText('Combat')); // collapses it - checked last, so it doesn't hide the button above
    expect(card.draggable).toBe(true);
  });
});

describe('LibraryCard - deselecting mid-edit commits first (useOutsideClick fires on mousedown, before blur)', () => {
  it('an uncommitted field edit is not silently lost when the card is deselected', () => {
    store.dispatch(actions.project.updateCardMonsterFields({ id: 'lcard', fields: { hitPoints: '' } }));

    const { container } = render(
      <Provider store={store}>
        <div>
          <LibraryCard cardId='lcard' isExpanded={false} />
          <div data-testid='outside'>elsewhere</div>
        </div>
      </Provider>
    );
    const card = container.querySelector('.card');
    fireEvent.click(card);

    const hpInput = container.querySelector('#monster-field-lcard-hitPoints');
    fireEvent.click(hpInput);
    fireEvent.change(hpInput, { target: { value: '250' } });
    // No blur fired - simulate clicking away, which useOutsideClick catches
    // on mousedown (before any native blur would otherwise fire).
    fireEvent.mouseDown(container.querySelector('[data-testid="outside"]'));

    expect(store.getState().project.present.cards.lcard.content.hitPoints).toBe('250');
  });
});

// Same crux as the monster describe block above, retargeted at the
// note card's description field and its one open-ended entry list -
// the trickiest part of the whole note feature, since it reuses
// useDragSafeFieldHooks/MonsterEntry's mechanics but through new
// NoteTextField/NoteEntry components.
describe('LibraryCard (note) - draggable disarms while a field is being edited', () => {
  it('draggable: true at rest, false while the description field is focused, true again after blur', () => {
    store.dispatch(actions.project.createCard({ newId: 'lcard-note', type: 'note' }));
    // Same setup pattern as the monster describe block above - an all-empty
    // card shows the "no content yet" placeholder (hasCardContent gates the
    // Library's expanded view), so seed a field first.
    store.dispatch(actions.project.updateCardNoteFields({ id: 'lcard-note', fields: { description: 'placeholder' } }));

    const { container, getByText } = render(
      <Provider store={store}>
        <LibraryCard cardId='lcard-note' isExpanded={false} />
      </Provider>
    );

    const card = container.querySelector('.card');
    fireEvent.click(card);
    expect(card.draggable).toBe(true);

    // The description field starts in display mode (CardRefField) - a
    // mousedown on its rendered text is what swaps in the real textarea AND
    // disarms draggable (both go through the field's own beginEdit), same
    // pattern as LibraryCustomContent.test.jsx.
    fireEvent.mouseDown(getByText('placeholder'));
    expect(card.draggable).toBe(false);

    const descriptionInput = container.querySelector('#note-field-lcard-note-description');
    expect(descriptionInput).not.toBeNull();

    fireEvent.change(descriptionInput, { target: { value: 'A dim tavern.' } });
    fireEvent.blur(descriptionInput);
    expect(card.draggable).toBe(true);
    expect(descriptionInput.value).toBe('A dim tavern.');
  });

  it('draggable disarms while editing an entry field, and a plain click on the add-entry button never disarms it', () => {
    const { container, getByText } = render(
      <Provider store={store}>
        <LibraryCard cardId='lcard-note' isExpanded={false} />
      </Provider>
    );
    const card = container.querySelector('.card');
    fireEvent.click(card);
    expect(card.draggable).toBe(true);

    fireEvent.click(getByText('+ Add Detail'));
    expect(card.draggable).toBe(true); // plain click never disarms

    const entryId = store.getState().project.present.cards['lcard-note'].content.entries[0].id;
    const nameInput = container.querySelector(`#note-entry-lcard-note-${entryId}-name`);
    expect(nameInput).not.toBeNull();

    fireEvent.click(nameInput);
    expect(card.draggable).toBe(false);

    fireEvent.change(nameInput, { target: { value: 'Innkeeper Rosa' } });
    fireEvent.blur(nameInput);
    expect(card.draggable).toBe(true);
    expect(nameInput.value).toBe('Innkeeper Rosa');
  });
});

// Mobile replaces the canvas with the card list, so the Library card is the
// only surface there. Two desktop affordances don't survive the trip: the
// native drag onto a canvas that doesn't exist, and the double-click title
// gate (double-tap is a zoom gesture). useIsMobile reads matchMedia, which
// jsdom lacks entirely - absent, every other test here stays on the desktop
// path, which is exactly what they were written against.
describe('LibraryCard - mobile', () => {
  const setMobile = (matches) => {
    window.matchMedia = () => ({ matches, addEventListener: () => {}, removeEventListener: () => {} });
  };
  afterEach(() => { delete window.matchMedia; });

  const renderCard = (cardId) => render(
    <Provider store={store}>
      <LibraryCard cardId={cardId} isExpanded={false} />
    </Provider>
  );

  it('is not natively draggable - there is no canvas to drag onto, and it would fight touch scrolling', () => {
    setMobile(true);
    store.dispatch(actions.project.createCard({ newId: 'mcard', type: 'custom' }));
    const { container } = renderCard('mcard');
    expect(container.querySelector('.card').draggable).toBe(false);
  });

  it('opens the active card, so a just-created card (active, not yet selected) is editable straight away', () => {
    setMobile(true);
    store.dispatch(actions.project.createCard({ newId: 'mcard-new', type: 'custom' }));
    store.dispatch(actions.session.setActiveCard({ id: 'mcard-new' }));

    const { getByText, queryByText } = renderCard('mcard-new');
    expect(queryByText('No blocks yet')).toBeNull();
    expect(getByText('+ Add text')).not.toBeNull();
  });

  it('leaves a just-created card collapsed on desktop, where the canvas card is the place to edit it', () => {
    store.dispatch(actions.project.createCard({ newId: 'dcard-new', type: 'custom' }));
    store.dispatch(actions.session.setActiveCard({ id: 'dcard-new' }));

    const { getByText } = renderCard('dcard-new');
    expect(getByText('No blocks yet')).not.toBeNull();
  });

  it('opens the title on a single tap, since double-tap is a zoom gesture', () => {
    setMobile(true);
    store.dispatch(actions.project.createCard({ newId: 'mcard-title', type: 'custom' }));
    const { container } = renderCard('mcard-title');

    const titleInput = container.querySelector('.card-title input');
    expect(titleInput.readOnly).toBe(true);
    fireEvent.click(titleInput);
    expect(titleInput.readOnly).toBe(false);
  });

  it('still requires a double-click on the title on desktop, where it guards against the card drag', () => {
    store.dispatch(actions.project.createCard({ newId: 'dcard-title', type: 'custom' }));
    const { container } = renderCard('dcard-title');

    const titleInput = container.querySelector('.card-title input');
    fireEvent.click(titleInput);
    expect(titleInput.readOnly).toBe(true);
    fireEvent.doubleClick(titleInput);
    expect(titleInput.readOnly).toBe(false);
  });
});
