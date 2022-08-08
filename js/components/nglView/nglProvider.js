import React, { createContext, memo, useState } from 'react';

export const NglContext = createContext();

export const NglProvider = memo(props => {
  //const nglViewList = useRef([]);
  const [nglViewList, setNglViewList] = useState([]);

  const registerNglView = (id, stage) => {
    if (nglViewList.filter(ngl => ngl.id === id).length > 0) {
      console.log(new Error('Cannot register NGL View with used ID! ', id));
    } else {
      let extendedList = [...nglViewList];
      // let extendedList = nglViewList;
      extendedList.push({ id, stage });
      setNglViewList(extendedList);
    }
  };

  const unregisterNglView = id => {
    if (nglViewList.filter(ngl => ngl.id === id).length === 0) {
      console.log(new Error('Cannot remove NGL View with given ID! ', id));
    } else {
      for (let i = 0; i < nglViewList.length; i++) {
        if (nglViewList[i].id === id) {
          nglViewList.splice(i, 1);
          setNglViewList(nglViewList);
          break;
        }
      }
    }
  };

  const getNglView = id => {
    const filteredList = nglViewList && nglViewList.length > 0 ? nglViewList.filter(ngl => ngl.id === id) : [];
    switch (filteredList.length) {
      case 0:
        return undefined;
      case 1:
        return filteredList[0];
      default:
        console.log(new Error('Cannot found NGL View with given ID!'));
        break;
    }
  };

  return (
    <NglContext.Provider value={{ nglViewList, registerNglView, getNglView, unregisterNglView }}>
      {props.children}
    </NglContext.Provider>
  );
});
