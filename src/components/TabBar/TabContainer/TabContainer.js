import React from 'react';

import './TabContainer.scss';

const TabContainer = props => {
  
  // STORE VALUES
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const viewOrder = useSelector(state => state.campaignData.present.viewOrder);
  const viewCollection = useSelector(state => state.campaignData.present.views);

  const tabWidth = 200;
  
  // REFS
  const viewTabContainerRef = useRef();
  
  // FUNCTIONS
  const wheelHandler = (event) => {
    if (event.deltaY > 0) scrollRight();
    else scrollLeft();
  };
  const scrollLeft = () => viewTabContainerRef.current.scrollBy({left: -1.5 *tabWidth, behavior: 'smooth'});
  const scrollRight = () => viewTabContainerRef.current.scrollBy({left: 1.5 *tabWidth, behavior: 'smooth'});
  const scrollTo = (viewId) => viewTabContainerRef.current.scrollTo({left: viewOrder.indexOf(viewId) *tabWidth, behavior: 'smooth'});

  useOutsideClick([viewListRef, viewListBtnRef], openViewList, () => setOpenViewList(false));

  // DISPLAY ELEMENTS
  let viewList = [];
  let viewTabs = [];
  if (viewCollection) {
    for (let x in viewOrder) {
      let viewId = viewOrder[x];
      if (viewCollection[viewId]) {
        viewList = [
          ...viewList,
          <button key={viewId} 
            className="view-list-item btn-any" style={{backgroundColor: (viewId === activeViewId) ? "white" : null}}
            title={viewCollection[viewId].title}
            onClick={(viewId !== activeViewId) ? () => {
                dispatch(actions.updActiveViewId(viewId));
                scrollTo(viewId);
              } : null}
          />
        ];
        viewTabs = [
          ...viewTabs,
          <ViewTab key={viewId} 
            viewId={viewId} viewTabContainerRef={viewTabContainerRef} tabWidth={tabWidth} />
        ];
      }
    }
  }

  return (
    <div ref={viewTabContainerRef} className="view-tab-container"
      onWheel={wheelHandler}>
      <div className="view-tab-container-container">
        {viewTabs}
        <div className="border-line" />
      </div>
    </div>
  );
};

export default TabContainer;