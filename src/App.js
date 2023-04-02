import React, { useRef } from 'react';

import './App.scss';
import Loader from './components/Loader/Loader';
import HeaderBar from './components/HeaderBar/HeaderBar';
import ToolMenu from './components/ToolMenu/ToolMenu';
import Library from './components/Library/Library';
import TabBar from './components/TabBar/TabBar';
import ViewScreen from './components/ViewScreen/ViewScreen';

const App = props => {
  // REFS
  const toolMenuRef = useRef();

  // Disable scrolling
  document.body.scroll = "no";
  document.body.style.backgroundColor = 'gray';
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;

  return (
    <div className="layout">
      <Loader />
      {/* <HeaderBar />
      <ToolMenu toolMenuRef={toolMenuRef} />
      <Library />
      <TabBar /> */}
      {/* <ViewScreen toolMenuRef={toolMenuRef} /> */}
    </div>
  );
};

export default App;
