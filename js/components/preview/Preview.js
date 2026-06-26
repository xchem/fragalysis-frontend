/**
 * Created by abradley on 14/04/2018.
 */

import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core';
import NGLView from '../nglView/nglView';
import HitNavigator from './molecule/hitNavigator';
import { TagDetailsLHS } from './tags/details/tagDetailsLHS';
import { withUpdatingTarget } from '../target/withUpdatingTarget';
import { VIEWS } from '../../constants/constants';
import { withLoadingProtein } from './withLoadingProtein';
import { withLoadingJobSpecs } from './withLoadingJobSpecs';
import { withSnapshotManagement } from '../snapshot/withSnapshotManagement';
import { useDispatch, useSelector } from 'react-redux';
import { NewSnapshotModal } from '../snapshot/modals/newSnapshotModal';
import { SaveSnapshotBeforeExit } from '../snapshot/modals/saveSnapshotBeforeExit';
import { ModalShareSnapshot } from '../snapshot/modals/modalShareSnapshot';
import { DownloadStructureDialog } from '../snapshot/modals/downloadStructuresDialog';
//import HotspotList from '../hotspot/hotspotList';
import { loadDatasetCompoundsWithScores, loadDataSets } from '../datasets/redux/dispatchActions';
import {
  resetDatasetsState,
  setMoleculeListIsLoading,
  setSelectedDatasetIndex,
  setAllInspirations
} from '../datasets/redux/actions';
import { prepareFakeFilterData } from './compounds/redux/dispatchActions';
import { ViewerControls } from './viewerControls';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidthProvider, Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { setCurrentLayout } from '../../reducers/layout/actions';
import { layoutBreakpoints, layoutItemNames } from '../../reducers/layout/constants';
import { useUpdateGridLayout } from './useUpdateGridLayout';
import { createHtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';
import { ResizableLayout } from './ResizableLayout';
import { loadMoleculesAndTagsNew } from './tags/redux/dispatchActions';
import { getTagMolecules, getTags } from './tags/api/tagsApi';
import { compareTagsAsc } from './tags/utils/tagUtils';
import {
  setLHSDataIsLoaded,
  setLHSDataIsLoading,
  setAllMolLists,
  setCategoryList,
  setLHSCompoundsList,
  setMoleculeTags,
  setRHSCompoundsList,
  setRHSDataIsLoaded,
  setRHSDataIsLoading
} from '../../reducers/api/actions';
import { PickProjectModal } from './PickProjectModal';
import { withLoadingProjects } from '../target/withLoadingProjects';
import { setOpenSnapshotSavingDialog } from '../snapshot/redux/actions';
import {
  setTagEditorOpen,
  setMoleculeForTagEdit,
  setToastMessages,
  setLHSIsFullyRendered
} from '../../reducers/selection/actions';
import { LoadingContext } from '../loading';
import { ToastContext } from '../toast';
import { TOAST_LEVELS } from '../toast/constants';
import { useDisplayLigandLHS } from '../../reducers/ngl/useDisplayLigandLHS';
import { useDisplayProteinLHS } from '../../reducers/ngl/useDisplayProteinLHS';
import { useDisplayComplexLHS } from '../../reducers/ngl/useDisplayComplexLHS';
import { useDisplaySurfaceLHS } from '../../reducers/ngl/useDisplaySurfacesLHS';
import { useDisplayVectorLHS } from '../../reducers/ngl/useDisplayVectorLHS';
import { useDisplayDensityLHS } from '../../reducers/ngl/useDisplayDensityLHS';
import { useDisplayArtefactChainsLHS } from '../../reducers/ngl/useDisplayArtefactChainsLHS';
import { useDisplayLigandRHS } from '../../reducers/ngl/useDisplayLigandRHS';
import { useDisplayProteinRHS } from '../../reducers/ngl/useDisplayProteinRHS';
import { useDisplayComplexRHS } from '../../reducers/ngl/useDisplayComplexRHS';
import { useDisplaySurfaceRHS } from '../../reducers/ngl/useDisplaySurfaceRHS';
import { loadTargetList } from '../target/redux/dispatchActions';
import { EditSnapshotDialog } from './projectHistoryPanel/editSnapshotDialog';
import { RenderingProgressDialog } from '../loading/RenderingProgressDialog';
import { DataDownloadProgressDialog } from '../loading/DataDownloadProgressDialog';
import layout from '../../reducers/layout/layouts/draggable';
import SnapshotList from '../snapshot/snapshotList';
import SnapshotSavingProgressDialog from '../snapshot/modals/snapshotSavingProgressDialog';
import { TooltipPathProvider } from '../tooltip/TooltipPathContext';

const ReactGridLayout = WidthProvider(ResponsiveGridLayout);

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    gap: theme.spacing(),
    flexWrap: 'wrap',
    height: '100%',
    overflow: 'hidden'
  },
  controls: {
    width: '100%'
  },
  rgl: {
    minWidth: '100%',
    '& .react-resizable-handle': {
      zIndex: 2000
    }
  },
  disableNgl: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1000
  }
}));

