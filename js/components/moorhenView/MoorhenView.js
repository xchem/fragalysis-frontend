import React, { memo, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Provider, useDispatch, useSelector } from 'react-redux';
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
import { NglContext } from '../nglView/nglProvider';
import MoorhenViewerAdapter from '../../viewer/MoorhenViewerAdapter';
import { moorhenProofConfig } from '../../config/moorhenProof';
import { initializeMoorhenCcp4Module } from '../moorhenProof/moorhenCcp4';
import { handleNglViewPick } from '../nglView/redux/dispatchActions';
import { setOrientationByInteraction } from '../../reducers/ngl/dispatchActions';
import { VIEWER_ENGINE, viewerConfig } from '../../config/viewer';
import { createViewerInitializationTelemetry } from '../../viewer/viewerTelemetry';
import { installMoorhenWorkerBridge } from './moorhenWorkerBridge';
import { useInitialViewerPresentation } from './useInitialViewerPresentation';
import { useMoorhenInteractionPreferences } from './useMoorhenInteractionPreferences';
import { NGL_VIEW_DEFAULT_VALUES } from '../nglView/constants';

const MOORHEN_INITIALIZATION_TIMEOUT_MS = 300000;
let moorhenStorePrepared = false;

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

const resetMoorhenStore = () => {
  [
    emptyMolecules,
    emptyMaps,
    emptyVectors,
    resetGeneralStates,
    resetSceneSettings,
    resetBackupSettings,
    resetHoveringStates,
    resetMapContourSettings
  ].forEach(createAction => MoorhenReduxStore.dispatch(createAction()));
};

