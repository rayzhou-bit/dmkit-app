import React from 'react';

import './Layout.scss';
import ViewScreen from '../../containers/View/ViewScreen';
import ToolMenu from '../../components/ToolMenu/ToolMenu';
import ViewSelect from '../../components/ViewSelect/ViewSelect';

const layout = props => {
  return (
    <div id="layout">
      <ViewScreen>{props.children}</ViewScreen>
      <ToolMenu />
      <ViewSelect />
    </div>
  );
}

export default layout;