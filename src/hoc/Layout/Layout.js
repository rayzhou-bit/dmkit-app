import React, { useState } from 'react';

import './Layout.scss';
import ToolMenu from '../../containers/ToolMenu/ToolMenu';
import ViewScreen from '../../containers/ViewScreen/ViewScreen';
import Library from '../../containers/Library/Library';
import ViewSelect from '../../containers/ViewSelect/ViewSelect';

const Layout = props => {
  // const [showLibrary, setShowLibrary] = useState(false);

  return (
    <div id="layout">
      <div id="userMenu">USER/CAMPAIGN PLACEHOLDER</div>
      <ToolMenu id="toolMenu" />
      <ViewScreen id="viewScreen">{props.children}</ViewScreen>
      <Library id="library" />
      <ViewSelect id="viewSelect" />
    </div>
  );
}

export default Layout;