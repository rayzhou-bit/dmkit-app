import React from 'react';

import './Layout.scss';
import ToolMenu from '../../containers/ToolMenu/ToolMenu';
import ViewScreen from '../../containers/ViewScreen/ViewScreen';
import ViewSelect from '../../containers/ViewSelect/ViewSelect';

const layout = props => {
  return (
    <div id="layout">
      <div id="userMenu">USER/CAMPAIGN PLACEHOLDER</div>
      <ToolMenu id="toolMenu" />
      <ViewScreen id="viewScreen">{props.children}</ViewScreen>
      <div id="library">P</div>
      <ViewSelect id="viewSelect" />
    </div>
  );
}

export default layout;