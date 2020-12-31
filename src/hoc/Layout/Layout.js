import React, { useRef } from 'react';

import './Layout.scss';
import UserMenu from '../../containers/UserMenu/UserMenu';
import ToolMenu from '../../containers/ToolMenu/ToolMenu';
import ViewScreen from '../../containers/ViewScreen/ViewScreen';
import Library from '../../containers/Library/Library';
import ViewSelect from '../../containers/ViewSelect/ViewSelect';

const Layout = props => {
  const toolMenuRef = useRef("toolMenu");

  return (
    <div id="layout">
      <UserMenu id="userMenu" />
      <ToolMenu id="toolMenu" toolMenuRef={toolMenuRef} />
      <Library id="library" />
      <ViewSelect id="viewSelect" />
      <ViewScreen id="viewScreen" toolMenuRef={toolMenuRef} />
    </div>
  );
}

export default Layout;