import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Provider } from 'react-redux';
import {
  MoorhenContainer,
  MoorhenReduxStore,
  emptyMaps,
  emptyMolecules,
  emptyVectors,
  resetBackupSettings,
  resetGeneralStates,
  resetHoveringStates,
  resetMapContourSettings,
  resetSceneSettings
} from 'moorhen';
import { moorhenProofConfig } from '../../config/moorhenProof';
import { assertMoorhenTutorialLoaded, fetchMoorhenTutorialFiles } from './moorhenProofResources';
import { initializeMoorhenCcp4Module } from './moorhenCcp4';
import MoorhenViewerAdapter from '../../viewer/MoorhenViewerAdapter';

const MOORHEN_NAVBAR_HEIGHT = 48;

const createMemoryStorage = () => {
  const items = new Map();

  return {
    clear: async () => items.clear(),
    getItem: async key => (items.has(key) ? items.get(key) : null),
    keys: async () => Array.from(items.keys()),
    removeItem: async key => items.delete(key),
    setItem: async (key, value) => {
      items.set(key, value);
      return value;
    }
  };
};

const getMoorhenInitializationState = () => {
  const { cootInitialized, userPreferencesMounted } = MoorhenReduxStore.getState().generalStates;

  return cootInitialized === true && userPreferencesMounted === true;
};

const resetMoorhenStore = store => {
  [
    emptyMolecules,
    emptyMaps,
    emptyVectors,
    resetGeneralStates,
    resetSceneSettings,
    resetBackupSettings,
    resetHoveringStates,
    resetMapContourSettings
  ].forEach(createAction => store.dispatch(createAction()));
};

const MoorhenProofStatus = ({ status, counts, error }) => {
  const statusContent = {
    initializing: { icon: <CircularProgress size={18} color="inherit" />, label: 'Starting Moorhen runtimes...' },
    loading: { icon: <CircularProgress size={18} color="inherit" />, label: 'Loading tutorial structure and map...' },
    ready: {
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      label: `Moorhen ready: ${counts.molecules} molecule${counts.molecules === 1 ? '' : 's'}, ${counts.maps} map${
        counts.maps === 1 ? '' : 's'
      }`
    },
    error: { icon: <ErrorOutlineIcon fontSize="small" />, label: error || 'Moorhen failed to start' }
  }[status];

  return (
    <Box
      role="status"
      aria-live="polite"
      data-moorhen-proof-status={status}
      data-moorhen-molecule-count={counts.molecules}
      data-moorhen-map-count={counts.maps}
      data-cross-origin-isolated={typeof window !== 'undefined' && window.crossOriginIsolated === true}
      sx={{
        position: 'absolute',
        left: 12,
        bottom: 12,
        zIndex: theme => theme.zIndex.tooltip,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        maxWidth: 'calc(100% - 24px)',
        px: 1.25,
        py: 0.75,
        color: '#fff',
        backgroundColor: status === 'error' ? 'rgba(160, 28, 28, 0.92)' : 'rgba(20, 25, 32, 0.88)',
        borderRadius: 1,
        pointerEvents: 'none'
      }}
    >
      {statusContent.icon}
      <Typography variant="body2" sx={{ color: 'inherit' }}>
        {statusContent.label}
      </Typography>
    </Box>
  );
};

