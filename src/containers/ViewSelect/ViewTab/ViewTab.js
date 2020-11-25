import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rnd } from 'react-rnd';

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";
import { useOutsideClick } from "../../../shared/utilityFunctions";

import SettingsButton from "../../../media/icons/adjust.svg";
import ClosingButton from "../../../media/icons/close.svg";

const ViewTab = React.memo((props) => {
  const dispatch = useDispatch();

  // VARIABLES
  const [editingTitle, setEditingTitle] = useState(false);

  const viewColl = useSelector(state => state.view);
  const activeView = useSelector(state => state.viewManage.activeView);
  const viewOrder = useSelector(state => state.viewManage.viewOrder);
  const viewPos = Number(props.position); // positions start at 0

  const viewId = props.id;
  const viewData = viewColl[viewId];
  const viewTitle = viewData.title ? viewData.title : "untitled";
  const viewTitleId = viewId+"Title";
  const viewTitleRef = useRef(viewTitleId);

  const tabWidth = 300;

  // FUNCTIONS
  const beginEdit = () => {
    if (!editingTitle) {
      const title = document.getElementById(viewTitleId);
      title.focus();
      title.setSelectionRange(title.value.length, title.value.length);
      setEditingTitle(true);
    }
  };

  const endEdit = () => {
    if (editingTitle) {
      dispatch(actions.updViewTitle(viewId, viewTitleRef.current.value));
      setEditingTitle(false);
    }
  };

  const dragStopHandler = (event, data) => {
    const posShift = Math.round((data.x - (viewPos*tabWidth)) / tabWidth);
    let newPos = viewPos + posShift;
    if (newPos < 0) {newPos = 0}
    if (newPos >= viewOrder.length) {newPos = viewOrder.length-1}

    let newViewOrder = [...viewOrder];
    if (newPos !== viewPos) {
      newViewOrder.splice(viewPos, 1);
      newViewOrder.splice(newPos, 0, viewId);
      dispatch(actions.updViewOrder(newViewOrder));
    }
  };

  const clickHandler = () => {
    if (viewId !== activeView) {
      dispatch(actions.onClickView(viewId));
    }
  };

  const keyPressHandler = (event) => {
    if (viewId === activeView) {
      if (event.key === 'Enter') {
        endEdit();
      }
    }
  };

  const setViewDelete = () => dispatch(actions.setViewDelete(viewId));

  useOutsideClick(viewTitleRef, endEdit);

  // STYLES
  const toFrontStyle = {zIndex: viewId === activeView ? 10 : 0};
  const activeViewStyle = {
    backgroundColor: viewId === activeView ? "white" : "lightgray",
    border: "1px solid black",
    borderTop: viewId === activeView ? "1px solid white" : "1px solid black",
  };

  return (
    <Rnd style={toFrontStyle}
      // position and dragging properties
      bounds="parent" dragAxis="x"
      position={{x: viewPos * tabWidth, y: 0}}
      // dragGrid={[tabWidth, 0]}
      disableDragging={editingTitle || (viewId !== activeView)}
      dragHandleClassName="title"
      // size and resizing properties
      enableResizing={false}
      size={{width: tabWidth, height: 40}}
      // functions
      onDragStop={dragStopHandler}
    >
      <div className="viewTab" style={activeViewStyle}>
        <input ref={viewTitleRef} id={viewTitleId}
          className="title" style={viewId === activeView ? { backgroundColor: "white" } : null}
          type="text" required
          defaultValue={viewTitle}
          readOnly={!editingTitle}
          onClick={clickHandler}
          onDoubleClick={(viewId === activeView) ? beginEdit : null}
          onKeyDown={(e) => keyPressHandler(e)}
        />
        {/* <label className="titleBarButtons">
          <input type="image"
            style={viewId === activeView ? { backgroundColor: "white" } : null}
            src={SettingsButton} alt="Settings"
          />
        </label> */}
        <label className="titleBarButtons">
          <input type="image"
            style={viewId === activeView ? { backgroundColor: "white" } : null}
            src={ClosingButton} alt="Delete"
            onClick={setViewDelete}
          />
        </label>
      </div>
    </Rnd>
  );
});

export default ViewTab;
