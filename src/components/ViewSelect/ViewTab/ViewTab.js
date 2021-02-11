import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rnd } from "react-rnd";

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";
import { useOutsideClick } from "../../../shared/utilityFunctions";
import { VIEW_TITLEBAR_COLORS } from "../../../shared/constants/colors";

import CloseImg from "../../../assets/icons/close.png";

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
  // const scrollPos = document.getElementById(containerId).scrollLeft;

  // ID & REF
  let rndRef = useRef(viewId+".rndref");
  const viewTitleId = viewId+".title";
  const viewTitleRef = useRef(viewTitleId);
  const colorSettingId = viewId+".color-setting";
  const colorSettingRef = useRef(colorSettingId);
  const colorSettingBtnRef = useRef(colorSettingId+".btn");

  // FUNCTIONS
  useEffect(() => {
    rndRef.updatePosition({x: viewPos*tabWidth, y: 0});
  }, [viewOrder]);

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

  const updViewColor = (color) => dispatch(actions.updViewColor(viewId, color));

  const destroyView = () => dispatch(actions.destroyView(campaignId, viewId));

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
  useOutsideClick([colorSettingRef, colorSettingBtnRef], showColorSetting, setShowColorSetting, false);
  
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

  // DISPLAY ELEMENTS
  let colorList = [];
  for (let color in VIEW_TITLEBAR_COLORS) {
    let colorStyle = {
      backgroundColor: color,
      border: viewColl[viewId].color === color ? "2px solid white" : "1px solid black",
    };
    colorList = [
      ...colorList,
      <div key={color} className="color-button" style={colorStyle} onClick={() => updViewColor(color)} />
    ];
  }

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
        <div className="view-tab-divider" />
        {/* IMPLEMENT (low tier): color tabs 
        <div ref={colorSettingBtnRef} className="color button-32" onClick={() => setShowColorSetting(!showColorSetting)}>
          <div className="color-display" style={{backgroundColor: viewColor}} />
        </div> */}
        <div className="view-tab-divider" />
        <div className="destroy-view button-32" onClick={destroyView}>
          <img src={CloseImg} alt="Delete" draggable="false" />
          {/* <span className="tooltip">Delete</span> */}
        </div>
        <div ref={colorSettingRef} className="color-setting" style={{width: showColorSetting ? "160px" : 0}}>
          {colorList}
        </div>
      </div>
    </Rnd>
  );
});

export default ViewTab;
