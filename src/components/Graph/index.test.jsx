import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import Graph, { GraphButton } from './index';
import { MIN_ZOOM } from './hooks';

// GraphButton lives in Library's button rail in the real tree (so it tracks
// the panel as it slides); render the pair together to exercise the toggle.
const GraphWithButton = () => (<><GraphButton /><Graph /></>);
import { reducer as sessionReducer, initialState as sessionInitialState } from '../../data/redux/session/reducers';
import { CARD_TYPES } from '../../constants/cards';
import { buildCustomContent } from '../../constants/custom';

// A hand-rolled store (same precedent as ToolMenu/ErrorBanner's tests):
// Graph only reads session.{isGraphOpen,activeCampaignId} and
// project.present.{cards,views,viewOrder}, so a fake store is lighter than
// the real one. Dispatch runs actions through the REAL session reducer
// (rather than just recording them) so the toggle/focus tests can observe
// the component re-render after a click, the same way react-redux would
// against the real store.
const makeStore = ({ session = {}, project = {} } = {}) => {
  let state = {
    session: { ...sessionInitialState, activeCampaignId: 'proj1', ...session },
    project: { present: { cards: {}, views: {}, viewOrder: [], ...project } },
  };
  const listeners = new Set();
  const dispatched = [];
  return {
    dispatched,
    getState: () => state,
    dispatch: (action) => {
      dispatched.push(action);
      state = { ...state, session: sessionReducer(state.session, action) };
      listeners.forEach(fn => fn());
      return action;
    },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    replaceReducer: () => {},
  };
};

const customCard = (title, text, views = {}, color = 'gray') => ({
  title, color, type: CARD_TYPES.custom, views,
  content: buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text }] }),
});

describe('Graph - toggle', () => {
  it('is absent when closed, opens on toggle, and closes again', () => {
    const store = makeStore({
      project: {
        cards: { a: customCard('A', 'no refs here', { t1: {} }) },
        views: { t1: { title: 'One' } },
        viewOrder: ['t1'],
      },
    });
    const { container } = render(<Provider store={store}><GraphWithButton /></Provider>);

    expect(container.querySelector('.card-graph-panel')).toBeNull();

    fireEvent.click(container.querySelector('.graph-btn'));
    expect(container.querySelector('.card-graph-panel')).not.toBeNull();
    expect(container.querySelector('.card-graph-svg')).not.toBeNull();

    fireEvent.click(container.querySelector('.graph-btn'));
    expect(container.querySelector('.card-graph-panel')).toBeNull();
  });
});

describe('Graph - edges', () => {
  it('renders one edge element per edge in the model', () => {
    const store = makeStore({
      session: { isGraphOpen: true },
      project: {
        cards: {
          a: customCard('A', 'see #[B](b) and #[C](c)', { t1: {} }),
          b: customCard('B', 'see #[C](c)', { t1: {} }),
          c: customCard('C', 'nothing', { t1: {} }),
        },
        views: { t1: { title: 'One' } },
        viewOrder: ['t1'],
      },
    });
    const { container } = render(<Provider store={store}><GraphWithButton /></Provider>);
    fireEvent.click(container.querySelector('.graph-btn'));

    // a->b, a->c, b->c
    expect(container.querySelectorAll('.card-graph-edge').length).toBe(3);
  });
});

describe('Graph - node click', () => {
  it('dispatches session/focusCard with the clicked card id and closes the graph', () => {
    const store = makeStore({
      project: {
        cards: { a: customCard('A', 'none', { t1: {} }) },
        views: { t1: { title: 'One' } },
        viewOrder: ['t1'],
      },
    });
    const { container } = render(<Provider store={store}><GraphWithButton /></Provider>);
    fireEvent.click(container.querySelector('.graph-btn'));

    fireEvent.click(container.querySelector('[data-card-id="a"]'));

    expect(store.dispatched).toContainEqual({ type: 'session/focusCard', payload: { cardId: 'a' } });
    expect(store.getState().session.isGraphOpen).toBe(false);
    expect(container.querySelector('.card-graph-panel')).toBeNull();
  });
});

