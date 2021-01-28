import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rnd } from "react-rnd";

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";
import { useOutsideClick } from "../../../shared/utilityFunctions";

import CloseImg from "../../../media/icons/close.png";

const ViewTab = React.memo(props => {
  const {viewId, containerId, tabWidth} = props;
  const dispatch = useDispatch();

  // STATES
  const [dragging, setDragging] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showColorSetting, setShowColorSetting] = useState(false);

  // STORE SELECTORS
  const campaignColl = useSelector(state => state.campaignColl);
  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const activeViewId = campaignColl[campaignId] ? campaignColl[campaignId].activeViewId : null;
  const viewOrder = campaignColl[campaignId] ? campaignColl[campaignId].viewOrder : [];

  // VARIABLES
  const viewPos = viewOrder.indexOf(viewId);
  const viewData = viewColl[viewId];
  const viewTitle = viewData.title ? viewData.title : "";
  const viewColor = viewData.color ? viewData.color : "gray";
  const scrollPos = document.getElementById(containerId).scrollLeft;

  // ID & REF
  const viewTitleId = viewId+".title";
  const viewTitleRef = useRef(viewTitleId);
  let rndRef = useRef(viewId+".rndref");

  // FUNCTIONS
  useEffect(() => {
    rndRef.updatePosition({x: viewPos*tabWidth, y: 0});
  }, [viewOrder]);

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
    setDragging(false);
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

  const colorButtonStyle = {
    backgroundColor: viewColor ? viewColor : "gray",
  };

  return (
    <Rnd ref={c => rndRef = c}
      style={toFrontStyle}
      // position and dragging properties
      bounds="parent" dragAxis="x"
      // position={{x: (viewPos*tabWidth-scrollPos), y: 0}}
      disableDragging={editingTitle}
      dragHandleClassName="title"
      // size and resizing properties
      enableResizing={false}
      size={{width: tabWidth, height: 40}}
      // functions
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
    >
      <div className="view-tab" style={activeViewStyle}>
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
        <div className="color button" style={colorButtonStyle}
          onClick={}>
        </div>
        <div className="destroy-view button" 
          onClick={destroyView}>
          <img src={CloseImg} alt="Delete" draggable="false" />
          {/* <span className="tooltip">Delete view</span> */}
        </div>
      </div>
    </Rnd>
  );
});

export default ViewTab;
