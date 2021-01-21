import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rnd } from 'react-rnd';

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";
import { useOutsideClick } from "../../../shared/utilityFunctions";

import CloseImg from "../../../media/icons/close.png";

const ViewTab = React.memo(props => {
  const dispatch = useDispatch();

  // VARIABLES
  const [editingTitle, setEditingTitle] = useState(false);

  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const activeViewId = useSelector(state => campaignId ? state.campaignColl[campaignId].activeViewId : null);
  const viewPos = Number(props.position); // positions start at 0

  const viewId = props.id;
  const viewData = viewColl[viewId];
  const viewTitle = viewData.title ? viewData.title : "";
  const viewTitleId = viewId+".title";
  const viewTitleRef = useRef(viewTitleId);

  const tabWidth = 250;

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
      setEditingTitle(false);
    }
  };

  useOutsideClick([viewTitleRef], editingTitle, endEdit);

  const updEdit = () => {
    if (editingTitle) {dispatch(actions.updViewTitle(viewId, viewTitleRef.current.value))}
  };

  const dragStopHandler = (event, data) => {
    // IMPLEMENT: viewPos needs updating... and posShift definition
    const posShift = Math.round((data.x - (viewPos*tabWidth)) / tabWidth);
    dispatch(actions.shiftViewInViewOrder(campaignId, viewId, posShift));
  };

  const clickHandler = () => {
    if (viewId !== activeViewId) {
      dispatch(actions.updActiveViewId(campaignId, viewId));
    }
  };

  const keyPressHandler = (event) => {
    if (viewId === activeViewId) {
      if (event.key === 'Enter') {
        endEdit();
      }
    }
  };

  const destroyView = () => dispatch(actions.destroyView(campaignId, viewId));

  // STYLES
  const toFrontStyle = {zIndex: viewId === activeViewId ? 10 : 0};

  const activeViewStyle = {
    backgroundColor: viewId === activeViewId ? "white" : "lightgray",
    borderRight: "1px solid black",
    borderTop: viewId === activeViewId ? "1px solid white" : "1px solid black",
  };

  const titleStyle = {
    backgroundColor: editingTitle ? 'lightskyblue' : 'transparent',
  }

  return (
    <Rnd style={toFrontStyle}
      // position and dragging properties
      bounds="parent" dragAxis="x"
      position={{x: viewPos * tabWidth, y: 0}}
      disableDragging={editingTitle || (viewId !== activeViewId)}
      dragHandleClassName="title"
      // size and resizing properties
      enableResizing={false}
      size={{width: tabWidth, height: 40}}
      // functions
      onDragStop={dragStopHandler}
    >
      <div className="viewTab" style={activeViewStyle}>
        <input id={viewTitleId} ref={viewTitleRef}
          className="title" style={titleStyle}
          type="text" required
          value={viewTitle}
          readOnly={!editingTitle}
          onClick={clickHandler}
          onDoubleClick={(viewId === activeViewId) ? beginEdit : null}
          onChange={updEdit}
          onKeyDown={(e) => keyPressHandler(e)}
        />
        <div className="divider" />
        <div className="button" 
          onClick={destroyView}>
          <img src={CloseImg} alt="Delete" draggable="false" />
          <span className="tooltip">Delete view</span>
        </div>
      </div>
    </Rnd>
  );
});

export default ViewTab;