describe('Graph - empty states', () => {
  it('a project with no cards renders a message, not an empty svg', () => {
    const store = makeStore({
      project: { cards: {}, views: { t1: { title: 'One' } }, viewOrder: ['t1'] },
    });
    expect(() => {
      const { container } = render(<Provider store={store}><GraphWithButton /></Provider>);
      fireEvent.click(container.querySelector('.graph-btn'));
      expect(container.querySelector('.card-graph-empty')).not.toBeNull();
      expect(container.querySelector('.card-graph-svg')).toBeNull();
    }).not.toThrow();
  });

  it('a project with cards but zero references renders the nodes plus a caption', () => {
    const store = makeStore({
      project: {
        cards: {
          a: customCard('A', 'no refs', { t1: {} }),
          b: customCard('B', 'also none', { t1: {} }),
        },
        views: { t1: { title: 'One' } },
        viewOrder: ['t1'],
      },
    });
    expect(() => {
      const { container } = render(<Provider store={store}><GraphWithButton /></Provider>);
      fireEvent.click(container.querySelector('.graph-btn'));
      expect(container.querySelector('.card-graph-caption')).not.toBeNull();
      expect(container.querySelectorAll('.card-graph-node').length).toBe(2);
      expect(container.querySelectorAll('.card-graph-edge').length).toBe(0);
    }).not.toThrow();
  });
});

describe('Graph - shared card marker', () => {
  it('rings the node for a card placed in more than one tab, and only that one', () => {
    const store = makeStore({
      project: {
        cards: {
          shared: customCard('Shared', 'none', { t1: {}, t2: {} }),
          solo: customCard('Solo', 'none', { t1: {} }),
        },
        views: { t1: { title: 'One' }, t2: { title: 'Two' } },
        viewOrder: ['t1', 't2'],
      },
    });
    const { container } = render(<Provider store={store}><GraphWithButton /></Provider>);
    fireEvent.click(container.querySelector('.graph-btn'));

    const sharedNode = container.querySelector('[data-card-id="shared"]');
    const soloNode = container.querySelector('[data-card-id="solo"]');
    expect(sharedNode.querySelector('.card-graph-node-ring')).not.toBeNull();
    expect(soloNode.querySelector('.card-graph-node-ring')).toBeNull();
  });
});

describe('Graph - tab rings', () => {
  // The reason this layout replaced regions: a card in two tabs has to be
  // covered by both rings, not assigned to one of them.
  it('draws a ring per tab, and a shared card is covered by every ring it belongs to', () => {
    const store = makeStore({
      session: { isGraphOpen: false },
      project: {
        cards: {
          shared: customCard('Shared', '', { t1: {}, t2: {} }),
          only1: customCard('Only One', '', { t1: {} }),
          only2: customCard('Only Two', '', { t2: {} }),
        },
        views: { t1: { title: 'One' }, t2: { title: 'Two' } },
        viewOrder: ['t1', 't2'],
      },
    });
    const { container } = render(<Provider store={store}><GraphWithButton /></Provider>);
    fireEvent.click(container.querySelector('.graph-btn'));

    expect(container.querySelectorAll('.card-graph-ring').length).toBe(2);
    // Every ring draws at least one arc, so neither tab is left unrepresented.
    for (const ring of container.querySelectorAll('.card-graph-ring')) {
      expect(ring.querySelectorAll('.card-graph-ring-arc').length).toBeGreaterThan(0);
    }
    expect(container.querySelectorAll('.card-graph-node-ring').length).toBe(1);
    expect(container.querySelectorAll('.card-graph-key li').length).toBe(2);
  });
});

