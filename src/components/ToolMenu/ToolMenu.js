import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';
import Button from './Button/Button';

import AddImg from '../../assets/icons/add-32.png';
import CopyImg from '../../assets/icons/copy-32.png';

const ToolMenu = props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // STORE VALUES
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);

  return (
    <div className="tool-menu" ref={toolMenuRef}>
      {/* new card */}
      <Button pos={0} disabled={!activeViewId}
        img={AddImg} name={"new"} tooltip={"New Card"} 
        clicked={() => dispatch(actions.createCard())}
      />
      {/* copy card */}
      <Button pos={1} disabled={!activeViewId || !activeCardId}
        img={CopyImg} name={"copy"} tooltip={"Copy Card"}
        clicked={() => dispatch(actions.copyCard(activeCardId))}
      />
      
      <Button pos={2} disabled
        name={"image"} tooltip={"New Image"}
      />
      <Button pos={3} disabled
        name={"stat"} tooltip={"Statblock"}
      />
    </div>
  );
};

export default ToolMenu;