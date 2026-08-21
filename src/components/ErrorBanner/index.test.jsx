import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import ErrorBanner from './index';

const makeStore = (error) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ session: { error } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

describe('ErrorBanner', () => {
  it('renders nothing when there is no error', () => {
    const { container } = render(<Provider store={makeStore(null)}><ErrorBanner /></Provider>);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the error message and dispatches session/clearError on dismiss', () => {
    const store = makeStore({ source: 'save', message: "Firebase isn't configured." });
    render(<Provider store={store}><ErrorBanner /></Provider>);

    expect(screen.getByText("Firebase isn't configured.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(store.dispatched.some(a => a.type === 'session/clearError')).toBe(true);
  });
});
