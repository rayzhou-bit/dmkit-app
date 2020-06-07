import React from 'react';

import './Layout.scss';
import View from '../../containers/View/View';
import ToolMenu from '../../components/ToolMenu/ToolMenu';
import ViewSelect from '../../components/ViewSelect/ViewSelect';

const layout = props => {
  return (
    <div className="Layout">
      <View>{props.children}</View>
      <ToolMenu />
      <ViewSelect />
    </div>
  );
}

export default layout;