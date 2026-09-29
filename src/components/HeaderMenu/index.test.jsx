import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import HeaderMenu from './index';
// Real store, same precedent as LibraryCard.test.jsx - the header's subtree
// (Title, VersionControls, SignIn) reads enough of the store that a fake
// would be more fragile than the actual reducers.
import store, { actions } from '../../data/redux';

const renderHeader = (props) => render(
  <Provider store={store}>
    <HeaderMenu isToolMenuOpen={false} {...props} />
  </Provider>
);

// The ToolMenu toggle is the only header control tied to a component that
// mobile doesn't render at all, so App.jsx withholds the handler there
// rather than hiding the button in CSS.
describe('HeaderMenu - ToolMenu toggle', () => {
  beforeEach(() => {
    store.dispatch(actions.session.setActiveProject({ id: 'proj1' }));
  });

  it('renders the toggle when a project is open and a handler is given', () => {
    const { container } = renderHeader({ toggleToolMenu: () => {} });
    expect(container.querySelector('button.expand')).not.toBeNull();
  });

  it('omits the toggle with no handler - mobile has no ToolMenu to collapse', () => {
    const { container } = renderHeader({ toggleToolMenu: undefined });
    expect(container.querySelector('button.expand')).toBeNull();
  });

  it('omits the toggle with no project open, handler or not', () => {
    store.dispatch(actions.session.setActiveProject({ id: '' }));
    const { container } = renderHeader({ toggleToolMenu: () => {} });
    expect(container.querySelector('button.expand')).toBeNull();
  });
});
