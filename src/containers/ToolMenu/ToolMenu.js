import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';

import AddImg from '../../media/icons/add.png';
import CopyImg from '../../media/icons/copy.png';
import SaveImg from '../../media/icons/save.png';

const ToolMenu = React.memo(props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // VARIABLES
  const userId = useSelector(state => state.user.user);
  const campaignId = useSelector(state => state.campaignManage.activeCampaign);
  const cardColl = useSelector(state => state.cardColl);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const cardCreate = useSelector(state => state.cardManage.cardCreate);
  const cardCreateCnt = useSelector(state => state.cardManage.createCount);
  const cardDelete = useSelector(state => state.cardManage.cardDelete);
  const viewColl = useSelector(state => state.viewColl);
  const viewDelete = useSelector(state => state.viewManage.viewDelete);
  const activeView = useSelector(state => state.viewManage.activeView);
  const viewOrder = useSelector(state => state.viewManage.viewOrder);
  const editedViewOrder = useSelector(state => state.viewManage.editedViewOrder);

  // FUNCTIONS
  const setCardCreate = () => dispatch(actions.setCardCreate(cardCreateCnt, activeView));

  const setCardCopy = () => {
    if (activeCard) {
      dispatch(actions.setCardCopy(cardColl[activeCard], activeView, cardCreateCnt));
    }
  };

  const saveEditedData = () => {
    if (userId) {
      // IMPLEMENT: dispatch(actions.saveCampaignDataToServer())
    } else {
      // IMPLEMENT: ask for player log in or sign up
    }
  };

  // STYLES
  const topOffset = 50;
  const buttonHeight = 30 + 11;
  const dividerHeight = 30 / 4;

  return (
    <div id="toolMenu" ref={toolMenuRef}>
      <div className="divider" />
      <div className="create-card button" onClick={setCardCreate}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">Add a card</span>
      </div>
      <div className="copy-card button" onClick={setCardCopy}>
        <img src={CopyImg} alt="Copy" draggable="false" />
        <span className="tooltip">Copy selected card</span>
      </div>
      <div className="divider" />
      <div className="save-campaign button" onClick={saveEditedData}>
        <img src={SaveImg} alt="Save" draggable="false" />
        <span className="tooltip">Save project</span>
      </div>
      <div className="divider" />
    </div>
  );
});

export default ToolMenu;