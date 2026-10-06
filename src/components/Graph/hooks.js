import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '../../data/redux';
import { buildCardGraph } from '../../utils/cardGraph';
import { layoutCardGraph } from '../../utils/graphLayout';

export const useGraphHooks = () => {
  const dispatch = useDispatch();
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const isOpen = useSelector(selectors.session.isGraphOpen);
  const cards = useSelector(selectors.project.cards);
  const views = useSelector(selectors.project.tabs);
  const viewOrder = useSelector(selectors.project.tabOrder);

  const [showButton, setShowButton] = useState(!!activeProject);

  // Same reset-on-project-change precedent as Library's useLibraryHooks:
  // switching projects doesn't dispatch session/initialize, so a graph left
  // open on the old project would otherwise still be open on the new one.
  useEffect(() => {
    setShowButton(!!activeProject);
    dispatch(actions.session.setGraphOpen({ isOpen: false }));
  }, [activeProject]);

  // Derived, not persisted - nothing here goes into Redux, so it can never
  // drift from the cards/tabs it describes. edges carry only ids (no x/y)
  // from buildCardGraph, so they're threaded through alongside the
  // positioned nodes/groups layoutCardGraph returns.
  const graph = useMemo(() => {
    const built = buildCardGraph({ cards, views, viewOrder });
    const layout = layoutCardGraph(built);
    return { ...layout, edges: built.edges };
  }, [cards, views, viewOrder]);

  return {
    showButton,
    isOpen,
    toggleGraph: () => dispatch(actions.session.setGraphOpen({ isOpen: !isOpen })),
    nodes: graph.nodes,
    rings: graph.rings,
    edges: graph.edges,
    width: graph.width,
    height: graph.height,
    centre: graph.centre,
    onNodeClick: (cardId) => {
      dispatch(actions.session.focusCard({ cardId }));
      dispatch(actions.session.setGraphOpen({ isOpen: false }));
    },
  };
};

export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const WHEEL_SENSITIVITY = 0.0015;

const clamp = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

// Pan/zoom for the graph panel. View-only and short-lived, so it stays in
// component state rather than Redux - nothing here is worth persisting, and
// it resets every time the panel reopens.
export const useGraphViewHooks = (viewbox) => {
  const centre = viewbox / 2;
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const dragRef = useRef(null);
  const svgRef = useRef(null);

  // Client pixels -> viewBox units. preserveAspectRatio is xMidYMid meet, so
  // the box is drawn as a centred square of the smaller dimension.
  const toUserSpace = (clientX, clientY) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return { x: centre, y: centre };
    const side = Math.min(rect.width, rect.height);
    const k = side / viewbox;
    return {
      x: (clientX - rect.left - (rect.width - side) / 2) / k,
      y: (clientY - rect.top - (rect.height - side) / 2) / k,
    };
  };

  // Zoom about a fixed point: whatever is under `at` has to stay under it,
  // or zooming walks the graph out from under the pointer.
  const zoomAbout = (nextScale, at) => setView(prev => {
    const scale = clamp(nextScale);
    return {
      scale,
      x: prev.x + (prev.scale - scale) * at.x,
      y: prev.y + (prev.scale - scale) * at.y,
    };
  });

  return {
    svgRef,
    view,
    transform: `translate(${view.x} ${view.y}) scale(${view.scale})`,
    canZoomIn: view.scale < MAX_ZOOM,
    canZoomOut: view.scale > MIN_ZOOM,
    isPanned: view.scale !== 1 || view.x !== 0 || view.y !== 0,
    zoomIn: () => zoomAbout(view.scale + ZOOM_STEP, { x: centre, y: centre }),
    zoomOut: () => zoomAbout(view.scale - ZOOM_STEP, { x: centre, y: centre }),
    reset: () => setView({ scale: 1, x: 0, y: 0 }),
    onWheel: (event) => {
      event.preventDefault();
      zoomAbout(view.scale * Math.exp(-event.deltaY * WHEEL_SENSITIVITY),
        toUserSpace(event.clientX, event.clientY));
    },
    onPointerDown: (event) => {
      // Left button on empty space only - a node handles its own click.
      if (event.button !== 0 || event.target.closest('.card-graph-node')) return;
      dragRef.current = { x: event.clientX, y: event.clientY, view };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const rect = svgRef.current?.getBoundingClientRect();
      const k = rect && rect.width ? Math.min(rect.width, rect.height) / viewbox : 1;
      setView({
        scale: drag.view.scale,
        x: drag.view.x + (event.clientX - drag.x) / k,
        y: drag.view.y + (event.clientY - drag.y) / k,
      });
    },
    onPointerUp: (event) => {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    },
  };
};