describe('Graph - zoom and pan', () => {
  const open = () => {
    const store = makeStore({
      session: { isGraphOpen: false },
      project: {
        cards: { a: customCard('A', '#[B](b)', { t1: {} }), b: customCard('B', '', { t1: {} }) },
        views: { t1: { title: 'One' } },
        viewOrder: ['t1'],
      },
    });
    const utils = render(<Provider store={store}><GraphWithButton /></Provider>);
    fireEvent.click(utils.container.querySelector('.graph-btn'));
    return utils;
  };
  const transform = (container) =>
    container.querySelector('.card-graph-svg g[transform]').getAttribute('transform');

  it('starts unzoomed with the reset control disabled', () => {
    const { container } = open();
    expect(transform(container)).toBe('translate(0 0) scale(1)');
    expect(container.querySelector('.card-graph-zoom [aria-label="Reset zoom"]').disabled).toBe(true);
  });

  it('zooms in and back out from the controls', () => {
    const { container } = open();
    fireEvent.click(container.querySelector('[aria-label="Zoom in"]'));
    expect(transform(container)).toContain('scale(1.25)');
    fireEvent.click(container.querySelector('[aria-label="Zoom out"]'));
    expect(transform(container)).toContain('scale(1)');
  });

  it('clamps at the far ends rather than zooming without limit', () => {
    const { container } = open();
    const zoomOut = container.querySelector('[aria-label="Zoom out"]');
    for (let i = 0; i < 12; i++) fireEvent.click(zoomOut);
    expect(zoomOut.disabled).toBe(true);
    expect(transform(container)).toContain(`scale(${MIN_ZOOM})`);
  });

  it('reset returns to the original view', () => {
    const { container } = open();
    fireEvent.click(container.querySelector('[aria-label="Zoom in"]'));
    fireEvent.click(container.querySelector('.card-graph-zoom [aria-label="Reset zoom"]'));
    expect(transform(container)).toBe('translate(0 0) scale(1)');
  });

  // A drag starting on a node must not pan - that gesture is the node's click.
  it('ignores a pointer-down that lands on a node', () => {
    const { container } = open();
    const svg = container.querySelector('.card-graph-svg');
    const node = container.querySelector('.card-graph-node');
    fireEvent.pointerDown(node, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(svg, { clientX: 90, clientY: 90 });
    expect(transform(container)).toBe('translate(0 0) scale(1)');
  });

  // React registers onWheel passively, so preventDefault() there is ignored
  // and a trackpad pinch zooms the browser window instead of the graph. The
  // listener has to be bound natively with { passive: false }.
  it('cancels a trackpad pinch and zooms the graph instead', () => {
    const { container } = open();
    const svg = container.querySelector('.card-graph-svg');
    const event = new WheelEvent('wheel', { deltaY: -240, ctrlKey: true, bubbles: true, cancelable: true });
    // Raw dispatch, not fireEvent: the point is the native listener, and the
    // state update it triggers needs flushing by hand.
    act(() => { svg.dispatchEvent(event); });

    expect(event.defaultPrevented).toBe(true);
    expect(transform(container)).not.toContain('scale(1)');
  });

  it('pans on a plain wheel rather than zooming', () => {
    const { container } = open();
    const svg = container.querySelector('.card-graph-svg');
    act(() => {
      svg.dispatchEvent(new WheelEvent('wheel', { deltaX: 60, deltaY: 40, bubbles: true, cancelable: true }));
    });

    expect(transform(container)).toContain('scale(1)');
    expect(transform(container)).not.toBe('translate(0 0) scale(1)');
  });

  // The view is worth keeping for the session - reopening the graph should
  // put you back where you were looking, not at the default.
  it('keeps zoom and pan across closing and reopening the panel', () => {
    const { container } = open();
    fireEvent.click(container.querySelector('[aria-label="Zoom in"]'));
    const zoomed = transform(container);

    fireEvent.click(container.querySelector('.card-graph-close'));
    expect(container.querySelector('.card-graph-panel')).toBeNull();

    fireEvent.click(container.querySelector('.graph-btn'));
    expect(transform(container)).toBe(zoomed);
  });
});
