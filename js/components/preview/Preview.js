/**
 * Created by abradley on 14/04/2018.
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core';
import NGLView from '../nglView/nglView';
import HitNavigator from './molecule/hitNavigator';
import TagSelector from './tags/tagSelector';
import TagDetails from './tags/details/tagDetails';
import { withUpdatingTarget } from '../target/withUpdatingTarget';
import { VIEWS } from '../../constants/constants';
import { withLoadingProtein } from './withLoadingProtein';
import { withLoadingJobSpecs } from './withLoadingJobSpecs';
import { withSnapshotManagement } from '../snapshot/withSnapshotManagement';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectHistoryPanel } from './projectHistoryPanel';
import { ProjectDetailDrawer } from '../projects/projectDetailDrawer';
import { NewSnapshotModal } from '../snapshot/modals/newSnapshotModal';
import { SaveSnapshotBeforeExit } from '../snapshot/modals/saveSnapshotBeforeExit';
import { ModalShareSnapshot } from '../snapshot/modals/modalShareSnapshot';
import { DownloadStructureDialog } from '../snapshot/modals/downloadStructuresDialog';
//import HotspotList from '../hotspot/hotspotList';
import { loadDatasetCompoundsWithScores, loadDataSets } from '../datasets/redux/dispatchActions';
import { setMoleculeListIsLoading, setSelectedDatasetIndex, setAllInspirations } from '../datasets/redux/actions';
import { prepareFakeFilterData } from './compounds/redux/dispatchActions';
import { withLoadingMolecules } from './tags/withLoadingMolecules';
import { ViewerControls } from './viewerControls';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidthProvider, Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { setCurrentLayout } from '../../reducers/layout/actions';
import { layoutBreakpoints, layoutItemNames } from '../../reducers/layout/constants';
import { useUpdateGridLayout } from './useUpdateGridLayout';
import { createHtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';
import { RHS } from './rhs';
import { ResizableLayout } from './ResizableLayout';
import { loadMoleculesAndTags } from './tags/redux/dispatchActions';
import { getTagMolecules } from './tags/api/tagsApi';
import { compareTagsAsc } from './tags/utils/tagUtils';
import { setMoleculeTags } from '../../reducers/api/actions';
import { useRouteMatch } from 'react-router-dom';
import { extractProjectFromURLParam } from './utils';
import { PickProjectModal } from './PickProjectModal';
import { setCurrentProject, setOpenPickProjectModal } from '../target/redux/actions';
import { getProjectsForSelectedTarget } from './redux/dispatchActions';
import { withLoadingProjects } from '../target/withLoadingProjects';
import { setProjectModalOpen } from '../projects/redux/actions';
import { setOpenSnapshotSavingDialog } from '../snapshot/redux/actions';
import { setTagEditorOpen, setMoleculeForTagEdit } from '../../reducers/selection/actions';

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
  // let match = useRouteMatch();

  // const currentPorject = useSelector(state => state.targetReducers.currentProject);

  // if (!currentPorject && match && match.params && match.params.length > 0) {
  //   const project = extractProjectFromURLParam(match.params[0]);
  //   if (!project) {
  //     const projectsForSelectedTarget = dispatch(getProjectsForSelectedTarget());
  //     if (projectsForSelectedTarget && projectsForSelectedTarget.length > 0) {
  //       if (projectsForSelectedTarget.length === 1) {
  //         dispatch(setCurrentProject(projectsForSelectedTarget[0]));
  //       } else {
  //         dispatch(setOpenPickProjectModal(true));
  //       }
  //     } else {
  //       //show message that there are no projects for this target
  //     }
  //   } else {
  //     dispatch(setCurrentProject(project));
  //   }
  // }

  dispatch(prepareFakeFilterData());

  const customDatasets = useSelector(state => state.datasetsReducers.datasets);
  const target_on = useSelector(state => state.apiReducers.target_on);
  const isTrackingRestoring = useSelector(state => state.trackingReducers.isTrackingCompoundsRestoring);

  const all_mol_lists = useSelector(state => state.apiReducers.all_mol_lists);
  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists);
  const isLoadingMoleculeList = useSelector(state => state.datasetsReducers.isLoadingMoleculeList);

  const currentLayout = useSelector(state => state.layoutReducers.currentLayout);
  const layoutLocked = useSelector(state => state.layoutReducers.layoutLocked);

  const openNewProjectModal = useSelector(state => state.projectReducers.isProjectModalOpen);
  const openSaveSnapshotModal = useSelector(state => state.snapshotReducers.openSavingDialog);
  const assignTagEditorOpen = useSelector(state => state.selectionReducers.tagEditorOpened);

  const nglPortal = useMemo(() => createHtmlPortalNode({ attributes: { style: 'height: 100%' } }), []);

  useEffect(() => {
    if (target_on && !isSnapshot) {
      dispatch(loadMoleculesAndTags(target_on));
    }
  }, [dispatch, target_on, isSnapshot]);

  useEffect(() => {
    if (target_on) {
      getTagMolecules(target_on).then(data => {
        const sorted = data.results.sort(compareTagsAsc);
        dispatch(setMoleculeTags(sorted));
      });
    }
  }, [dispatch, target_on]);

  /*
     Loading datasets
   */
  useEffect(() => {
    if (customDatasets.length === 0 && isTrackingRestoring === false) {
      dispatch(setMoleculeListIsLoading(true));
      dispatch(loadDataSets(target_on))
        .then(results => {
          if (Array.isArray(results) && results.length > 0) {
            let defaultDataset = results[0]?.unique_name;
            dispatch(setSelectedDatasetIndex(0, 0, defaultDataset, defaultDataset, true));
          }
          return dispatch(loadDatasetCompoundsWithScores());
        })
        .catch(error => {
          throw new Error(error);
        })
        .finally(() => {
          dispatch(setMoleculeListIsLoading(false));
        });
    }
  }, [customDatasets.length, dispatch, target_on, isTrackingRestoring]);

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

  // useEffect(() => {
  //   // Unmount Preview - reset NGL state
  //   return () => {
  //     dispatch(unmountPreviewComponent(nglViewList));
  //   };
  // }, [dispatch, nglViewList]);

  const onLayoutChange = (updatedLayout, layouts) => {
    dispatch(setCurrentLayout(layouts));
  };

  const ref = useUpdateGridLayout(hideProjects);

  const gridRef = useRef();

  const renderItem = id => {
    switch (id) {
      case layoutItemNames.TAG_DETAILS: {
        return (
          <div key="tagDetails">
            <TagDetails />
          </div>
        );
      }
      case layoutItemNames.HIT_LIST_FILTER: {
        return (
          <div key="hitListFilter">
            <TagSelector />
          </div>
        );
      }
      case layoutItemNames.HIT_NAVIGATOR: {
        return (
          <div key="hitNavigator">
            <HitNavigator hideProjects={hideProjects} />
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
        return (
          <div key="RHS">
            <RHS hideProjects={hideProjects} />
          </div>
        );
      }
      case layoutItemNames.VIEWER_CONTROLS: {
        return (
          <div key="viewerControls">
            <ViewerControls />
          </div>
        );
      }
      case layoutItemNames.PROJECT_HISTORY: {
        return (
          <div key="projectHistory">
            <ProjectHistoryPanel showFullHistory={() => setShowHistory(!showHistory)} />
          </div>
        );
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
        onClick={() => (
          openNewProjectModal === true ? dispatch(setProjectModalOpen(false)) : '',
          openSaveSnapshotModal === true ? dispatch(setOpenSnapshotSavingDialog(false)) : ''
        )}
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
      <div
        onClick={() =>
          assignTagEditorOpen === true ? (dispatch(setTagEditorOpen(false)), dispatch(setMoleculeForTagEdit(null))) : ''
        }
      >
        <InPortal node={nglPortal}>
          <NGLView div_id={VIEWS.MAJOR_VIEW} />
        </InPortal>
      </div>
      <NewSnapshotModal />
      <ModalShareSnapshot />
      <SaveSnapshotBeforeExit />
      <DownloadStructureDialog />
      <PickProjectModal />
      {!hideProjects && <ProjectDetailDrawer showHistory={showHistory} setShowHistory={setShowHistory} />}
    </>
  );
});

export default withLoadingJobSpecs(
  withSnapshotManagement(withUpdatingTarget(withLoadingProtein(withLoadingProjects(Preview))))
);
