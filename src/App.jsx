import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import './App.scss';
import HeaderMenu from './components/HeaderMenu';
import ToolMenu from './components/ToolMenu';
import Library from './components/Library';
import TabBar from './components/TabBar';
import Canvas from './components/Canvas';
import Popup from './components/Popup';

const App = () => {
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const [ isToolMenuOpen, setIsToolMenuOpen ] = useState(!!activeProject);
  const toolMenuRef = useRef();

  useEffect(() => {
    setIsToolMenuOpen(!!activeProject);
  }, [activeProject]);

  // Disable scrolling
  document.body.scroll = 'no';
  document.body.style.backgroundColor = 'gray';
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;

  // TODO create initialize function and move login stuff into it from Canvas.jsx

  return (
    <div className='layout'>
      <HeaderMenu
        isToolMenuOpen={isToolMenuOpen}
        toggleToolMenu={() => {
          if (activeProject) {
            setIsToolMenuOpen(!isToolMenuOpen);
          }
         }} />
      <ToolMenu toolMenuRef={toolMenuRef} isOpen={isToolMenuOpen} />
      <Library />
      <TabBar />
      <Canvas toolMenuRef={toolMenuRef} />
      <Popup />
    </div>
  );
};

export default App;