const MoorhenProofViewer = () => {
  const containerRef = useRef(null);
  const glRef = useRef(null);
  const timeCapsuleRef = useRef(null);
  const commandCentre = useRef(null);
  const moleculesRef = useRef(null);
  const mapsRef = useRef(null);
  const activeMapRef = useRef(null);
  const lastHoveredAtomRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const viewerAdapterRef = useRef(null);
  const loadStartedRef = useRef(false);
  const backupStorageRef = useRef(createMemoryStorage());
  const [status, setStatus] = useState('initializing');
  const [counts, setCounts] = useState({ molecules: 0, maps: 0 });
  const [error, setError] = useState('');
  const [ccp4ModuleReady, setCcp4ModuleReady] = useState(false);
  const isMoorhenInitialized = useSyncExternalStore(
    MoorhenReduxStore.subscribe,
    getMoorhenInitializationState,
    getMoorhenInitializationState
  );
  const monomerLibraryPath = `${moorhenProofConfig.assetUrl}/baby-gru/monomers`;

  useEffect(() => {
    let isMounted = true;

    initializeMoorhenCcp4Module({ assetUrl: moorhenProofConfig.assetUrl })
      .then(() => {
        if (isMounted) {
          setCcp4ModuleReady(true);
        }
      })
      .catch(moduleError => {
        if (isMounted) {
          setError(moduleError instanceof Error ? moduleError.message : String(moduleError));
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getMoorhenDimensions = useCallback(() => {
    const width = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
    const height = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;

    return [Math.max(width, 1), Math.max(height - MOORHEN_NAVBAR_HEIGHT, 1)];
  }, []);

  useEffect(() => {
    if (!ccp4ModuleReady || !isMoorhenInitialized || loadStartedRef.current) {
      return undefined;
    }

    loadStartedRef.current = true;
    let isMounted = true;
    const abortController = new AbortController();

    const loadTutorial = async () => {
      setStatus('loading');

      try {
        const files = await fetchMoorhenTutorialFiles({
          assetUrl: moorhenProofConfig.assetUrl,
          signal: abortController.signal
        });

        if (!isMounted) {
          return;
        }

        viewerAdapterRef.current = new MoorhenViewerAdapter({
          commandCentre,
          glRef,
          store: MoorhenReduxStore,
          monomerLibraryPath,
          containerElement: containerRef
        });
        await viewerAdapterRef.current.loadMolecule(files[0], {
          name: files[0].name,
          representation: 'CRs',
          center: true
        });
        await viewerAdapterRef.current.loadMap(files[1], { name: files[1].name, ext: 'mtz', autoRead: true });
        const loadedCounts = assertMoorhenTutorialLoaded(MoorhenReduxStore);

        if (isMounted) {
          setCounts(loadedCounts);
          setStatus('ready');
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
          setStatus('error');
        }
      }
    };

    loadTutorial();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [ccp4ModuleReady, isMoorhenInitialized, monomerLibraryPath]);

  useEffect(
    () => () => {
      viewerAdapterRef.current
        ?.destroy()
        .catch(cleanupError => console.error('Unable to clean up Moorhen proof adapter', cleanupError));
    },
    []
  );

  return (
    <Box
      ref={containerRef}
      data-moorhen-proof-route
      sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', bgcolor: '#000' }}
    >
      <MoorhenContainer
        glRef={glRef}
        timeCapsuleRef={timeCapsuleRef}
        commandCentre={commandCentre}
        moleculesRef={moleculesRef}
        mapsRef={mapsRef}
        activeMapRef={activeMapRef}
        lastHoveredAtomRef={lastHoveredAtomRef}
        videoRecorderRef={videoRecorderRef}
        urlPrefix={`${moorhenProofConfig.assetUrl}/baby-gru`}
        monomerLibraryPath={monomerLibraryPath}
        setMoorhenDimensions={getMoorhenDimensions}
        disableFileUploads
        viewOnly
        allowScripting={false}
        backupStorageInstance={backupStorageRef.current}
        store={MoorhenReduxStore}
      />
      <MoorhenProofStatus status={status} counts={counts} error={error} />
    </Box>
  );
};

const MoorhenProofRoute = () => {
  const storePreparedRef = useRef(false);

  if (!storePreparedRef.current) {
    resetMoorhenStore(MoorhenReduxStore);
    storePreparedRef.current = true;
  }

  return (
    <Provider store={MoorhenReduxStore}>
      <MoorhenProofViewer />
    </Provider>
  );
};

export default MoorhenProofRoute;
