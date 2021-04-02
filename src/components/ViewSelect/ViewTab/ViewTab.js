import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rnd } from "react-rnd";

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";
import { useOutsideClick } from "../../../shared/utilityFunctions";

import EditImg from '../../../assets/icons/edit-24.png';
import CloseImg from "../../../assets/icons/close.png";

const ViewTab = React.memo(props => {
  const {viewId, tabWidth} = props;
  const dispatch = useDispatch();

  // STATES
  const [dragging, setDragging] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  // STORE SELECTORS
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const viewOrder = useSelector(state => state.campaignData.viewOrder);
  const viewPos = viewOrder.indexOf(viewId);
  const viewTitle = useSelector(state => state.campaignData.views[viewId].title);

  // REF
  let rndRef = useRef();
  const viewTitleRef = useRef();

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

  const beginEdit = () => {
    if (!editingTitle) {
      viewTitleRef.current.focus();
      viewTitleRef.current.setSelectionRange(viewTitleRef.current.value.length, viewTitleRef.current.value.length);
      setEditingTitle(true);
    }
  };

  const endEdit = () => {
    if (editingTitle) setEditingTitle(false);
  };

  const updEdit = () => {
    if (editingTitle) dispatch(actions.updViewTitle(viewId, viewTitleRef.current.value));
  };

  const keyPressHandler = (event) => {
    if (event.key === 'Enter') endEdit();
  };

  useOutsideClick([viewTitleRef], editingTitle, endEdit);
  
  // STYLES
  const toFrontStyle = {
    zIndex: dragging ? 11 : viewId===activeViewId ? 10 : 1,
    height: "100%"
  };

  const activeViewStyle = {
    backgroundColor: viewId === activeViewId ? "white" : "lightgray",
    borderTop: viewId === activeViewId ? "1px solid white" : "1px solid black",
  };

  const titleStyle = { backgroundColor: editingTitle ? "lightskyblue" : "transparent" };

  return (
    <Rnd ref={node => rndRef = node}
      style={toFrontStyle}
      bounds="parent"
      // position
      // drag
      disableDragging={editingTitle}
      dragHandleClassName="title-input" dragAxis="x"
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={{width: tabWidth, height: 42}}
      // resize
      enableResizing={false}
      // onClick
    >
      <div className="view-tab" style={activeViewStyle}>
        <input ref={viewTitleRef}
          className="title-input" style={titleStyle} type="text" required
          value={viewTitle} title={viewTitle} readOnly={!editingTitle}
          onClick={(viewId !== activeViewId) ? () => dispatch(actions.updActiveViewId(viewId)) : null}
          onDoubleClick={(viewId === activeViewId) ? beginEdit : null}
          onChange={updEdit}
          onKeyDown={keyPressHandler}
        />
        <button className={(viewId === activeViewId) ? "edit-title title-btn btn-32 active-view" : "edit-title title-btn btn-32 inactive-view"}
          onClick={beginEdit}>
          <img src={EditImg} alt="Edit" draggable="false" />
          {/* <span className="tooltip">Edit title</span> */}
        </button>
        <button className={(viewId === activeViewId) ? "destroy-view title-btn btn-32 active-view" : "destroy-view title-btn btn-32 inactive-view"}
          onClick={destroyView}>
          <img src={CloseImg} alt="Delete" draggable="false" />
          {/* <span className="tooltip">Delete view</span> */}
        </button>
      </div>
    </Rnd>
  );
});

export default ViewTab;
