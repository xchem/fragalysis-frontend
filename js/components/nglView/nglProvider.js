import React, { createContext, memo, useRef } from 'react';

export const NglContext = createContext();

export const NglProvider = memo(props => {
  const nglViewList = useRef([]);

  const registerNglView = (id, stage) => {
    if (nglViewList.current.filter(ngl => ngl.id === id).length > 0) {
      console.error('Cannot register NGL View with used ID! ', id);
    } else {
      let extendedList = nglViewList.current;
      extendedList.push({ id, stage });
      nglViewList.current = extendedList;
    }
  };

  const unregisterNglView = id => {
    if (nglViewList.current.filter(ngl => ngl.id === id).length === 0) {
      console.error('Cannot remove NGL View with given ID! ', id);
    } else {
      for (let i = 0; i < nglViewList.current.length; i++) {
        if (nglViewList.current[i].id === id) {
          nglViewList.current.splice(i, 1);
          break;
        }
      }
    }
  };

  const getNglView = id => {
    const filteredList =
      nglViewList.current && nglViewList.current.length > 0 ? nglViewList.current.filter(ngl => ngl.id === id) : [];
    switch (filteredList.length) {
      case 0:
        return undefined;
      case 1:
        return filteredList[0];
      default:
        console.error('Cannot found NGL View with given ID!');
        break;
    }
  };

  return (
    <NglContext.Provider value={{ nglViewList: nglViewList.current, registerNglView, getNglView, unregisterNglView }}>
      {props.children}
    </NglContext.Provider>
  );
});
