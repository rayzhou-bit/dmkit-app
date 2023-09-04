import {useEffect} from 'react';

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const useOutsideClick = (refs, condition, handler) => {
  //  Props:
  //    refs: <array> of useRefs that the user can click without triggering the handler
  //    condition: <boolean> that determines if the handler should be run
  //    handler: <function> that runs onclick if condition and refs are met
  useEffect(() => {
    const handleClickOutside = (event) => {
      let runHandler = true;
      refs.forEach(ref => {
        if (ref.current && ref.current.contains(event.target)) {
          runHandler = false;
        }
      });
      // for (let i = 0; i < refs.length && runHandler; i++) {
      //   const ref = refs[i];
      //   if (ref.current && ref.current.contains(event.target)) {
      //     console.log('test', ref)
      //     runHandler = false;
      //   }
      // }
      
      if (runHandler && refs.length > 0) {
        handler();
      }
    };

    if (condition) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

    // adding refs and handler as dependencies below causes an issue with re-renders
    // these re-renders keep other useOutsideClicks from completing their run
    // TODO figure out a way around this for exhaustive-deps
  }, [condition]);
};

export const getParameterByName = (name) => {
  // Sample action handle URL:
  // https://example.com/usermgmt?mode=resetPassword&oobCode=ABC123&apiKey=AIzaSy...&lang=fr

  let value = window.location.href;
  if (value) {
    value = value.split(name+"=")[1];
  }
  if (value) {
    value = value.split('&')[0];
  }

  return value;
};

export const statBlockParser = (text) => {
  let statBlock;
  return statBlock;
};