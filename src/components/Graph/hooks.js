import { useEffect, useMemo, useState } from 'react';
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
    groups: graph.groups,
    edges: graph.edges,
    width: graph.width,
    height: graph.height,
    onNodeClick: (cardId) => {
      dispatch(actions.session.focusCard({ cardId }));
      dispatch(actions.session.setGraphOpen({ isOpen: false }));
    },
  };
};
