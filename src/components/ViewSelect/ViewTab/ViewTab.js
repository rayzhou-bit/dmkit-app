import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rnd } from "react-rnd";

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";
import TitleInput from '../../UI/Inputs/TitleInput';

import CloseImg from "../../../assets/icons/close.png";

const ViewTab = React.memo(props => {
  const {viewId, tabWidth} = props;
  const dispatch = useDispatch();

  // STATES
  const [dragging, setDragging] = useState(false);
  const [editingView, setEditingView] = useState(false);

  // STORE SELECTORS
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const viewOrder = useSelector(state => state.campaignData.viewOrder);
  const viewPos = viewOrder.indexOf(viewId);
  const viewTitle = useSelector(state => state.campaignData.views[viewId].title);

  // REF
  let rndRef = useRef();

  // FUNCTIONS
  useEffect(() => {
    rndRef.updatePosition({x: viewPos*tabWidth, y: 0});
  }, [viewOrder]);

  const dragStopHandler = (event, data) => {
    setDragging(false);
    const posShift = Math.round((data.x - (viewPos*tabWidth)) / tabWidth);
    dispatch(actions.shiftViewInViewOrder(viewId, posShift));
  };

  const destroyView = () => dispatch(actions.destroyView(viewId));
  
  // STYLES
  const toFrontStyle = {
    zIndex: dragging ? 11 : (viewId===activeViewId) ? 10 : 1,
    height: "100%"
  };

  const viewTabStyle = {
    backgroundColor: (viewId === activeViewId) ? "white" : "lightgray",
    borderTop: (viewId === activeViewId) ? "1px solid white" : "1px solid black",
  };

  return (
    <Rnd ref={node => rndRef = node}
      style={toFrontStyle}
      bounds="parent"
      // position
      // drag
      disableDragging={editingView}
      dragHandleClassName="title-input" dragAxis="x"
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={{width: tabWidth, height: 42}}
      // resize
      enableResizing={false}
      // onClick
    >
      <div className="view-tab" style={viewTabStyle}>
        <button className={(viewId === activeViewId) ? "destroy-view title-btn btn-32 active-view" : "destroy-view title-btn btn-32 inactive-view"}
          onClick={destroyView}>
          <img src={CloseImg} alt="Delete" draggable="false" />
          <span className="tooltip">Delete tab</span>
        </button>
        <TitleInput className="title-input" btnClassName={(viewId === activeViewId) ? "edit-title title-btn btn-32 active-view" : "edit-title title-btn btn-32 inactive-view"}
          type="view" btnSize={32}
          value={viewTitle} saveValue={v => dispatch(actions.updViewTitle(viewId, v))}
          setEditingParent={setEditingView} />
      </div>
    </Rnd>
  );
});

export default ViewTab;