const Preview = memo(({ isStateLoaded, hideProjects, isSnapshot = false }) => {
  const classes = useStyles();
  const theme = useTheme();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(prepareFakeFilterData());
  }, [dispatch]);

  const customDatasets = useSelector(state => state.datasetsReducers.datasets);
  const target_on = useSelector(state => state.apiReducers.target_on);
  const sessionProjectId = useSelector(state => state.projectReducers.currentProject.projectID);
  const isTrackingRestoring = false; //useSelector(state => state.trackingReducers.isTrackingCompoundsRestoring);

  const all_mol_lists = useSelector(state => state.apiReducers.all_mol_lists);
  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists);
  const isLoadingMoleculeList = useSelector(state => state.datasetsReducers.isLoadingMoleculeList);

  const currentLayout = useSelector(state => state.layoutReducers.currentLayout);
  const layoutLocked = useSelector(state => state.layoutReducers.layoutLocked);

  const openSaveSnapshotModal = useSelector(state => state.snapshotReducers.openSavingDialog);

  const target_id_list = useSelector(state => state.apiReducers.target_id_list);

  const nglPortal = useMemo(() => createHtmlPortalNode({ attributes: { style: 'height: 100%' } }), []);

  const { toastSuccess, toastError, toastInfo, toastWarning } = useContext(ToastContext);

  const toastMessages = useSelector(state => state.selectionReducers.toastMessages);

  const lhsDataIsLoaded = useSelector(state => state.apiReducers.lhsDataIsLoaded);
  const rhsDataIsLoaded = useSelector(state => state.apiReducers.rhsDataIsLoaded);

  const { setMoleculesAndTagsAreLoading } = useContext(LoadingContext);
  const loadedTargetRef = useRef(null);
  const loadedProjectRef = useRef(null);

  useDisplayLigandLHS();
  useDisplayProteinLHS();
  useDisplayComplexLHS();
  useDisplaySurfaceLHS();
  useDisplayVectorLHS();
  useDisplayDensityLHS();
  useDisplayArtefactChainsLHS();

  useDisplayLigandRHS();
  useDisplayProteinRHS();
  useDisplayComplexRHS();
  useDisplaySurfaceRHS();

  useEffect(() => {
    const shouldLoadTarget =
      target_on &&
      (!lhsDataIsLoaded || loadedTargetRef.current !== target_on || loadedProjectRef.current !== sessionProjectId);

    if (shouldLoadTarget) {
      loadedTargetRef.current = target_on;
      loadedProjectRef.current = sessionProjectId;
      dispatch(setLHSIsFullyRendered(false));
      dispatch(setLHSDataIsLoading(true));
      dispatch(setLHSDataIsLoaded(false));
      dispatch(setRHSDataIsLoaded(false));
      dispatch(setAllMolLists([]));
      dispatch(setLHSCompoundsList([]));
      dispatch(setRHSCompoundsList([]));
      dispatch(setMoleculeTags([]));
      dispatch(setCategoryList([]));
      dispatch(resetDatasetsState());
      dispatch(loadMoleculesAndTagsNew(target_on)).then(() => {
        dispatch(setLHSDataIsLoading(false));
        dispatch(setLHSDataIsLoaded(true));
      });
    }
  }, [dispatch, target_on, sessionProjectId, isSnapshot, setMoleculesAndTagsAreLoading, lhsDataIsLoaded]);

  /*
     Loading datasets
   */
  useEffect(() => {
    if (
      customDatasets.length === 0 &&
      isTrackingRestoring === false &&
      !rhsDataIsLoaded &&
      target_on &&
      lhsDataIsLoaded
    ) {
      dispatch(setMoleculeListIsLoading(true));
      dispatch(loadDataSets(target_on))
        .then(results => {
          if (Array.isArray(results) && results.length > 0) {
            let defaultDataset = results[0]?.name;
            dispatch(setSelectedDatasetIndex(0, 0, defaultDataset, defaultDataset, true));
          }
          return dispatch(loadDatasetCompoundsWithScores(results));
        })
        .catch(error => {
          throw new Error(error);
        })
        .finally(() => {
          dispatch(setMoleculeListIsLoading(false));
          dispatch(setRHSDataIsLoading(false));
          dispatch(setRHSDataIsLoaded(true));
        });
    }
  }, [customDatasets.length, dispatch, target_on, isTrackingRestoring, rhsDataIsLoaded, lhsDataIsLoaded]);

  useEffect(() => {
    if (toastMessages?.length > 0) {
      toastMessages.forEach(message => {
        switch (message.level) {
          case TOAST_LEVELS.SUCCESS:
            toastSuccess(message.text, { autoHideDuration: 3000 });
            break;
          case TOAST_LEVELS.ERROR:
            toastError(message.text);
            break;
          case TOAST_LEVELS.INFO:
            toastInfo(message.text);
            break;
          case TOAST_LEVELS.WARNING:
            toastWarning(message.text);
            break;
          default:
            break;
        }
      });
      dispatch(setToastMessages([]));
    }
  }, [dispatch, toastError, toastInfo, toastMessages, toastSuccess, toastWarning]);

  useEffect(() => {
    const moleculeListsCount = Object.keys(moleculeLists || {}).length;
    if (moleculeListsCount > 0 && !isLoadingMoleculeList) {
      const allDatasets = {};
      const allMolsMap = linearizeMoleculesLists();
      const keys = Object.keys(moleculeLists);
      keys.forEach(key => {
        let dataset = moleculeLists[key];
        let mols = {};
        dataset.forEach(dsMol => {
          let inspirations = [];
          dsMol.computed_inspirations.forEach(id => {
            let lhsMol = allMolsMap[id];
            inspirations.push(lhsMol);
          });
          mols[dsMol.id] = inspirations;
        });
        allDatasets[key] = mols;
      });
      dispatch(setAllInspirations(allDatasets));
    }
  }, [all_mol_lists, moleculeLists, isLoadingMoleculeList, linearizeMoleculesLists, dispatch]);

  const linearizeMoleculesLists = useCallback(() => {
    const allMolsMap = {};

    if (all_mol_lists && all_mol_lists.length > 0) {
      all_mol_lists.forEach(mol => {
        allMolsMap[mol.id] = mol;
      });
    }

    return allMolsMap;
  }, [all_mol_lists]);

  const [showHistory, setShowHistory] = useState(false);

  const onLayoutChange = (updatedLayout, layouts) => {
    dispatch(setCurrentLayout(layouts));
  };

  const ref = useUpdateGridLayout(hideProjects);

  const gridRef = useRef();

  const renderItem = id => {
    switch (id) {
      case layoutItemNames.SNAPSHOT_LIST: {
        return (
          <div key="snapshotList">
            <SnapshotList />
          </div>
        );
      }
      case layoutItemNames.TAG_DETAILS: {
        return (
          <div key="tagDetails">
            <TooltipPathProvider path="tagDetails">
              <TagDetailsLHS />
            </TooltipPathProvider>
          </div>
        );
      }
      case layoutItemNames.HIT_LIST_FILTER: {
        return <div key="hitListFilter"></div>;
      }
      case layoutItemNames.HIT_NAVIGATOR: {
        return (
          <div key="hitNavigator">
            <HitNavigator />
          </div>
        );
      }
      case layoutItemNames.NGL: {
        return (
          <div key="NGL">
            {!layoutLocked && <div className={classes.disableNgl} />}
            <OutPortal node={nglPortal} />
          </div>
        );
      }
      case layoutItemNames.RHS: {
        return <div key="RHS">{/* <RHS /> */}</div>;
      }
      case layoutItemNames.VIEWER_CONTROLS: {
        return (
          <div key="viewerControls">
            <ViewerControls />
          </div>
        );
      }
      case layoutItemNames.PROJECT_HISTORY: {
        return <div key="projectHistory"></div>;
      }
      case layoutItemNames.RESIZABLE: {
        return (
          <div key="resizable">
            <ResizableLayout
              gridRef={gridRef}
              hideProjects={hideProjects}
              showHistory={showHistory}
              onShowHistoryChange={() => setShowHistory(prevValue => !prevValue)}
              nglPortal={nglPortal}
            />
          </div>
        );
      }
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={classes.root}
        onClick={() => {
          openSaveSnapshotModal && dispatch(setOpenSnapshotSavingDialog(false));
        }}
      >
        <ReactGridLayout
          // cols={4}
          ref={gridRef}
          autoSize
          breakpoints={layoutBreakpoints}
          cols={{ lg: 256, md: 192 }}
          layouts={currentLayout}
          rowHeight={1}
          onLayoutChange={onLayoutChange}
          useCSSTransforms={false}
          className={classes.rgl}
          margin={[theme.spacing(), theme.spacing()]}
        >
          {currentLayout?.lg?.map(item => renderItem(item.i))}
        </ReactGridLayout>
      </div>
      <InPortal node={nglPortal}>
        <NGLView div_id={VIEWS.MAJOR_VIEW} />
      </InPortal>
      <NewSnapshotModal />
      <ModalShareSnapshot />
      <SaveSnapshotBeforeExit />
      <TooltipPathProvider path="downloadStructures">
        <DownloadStructureDialog />
      </TooltipPathProvider>
      <PickProjectModal />
      <EditSnapshotDialog />
      <RenderingProgressDialog />
      <DataDownloadProgressDialog />
      <SnapshotSavingProgressDialog />
    </>
  );
});

export default withLoadingJobSpecs(
  withLoadingProjects(withSnapshotManagement(withUpdatingTarget(withLoadingProtein(Preview))))
);
