import React, { createContext, useState, memo } from 'react';

export const NglContext = createContext();

export const NglProvider = memo(props => {
  const [nglViewList, setNGLViewList] = useState([]);
  //let nglViewList = [];

  const registerNglView = (id, stage) => {
    if (nglViewList.filter(ngl => ngl.id === id).length > 0) {
      console.error('Cannot register NGL View with used ID!');
    } else {
      // nglViewList.push({ id, stage });
      let extendedList = nglViewList;
      extendedList.push({ id, stage });
      setNGLViewList(extendedList);
    }
  };

  const unregisterNglView = id => {
    if (nglViewList.filter(ngl => ngl.id === id).length === 0) {
      console.error('Cannot remove NGL View with given ID!');
    } else {
      /*  nglViewList = nglViewList.filter(value => {
        return value.id !== id;
      });*/
      let filteredList = nglViewList.filter(value => value.id !== id);
      setNGLViewList(filteredList);
    }
  };

  const getNglView = id => {
    const filteredList = nglViewList.length > 0 ? nglViewList.filter(ngl => ngl.id === id) : [];
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
    <NglContext.Provider value={{ nglViewList, registerNglView, getNglView, unregisterNglView }}>
      {props.children}
    </NglContext.Provider>
  );
});
