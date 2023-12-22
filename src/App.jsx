import React, { useRef } from 'react';

import './App.scss';
import Loader from './components/Loader/Loader';
import HeaderMenu from './components/HeaderMenu';
import ToolMenu from './components/ToolMenu/ToolMenu';
import Library from './components/Library/Library';
import ViewSelect from './components/ViewSelect/ViewSelect';
import Canvas from './containers/Canvas/Canvas';
import Popup from './sharedComponents/Popup';
import { resetPopup } from './store/actionIndex';

const App = () => {
  const dispatch = useDispatch();
  const popup = useSelector((state) => state.sessionManager.popup);

  // REFS
  const toolMenuRef = useRef();

  // Disable scrolling
  document.body.scroll = 'no';
  document.body.style.backgroundColor = 'gray';
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;

  return (
    <div className='layout'>
      <Loader />
      <HeaderMenu />
      <ToolMenu toolMenuRef={toolMenuRef} />
      <Library />
      <ViewSelect />
      <Canvas toolMenuRef={toolMenuRef} />
      <Popup resetCallback={() => dispatch(resetPopup())} type={popup.type} />
    </div>
  );
};

export default App;
