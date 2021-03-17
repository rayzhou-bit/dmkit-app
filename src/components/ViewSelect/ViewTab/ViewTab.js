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

  // ID & REF
  let rndRef = useRef(viewId+".rndref");
  const viewTitleRef = useRef(viewId+".title");

  // FUNCTIONS
  useEffect(() => {
    rndRef.updatePosition({x: viewPos*tabWidth, y: 0});
  }, [viewOrder]);

  const dragStopHandler = (event, data) => {
    setDragging(false);
    const posShift = Math.round((data.x - (viewPos*tabWidth)) / tabWidth);
    dispatch(actions.shiftViewInViewOrder(viewId, posShift));
  };

  const clickHandler = () => {
    if (viewId !== activeViewId) {
      dispatch(actions.updActiveViewId(viewId));
    }
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
    if (editingTitle) {
      setEditingTitle(false);
    }
  };

  const updEdit = () => {
    if (editingTitle) {dispatch(actions.updViewTitle(viewId, viewTitleRef.current.value))}
  };

  const keyPressHandler = (event) => {
    if (viewId === activeViewId) {
      if (event.key === 'Enter') {
        endEdit();
      }
    }
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

  const titleStyle = {
    backgroundColor: editingTitle ? "lightskyblue" : "transparent",
  };

  return (
    <Rnd ref={c => rndRef = c}
      style={toFrontStyle}
      bounds="parent"
      // position
      // position={{x: (viewPos*tabWidth-scrollPos), y: 0}}
      // drag
      disableDragging={editingTitle}
      dragHandleClassName="title" dragAxis="x"
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={{width: tabWidth, height: 40}}
      // resize
      enableResizing={false}
      // onClick
    >
      <div className="view-tab" style={activeViewStyle}>
        <input ref={viewTitleRef}
          className="title-input" style={titleStyle} type="text" required
          value={viewTitle} readOnly={!editingTitle}
          onClick={clickHandler}
          onDoubleClick={(viewId === activeViewId) ? beginEdit : null}
          onChange={updEdit}
          onKeyDown={(e) => keyPressHandler(e)}
        />
        {/* <div className="view-tab-divider" /> */}
        <button className="edit-title title-btn btn-32"
          onClick={() => beginEdit()}>
          <img src={EditImg} alt="Edit" draggable="false" />
          <span className="tooltip">Edit title</span>
        </button>
        <button className="destroy-view title-btn btn-32" style={{backgroundColor: viewId === activeViewId ? "white" : null}}
          onClick={destroyView}>
          <img src={CloseImg} alt="Delete" draggable="false" />
          <span className="tooltip">Delete</span>
        </button>
      </div>
    </Rnd>
  );
});

export default ViewTab;
