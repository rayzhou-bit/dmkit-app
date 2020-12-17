import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';

import AddButton from '../../media/icons/add.png';
import CopyButton from '../../media/icons/copy.png';
import SaveButton from '../../media/icons/save.png';

const ToolMenu = React.memo(props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // VARIABLES
  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const cardDelete = useSelector(state => state.cardManage.cardDelete);
  const viewColl = useSelector(state => state.view);
  const viewDelete = useSelector(state => state.viewManage.viewDelete);
  const activeView = useSelector(state => state.viewManage.activeView);
  const viewOrder = useSelector(state => state.viewManage.viewOrder);

  // FUNCTIONS
  const setCardCreate = () => dispatch(actions.setCardCreate(user, campaign, activeView));

  const copyCard = () => {
    if (activeCard) {
      dispatch(actions.copyCard(user, campaign, cardColl[activeCard], activeView));
    }
  };

  const saveEditedData = () => {
    dispatch(actions.saveCards(user, campaign, cardColl, cardDelete));
    dispatch(actions.saveViews(user, campaign, viewColl, viewDelete, viewOrder));
  };

  return (
    <div id="toolMenu" ref={toolMenuRef}>
      <div class="tooltip" onClick={setCardCreate}>
        <img src={AddButton} alt="Add" />
        <span class="tooltiptext">Add a card</span>
      </div>
      <div class="tooltip" onClick={copyCard}>
        <img src={CopyButton} alt="Copy" />
        <span class="tooltiptext">Copy selected card</span>
      </div>
      <div class="tooltip" onClick={saveEditedData}>
        <img src={SaveButton} alt="Save" />
        <span class="tooltiptext">Save</span>
      </div>
    </div>
  );
});

export default ToolMenu;