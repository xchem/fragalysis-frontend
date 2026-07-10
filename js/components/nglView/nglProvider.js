import React, { createContext, memo, useCallback, useRef, useState } from 'react';
import { asViewerAdapter } from '../../viewer';

export const NglContext = createContext();

export const NglProvider = memo(props => {
  //const nglViewList = useRef([]);
  const [nglViewList, setNglViewList] = useState([]);
  const viewerAdapters = useRef(new Map());

  const registerNglView = useCallback((id, viewer) => {
    console.count(`registerNglView`);
    setNglViewList(currentViews => {
      if (currentViews.some(view => view.id === id)) {
        console.log(new Error('Cannot register NGL View with used ID! ', id));
        return currentViews;
      }

      const viewerAdapter = asViewerAdapter(viewer);
      viewerAdapters.current.set(id, viewerAdapter);
      return [...currentViews, { id, stage: viewerAdapter.getNativeViewer() }];
    });
  }, []);

  const unregisterNglView = useCallback(id => {
    console.count(`unregisterNglView`);
    setNglViewList(currentViews => {
      if (!currentViews.some(view => view.id === id)) {
        console.log(new Error('Cannot remove NGL View with given ID! ', id));
        return currentViews;
      }

      viewerAdapters.current.delete(id);
      return currentViews.filter(view => view.id !== id);
    });
  }, []);

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

  const getViewerAdapter = useCallback(id => viewerAdapters.current.get(id), []);

  return (
    <NglContext.Provider value={{ nglViewList, registerNglView, getNglView, getViewerAdapter, unregisterNglView }}>
      {props.children}
    </NglContext.Provider>
  );
});