const MoorhenMainView = memo(({ div_id, dispatchAppAction, onInitializationFailure, sceneVisible, viewParams }) => {
  const { getViewerAdapter, registerNglView, unregisterNglView } = useContext(NglContext);
  const containerRef = useRef(null);
  const glRef = useRef(null);
  const timeCapsuleRef = useRef(null);
  const commandCentre = useRef(null);
  const moleculesRef = useRef(null);
  const mapsRef = useRef(null);
  const activeMapRef = useRef(null);
  const lastHoveredAtomRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const backupStorageRef = useRef(createMemoryStorage());
  const initializationTimeoutRef = useRef(null);
  const initializationFinishedRef = useRef(false);
  const initializationTelemetryRef = useRef(null);
  const [ccp4ModuleReady, setCcp4ModuleReady] = useState(false);
  const [workerBridgeReady, setWorkerBridgeReady] = useState(false);
  const [status, setStatus] = useState('Starting Moorhen runtimes...');
  const [error, setError] = useState('');
  const viewParamsRef = useRef(viewParams);
  viewParamsRef.current = viewParams;
  const extraNavBarMenus = useMoorhenInteractionPreferences(getViewerAdapter, div_id, status === 'Moorhen ready');
  const isMoorhenInitialized = useSyncExternalStore(
    MoorhenReduxStore.subscribe,
    getMoorhenInitializationState,
    getMoorhenInitializationState
  );
  const monomerLibraryPath = `${moorhenProofConfig.assetUrl}/baby-gru/monomers`;

  if (!initializationTelemetryRef.current) {
    initializationTelemetryRef.current = createViewerInitializationTelemetry({
      engine: VIEWER_ENGINE,
      viewId: div_id,
      role: 'main',
      viewerConfig
    });
  }

  const clearInitializationTimeout = useCallback(() => {
    if (initializationTimeoutRef.current !== null) {
      clearTimeout(initializationTimeoutRef.current);
      initializationTimeoutRef.current = null;
    }
  }, []);

  const reportInitializationFailure = useCallback(
    (initializationError, phase) => {
      if (initializationFinishedRef.current) return;
      initializationFinishedRef.current = true;
      clearInitializationTimeout();
      const normalizedError =
        initializationError instanceof Error ? initializationError : new Error(String(initializationError));
      initializationTelemetryRef.current.failed(normalizedError, { phase });
      setError(normalizedError.message);
      onInitializationFailure?.(normalizedError, phase);
    },
    [clearInitializationTimeout, onInitializationFailure]
  );

  const getMoorhenDimensions = useCallback(() => {
    const element = containerRef.current;
    return [Math.max(element?.clientWidth || 1, 1), Math.max(element?.clientHeight || 1, 1)];
  }, []);

  useEffect(() => {
    let isMounted = true;
    initializationTelemetryRef.current.started();

    if (window.crossOriginIsolated !== true) {
      reportInitializationFailure(
        new Error('Moorhen requires Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy response headers'),
        'cross-origin-isolation'
      );
      return () => {
        isMounted = false;
      };
    }

    initializationTimeoutRef.current = setTimeout(() => {
      reportInitializationFailure(
        new Error(`Moorhen initialization timed out after ${MOORHEN_INITIALIZATION_TIMEOUT_MS} ms`),
        'timeout'
      );
    }, MOORHEN_INITIALIZATION_TIMEOUT_MS);

    initializeMoorhenCcp4Module({ assetUrl: moorhenProofConfig.assetUrl })
      .then(() => {
        if (isMounted && !initializationFinishedRef.current) setCcp4ModuleReady(true);
      })
      .catch(moduleError => {
        if (isMounted) reportInitializationFailure(moduleError, 'ccp4-runtime');
      });

    return () => {
      isMounted = false;
      clearInitializationTimeout();
    };
  }, [clearInitializationTimeout, reportInitializationFailure]);

  useEffect(() => {
    if (window.crossOriginIsolated !== true) return undefined;

    let isMounted = true;
    let removeWorkerBridge = () => {};

    installMoorhenWorkerBridge({ assetUrl: moorhenProofConfig.assetUrl })
      .then(cleanup => {
        if (!isMounted) {
          cleanup();
          return;
        }
        removeWorkerBridge = cleanup;
        setWorkerBridgeReady(true);
      })
      .catch(workerError => {
        if (isMounted) reportInitializationFailure(workerError, 'worker-bridge');
      });

    return () => {
      isMounted = false;
      removeWorkerBridge();
    };
  }, [reportInitializationFailure]);

  useEffect(() => {
    if (!ccp4ModuleReady || !isMoorhenInitialized || error) return undefined;

    let adapter;
    let handlePick;
    let handleOrientationChanged;
    let resizeObserver;
    let resizeFrame = null;
    let observingSize = true;
    const stopObservingSize = () => {
      observingSize = false;
      resizeObserver?.disconnect();
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    };

    try {
      adapter = new MoorhenViewerAdapter({
        commandCentre,
        glRef,
        store: MoorhenReduxStore,
        monomerLibraryPath,
        containerElement: containerRef
      });
      adapter.setParameters({ ...NGL_VIEW_DEFAULT_VALUES, ...viewParamsRef.current });
      registerNglView(div_id, adapter);
      handlePick = (viewerAdapter, pick) => dispatchAppAction(handleNglViewPick(viewerAdapter, pick, getViewerAdapter));
      handleOrientationChanged = () => dispatchAppAction(setOrientationByInteraction(div_id, adapter.getOrientation()));
      adapter.addPickHandler(handlePick);
      adapter.addOrientationChangeHandler(handleOrientationChanged);
      const resize = () => {
        if (!observingSize || resizeFrame !== null) return;
        resizeFrame = requestAnimationFrame(() => {
          resizeFrame = null;
          adapter.resize();
        });
      };
      // Panel toggles, divider drags and portal moves do not resize the window.
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(containerRef.current);
      resize();
      initializationFinishedRef.current = true;
      clearInitializationTimeout();
      initializationTelemetryRef.current.ready({ phase: 'adapter-registration' });
      setStatus('Moorhen ready');
    } catch (initializationError) {
      stopObservingSize();
      if (adapter) {
        if (handlePick) adapter.removePickHandler(handlePick);
        if (handleOrientationChanged) adapter.removeOrientationChangeHandler(handleOrientationChanged);
        unregisterNglView(div_id);
        adapter.destroy().catch(cleanupError => console.error('Unable to clean up Moorhen adapter', cleanupError));
      }
      reportInitializationFailure(initializationError, 'adapter-registration');
      return undefined;
    }

    return () => {
      stopObservingSize();
      adapter.removePickHandler(handlePick);
      adapter.removeOrientationChangeHandler(handleOrientationChanged);
      unregisterNglView(div_id);
      adapter.destroy().catch(cleanupError => console.error('Unable to clean up Moorhen adapter', cleanupError));
    };
  }, [
    ccp4ModuleReady,
    clearInitializationTimeout,
    dispatchAppAction,
    div_id,
    error,
    getViewerAdapter,
    isMoorhenInitialized,
    monomerLibraryPath,
    reportInitializationFailure,
    registerNglView,
    unregisterNglView
  ]);

  useEffect(() => {
    getViewerAdapter(div_id)?.setParameters({ ...NGL_VIEW_DEFAULT_VALUES, ...viewParams });
  }, [div_id, getViewerAdapter, viewParams]);

  return (
    <Provider store={MoorhenReduxStore}>
      <Box
        ref={containerRef}
        id={div_id}
        data-viewer-engine="moorhen"
        data-initial-view-status={sceneVisible ? 'ready' : 'preparing'}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 1,
          overflow: 'hidden',
          bgcolor: '#000',
          '& > .baby-gru': {
            width: '100%',
            maxWidth: 'none',
            margin: 0,
            padding: 0,
            opacity: sceneVisible ? 1 : 0,
            pointerEvents: sceneVisible ? 'auto' : 'none'
          },
          '& .baby-gru > div > .row': { margin: 0 },
          // Moorhen 0.22.7 puts both navigation FABs in this wrapper but positions
          // them independently using page offsets. Lay them out within the panel;
          // reverse wrapping keeps the atom label above the menu on narrow panels.
          '& > div:has(> .MuiFab-root > img[alt="Moorhen"])': {
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            display: 'flex',
            flexWrap: 'wrap-reverse',
            alignItems: 'center',
            gap: 1,
            pointerEvents: 'none',
            '& > *': { pointerEvents: 'auto' },
            '& > .MuiFab-root': {
              position: 'relative',
              top: 'auto',
              left: 'auto',
              right: 'auto',
              flexShrink: 0,
              maxWidth: '100%'
            },
            '& > .MuiFab-root:has(> img[alt="Moorhen"])': { marginRight: 'auto' },
            '& > .MuiFab-root:not(:has(> img[alt="Moorhen"]))': { marginLeft: 'auto' },
            '& .moorhen-hovered-atom-form': {
              minWidth: 0,
              maxWidth: '100%'
            }
          },
          // Moorhen's figure has default margins and a literal trailing ";".
          // Zero text metrics suppress that stray text and the canvas baseline
          // gap, while the native canvas overlays keep their own drawing fonts.
          '& #moorhen-canvas-background > figure': { margin: 0, fontSize: 0, lineHeight: 0 },
          '& #moorhen-canvas-background > figure > canvas': { display: 'block' }
        }}
      >
        {workerBridgeReady && (
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
            viewOnly={false}
            allowScripting={false}
            backupStorageInstance={backupStorageRef.current}
            store={MoorhenReduxStore}
            extraNavBarMenus={extraNavBarMenus}
          />
        )}
        <Box
          role="status"
          data-moorhen-adapter-status={error ? 'error' : status === 'Moorhen ready' ? 'ready' : 'initializing'}
          sx={{
            position: 'absolute',
            left: 8,
            bottom: 8,
            zIndex: theme => theme.zIndex.tooltip,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.5,
            color: '#fff',
            bgcolor: error ? 'rgba(160, 28, 28, 0.92)' : 'rgba(20, 25, 32, 0.88)',
            pointerEvents: 'none'
          }}
        >
          {!error && (status !== 'Moorhen ready' || !sceneVisible) && <CircularProgress size={16} color="inherit" />}
          <Typography variant="caption" sx={{ color: 'inherit' }}>
            {error || (status === 'Moorhen ready' && !sceneVisible ? 'Preparing view...' : status)}
          </Typography>
        </Box>
      </Box>
    </Provider>
  );
});

MoorhenMainView.displayName = 'MoorhenMainView';

const MoorhenView = memo(({ div_id, onInitializationFailure, deferInitialPresentation = false }) => {
  const dispatchAppAction = useDispatch();
  const viewParams = useSelector(state => state.nglReducers.viewParams);
  const sceneVisible = useInitialViewerPresentation(div_id, deferInitialPresentation);

  if (!moorhenStorePrepared) {
    resetMoorhenStore();
    moorhenStorePrepared = true;
  }

  return (
    <MoorhenMainView
      div_id={div_id}
      dispatchAppAction={dispatchAppAction}
      onInitializationFailure={onInitializationFailure}
      sceneVisible={sceneVisible}
      viewParams={viewParams}
    />
  );
});

MoorhenView.displayName = 'MoorhenView';

export default MoorhenView;
