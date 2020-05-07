import React from 'react';

import './Layout.css';
import ToolMenu from '../../components/ToolMenu/ToolMenu';
import ViewScreen from '../../containers/ViewScreen/ViewScreen';

const layout = props => {
  return (
    <div className="Layout">
      <ViewScreen>{props.children}</ViewScreen>
    </div>
  );
}

export default layout;