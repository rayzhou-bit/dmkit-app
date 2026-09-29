import { useEffect, useState } from 'react';

// Below this, App.jsx swaps ToolMenu/Library/TabBar/Canvas for MobileView -
// a JS breakpoint (not just CSS) since we're branching component trees.
export const MOBILE_QUERY = '(max-width: 768px)';

// jsdom (Vitest) doesn't implement matchMedia at all - calling it throws.
// Falling back to "not mobile" keeps every existing test on the desktop
// path, which is what they were written against.
const supportsMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => supportsMatchMedia() && window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    if (!supportsMatchMedia()) return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (event) => setIsMobile(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
};

export default useIsMobile;
