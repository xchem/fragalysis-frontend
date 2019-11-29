import React, { createContext, useState, memo } from 'react';
import { VIEWS } from '../../constants/constants';
import { Stage } from 'ngl';

export const NglContext = createContext();

export const NglProvider = memo(props => {
  const [nglViewList, setNGLViewList] = useState([
    { id: VIEWS.MAJOR_VIEW, current: new Stage(VIEWS.MAJOR_VIEW) },
    { id: VIEWS.SUMMARY_VIEW, current: new Stage(VIEWS.SUMMARY_VIEW) }
  ]);

  const registerNglView = (id, current) => {
    if (nglViewList.filter(ngl => ngl.id === id) > 0) {
      console.error('Cannot register NGL View with used ID!');
    } else {
      setNGLViewList(nglViewList.push({ id, current }));
    }
  };

  const getNglView = id => {
    const filteredList = nglViewList.filter(ngl => ngl.id === id);
    switch (filteredList.length) {
      case 0:
        return null;
      case 1:
        return filteredList[0];
      default:
        console.error('Cannot found NGL View with given ID!');
        break;
    }
  };

  return (
    <NglContext.Provider value={{ nglViewList, registerNglView, getNglView }}>{props.children}</NglContext.Provider>
  );
});
