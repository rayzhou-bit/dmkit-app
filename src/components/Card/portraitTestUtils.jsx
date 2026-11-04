import React from 'react';

import { usePortraitHooks } from './hooks';

// Card/LibraryCard own the portrait hook in the app and pass it to Content;
// content-level tests render Content directly, so this stands in for them.
export const withPortraitHooks = (Component) => {
  const Wrapped = (props) => <Component {...props} portraitHooks={usePortraitHooks({ cardId: props.cardId })} />;
  return Wrapped;
};
