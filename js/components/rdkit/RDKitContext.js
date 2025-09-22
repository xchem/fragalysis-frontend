import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRDKITScriptLoaded } from '../../reducers/api/actions';

const RDKitContext = createContext(null);

export const RDKitProvider = ({ children }) => {
  const dispatch = useDispatch();

  const [RDKitModule, setRDKitModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [RDKitReady, setRDKitReady] = useState(false);

  const isRDKitScriptLoaded = useSelector(state => state.apiReducers.rdkitScriptLoaded); // Check if the script is already loaded

  useEffect(() => {
    // https://www.rdkitjs.com/
    // https://github.com/rdkit/rdkit-js
    // https://github.com/rdkit/rdkit-js/blob/master/typescript/index.d.ts
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js';
    script.async = true;

    script.onload = async () => {
      // Poll until window.initRDKitModule is defined
      const waitForRDKit = () => {
        return new Promise(resolve => {
          const check = () => {
            if (window.initRDKitModule) {
              resolve();
            } else {
              requestAnimationFrame(check); // try again on next frame
            }
          };
          check();
        });
      };

      await waitForRDKit();
      setRDKitReady(true);
      dispatch(setRDKITScriptLoaded(true));
    };

    document.body.appendChild(script);
  }, [dispatch]);

  useEffect(() => {
    const loadRDKit = async () => {
      try {
        console.log('RDKIT - Loading RDKit module...');
        let RDKit = null;
        console.log(
          `RDKIT - Prerequisites: isRDKitScriptLoaded: ${isRDKitScriptLoaded}, RDKitModule: ${!!RDKitModule}, window.initRDKitModule: ${!!window.initRDKitModule}, RDKitReady: ${RDKitReady}`
        );
        if (isRDKitScriptLoaded && !RDKitModule && window.initRDKitModule && RDKitReady) {
          console.log(
            `RDKIT - all prerequisites are met, going to load RDKit module. Prerequisites: isRDKitScriptLoaded: ${isRDKitScriptLoaded}, RDKitModule: ${!!RDKitModule}, window.initRDKitModule: ${!!window.initRDKitModule}, RDKitReady: ${RDKitReady}`
          );
          RDKit = await window.initRDKitModule({
            locateFile: file => {
              if (file.endsWith('.wasm')) {
                return 'https://unpkg.com/@rdkit/rdkit/dist/' + file;
              }
              return file;
            }
          });
          if (!RDKit) {
            console.error('RDKIT - Failed to load RDKit module');
          } else {
            setRDKitModule(RDKit);
            console.log('RDKIT - RDKit module loaded successfully');
          }
        }
      } catch (err) {
        console.error('Failed to initialize RDKit:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRDKit();
  }, [RDKitModule, RDKitReady, isRDKitScriptLoaded]);

  return <RDKitContext.Provider value={{ RDKitModule, loading }}>{children}</RDKitContext.Provider>;
};

export const useRDKit = () => useContext(RDKitContext);
