/**
 * Row in Hit navigator
 */
import React, { memo, useEffect, useState, useRef, useContext, useCallback, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableRow, TableCell } from '@mui/material';
import { makeStyles } from '../../../../ui/styles';
import classNames from 'classnames';
import { VIEWS } from '../../../../constants/constants';
import { COMMON_PARAMS } from '../../../nglView/constants';
import { NglContext } from '../../../nglView/nglProvider';
import {
  removeQuality,
  addQuality,
  getQualityInformation,
  withDisabledMoleculeNglControlButton,
  getCategoryById,
  generateAndStoreMolImage
} from '../redux/dispatchActions';
import { setObservationsForLHSCmp } from '../../../../reducers/selection/actions';
import { MOL_TYPE } from '../redux/constants';
import { getRandomColor } from '../utils/color';
import { DEFAULT_TAG_COLOR, getAllTagsForLHSCmp } from '../../tags/utils/tagUtils';
import { getFontColorByBackgroundColor } from '../../../../utils/colors';
import { getFilterSmileQuery } from '../../../../reducers/selection/selectors';
import { useRDKit } from '../../../rdkit/RDKitContext';
import { DetailView } from './table/views/detailView';
import { ObservationsView } from './table/views/observationsView';
import { ConformerSiteView } from './table/views/conformerSiteView';
import { CanonSiteView } from './table/views/canonSiteView';
import { ImageView } from './table/views/imageView';
import { PeerReviewView } from './table/views/peerReviewView';
import { TextView } from './table/views/textView';
import { COLUMN_TYPES } from './table';
import { NumericView } from './table/views';
import { TooltipPathProvider } from '../../../tooltip/TooltipPathContext';
import { LHS_OBSERVATION_VIEW_CONFIG } from './viewConfigs';
import { usePoseRowSelection } from './hooks/usePoseRowSelection';
import { useRegisteredNodeRef } from '../../../../hooks/useRegisteredNodeRef';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(0.25),
    color: 'black',
    minHeight: BASE_ROW_HEIGHT,
    '& > td': {
      padding: 0,
      height: 'auto'
    },
    '& > td > div': {
      minHeight: BASE_ROW_HEIGHT
    }
  },
  cell: {
    overflow: 'hidden',
    verticalAlign: 'top'
  },
  siteOpenObservations: {
    // instead of coloring every specific part of border, just use inner shadow to fake it
    boxShadow: 'inset 0 0 0 2px ' + theme.palette.primary.main
  }
}));

const BASE_ROW_HEIGHT = 54;

export const img_data_init = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25px" height="25px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

const ObservationUnifiedView = memo(
  forwardRef(
    (
      {
        imageHeight,
        imageWidth,
        data,
        index,
        setRef,
        L,
        P,
        C,
        S,
        D,
        Q,
        V,
        I,
        selected,
        disableL,
        disableP,
        disableC,
        observations,
        ligandRepresentations = undefined,
        onVisualReady = undefined,
        waitForVisualCompletion = false,
        columns,
        getColumnWidth,
        displayImageHeight = imageHeight,
        displayImageWidth = imageWidth,
        onDetailHeightChange = undefined,
        viewConfig = LHS_OBSERVATION_VIEW_CONFIG,
        getComputedInspirations = undefined,
        previousPose = null,
        nextPose = null,
        poseTransferConfig,
        poseTransferInProgress = false,
        poseTransferResetKey = 0,
        onPoseTransfer
      },
      outsideRef
    ) => {
      // const [countOfVectors, setCountOfVectors] = useState('-');
      // const [cmpds, setCmpds] = useState('-');
      const currentID = (data && data.id) || undefined;
      const { nodeRef: ref, setNodeRef: handleRowRef } = useRegisteredNodeRef(currentID, outsideRef);
      const classes = useStyles();

      const dispatch = useDispatch();

      const { RDKitModule } = useRDKit();
      const hasReportedVisualReadyRef = useRef(false);

      const [img_data, setImg_data] = useState(img_data_init);

      const viewParams = useSelector(state => state.nglReducers.viewParams);
      const tagList = useSelector(state => state.apiReducers.tagList);
      const tagCategories = useSelector(state => state.apiReducers.categoryList);
      const filteredSmilesQuery = useSelector(state => getFilterSmileQuery(state));

      const isObservationDialogOpen = useSelector(state => state.selectionReducers.isObservationDialogOpen);

      const { getNglView } = useContext(NglContext);
      const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

      const poseIdForObservationsDialog = useSelector(state => state.selectionReducers.poseIdForObservationsDialog);

      useEffect(() => {
        hasReportedVisualReadyRef.current = false;
      }, [currentID]);

      const reportVisualReady = useCallback(() => {
        if (hasReportedVisualReadyRef.current || !onVisualReady || currentID === undefined) {
          return;
        }

        hasReportedVisualReadyRef.current = true;
        onVisualReady(currentID);
      }, [currentID, onVisualReady]);

      useEffect(() => {
        if (isObservationDialogOpen && poseIdForObservationsDialog === currentID) {
          dispatch(setObservationsForLHSCmp(observations));
          if (setRef) {
            setRef(ref.current);
          }
        }
      }, [observations, isObservationDialogOpen, dispatch, poseIdForObservationsDialog, currentID, setRef]);

      const getMainObservation = useCallback(() => {
        let result = null;

        if (observations && observations.length > 0 && data.main_site_observation) {
          result = observations.find(o => o.id === data.main_site_observation);
        }

        return result;
      }, [data, observations]);

      const rowSelection = usePoseRowSelection(observations);
      const isLigandOn = rowSelection.ligands.length > 0;
      const isProteinOn = rowSelection.proteins.length > 0;
      const isArtefactChainOn = rowSelection.artefacts.length > 0;
      const isComplexOn = rowSelection.complexes.length > 0;
      const isSurfaceOn = rowSelection.surfaces.length > 0;
      const isDensityOn = rowSelection.densities.length > 0;
      const isQualityOn = rowSelection.quality.length > 0;
      const isVectorOn = rowSelection.vectors.length > 0;
      const hasAdditionalInformation = I;
      let warningIconVisible = viewParams[COMMON_PARAMS.warningIcon] === true && hasAdditionalInformation === true;
      const colourToggle = getRandomColor(getMainObservation());
      const isAnyObservationOn = isLigandOn || isProteinOn || isComplexOn || isSurfaceOn || isDensityOn || isVectorOn;

      const moleculeImgRef = useRef(null);
      const detailContentRef = useRef(null);

      useEffect(() => {
        const detailContent = detailContentRef.current;

        if (!detailContent || !onDetailHeightChange) {
          return undefined;
        }

        const reportDetailHeight = () => {
          onDetailHeightChange(currentID, detailContent.getBoundingClientRect().height);
        };

        reportDetailHeight();

        const resizeObserver = new ResizeObserver(() => {
          reportDetailHeight();
        });

        resizeObserver.observe(detailContent);

        return () => {
          resizeObserver.disconnect();
          onDetailHeightChange(currentID, null);
        };
      }, [currentID, onDetailHeightChange]);

      const resolveTagBackgroundColor = useCallback(
        tag => {
          let color = DEFAULT_TAG_COLOR;

          if (tag.colour && tag.colour !== '') {
            color = tag.colour;
          } else {
            const category = dispatch(getCategoryById(tag.category));
            if (category) {
              color = `#${category.colour}`;
            }
          }

          return color;
        },
        [dispatch]
      );

      const resolveTagForegroundColor = useCallback(
        tag => {
          const bgColor = resolveTagBackgroundColor(tag);
          return getFontColorByBackgroundColor(bgColor);
        },
        [resolveTagBackgroundColor]
      );

      const getConformerSitesTagCategory = useCallback(() => {
        const conformerSitesTag = tagCategories.find(tag => tag.category === 'ConformerSites');
        return conformerSitesTag ? conformerSitesTag : null;
      }, [tagCategories]);

      const getCanonSitesTagCategory = useCallback(() => {
        const canonSitesTag = tagCategories.find(tag => tag.category === 'CanonSites');
        return canonSitesTag ? canonSitesTag : null;
      }, [tagCategories]);

      /**
       * Get CanonSites tag for render
       */
      const getCanonSitesTag = useCallback(() => {
        const canonSitesCategory = getCanonSitesTagCategory();
        const canonSites = canonSitesCategory
          ? getAllTagsForLHSCmp(observations, tagList, []).filter(tag => tag.category === canonSitesCategory.id)
          : [];
        return canonSites.length > 0 ? canonSites[0] : {};
      }, [getCanonSitesTagCategory, observations, tagList]);

      // componentDidMount
      useEffect(() => {
        const obs = getMainObservation();
        let isEffectActive = true;
        let fallbackTimeoutId = null;

        if (!waitForVisualCompletion || !obs) {
          reportVisualReady();
          return undefined;
        }

        fallbackTimeoutId = window.setTimeout(() => {
          if (isEffectActive) {
            reportVisualReady();
          }
        }, 2000);

        if (RDKitModule) {
          // dispatch(getMolImage(obs.id, MOL_TYPE.HIT, imageWidth, imageHeight)).then(i => {
          //   setImg_data(i);
          // });
          dispatch(
            generateAndStoreMolImage(obs, MOL_TYPE.HIT, imageWidth, imageHeight, RDKitModule, filteredSmilesQuery)
          )
            .then(i => {
              if (!isEffectActive) {
                return;
              }

              if (i) {
                setImg_data(i.toString());
              }
            })
            .finally(() => {
              if (isEffectActive) {
                reportVisualReady();
              }
            });
        }

        return () => {
          isEffectActive = false;
          if (fallbackTimeoutId !== null) {
            window.clearTimeout(fallbackTimeoutId);
          }
        };
      }, [
        data.id,
        data.smiles,
        imageHeight,
        imageWidth,
        dispatch,
        getMainObservation,
        RDKitModule,
        filteredSmilesQuery,
        reportVisualReady,
        waitForVisualCompletion
      ]);

      useEffect(() => {
        dispatch(getQualityInformation(data));
      }, [data, dispatch]);

      // Here add the logic that updates this based on the information
      // const refinement = <Label bsStyle="success">{"Refined"}</Label>;
      const selected_style = {
        backgroundColor: colourToggle
      };
      const not_selected_style = {};
      const current_style =
        isLigandOn || isProteinOn || isArtefactChainOn || isComplexOn || isSurfaceOn || isDensityOn || isVectorOn
          ? selected_style
          : not_selected_style;

      const removeSelectedQuality = () => {
        const selectedObs = rowSelection.quality;
        for (const obs of selectedObs) {
          dispatch(removeQuality(stage, obs, colourToggle, false, ligandRepresentations));
        }
      };

      const addNewQuality = () => {
        dispatch(
          withDisabledMoleculeNglControlButton(currentID, 'ligand', async () => {
            const firstObs = getMainObservation();
            if (firstObs) {
              const color = getRandomColor(firstObs);
              await dispatch(addQuality(stage, firstObs, color, false, ligandRepresentations));
            }
          })
        );
      };

      const onQuality = () => {
        if (isQualityOn === false) {
          addNewQuality();
        } else {
          removeSelectedQuality();
        }
      };

      const handleRef = useCallback(() => {
        if (setRef) {
          setRef(ref.current);
        }
      }, [ref, setRef]);

      const getProperView = column => {
        switch (column.type) {
          case COLUMN_TYPES.PEER_REVIEW:
            return (
              <TooltipPathProvider path="peerReview">
                <PeerReviewView
                  data={data}
                  index={index}
                  selected={selected}
                  observations={observations}
                  mainObservation={getMainObservation()}
                />
              </TooltipPathProvider>
            );
          case COLUMN_TYPES.OBSERVATION:
            return (
              <TooltipPathProvider path="pose">
                <DetailView
                  data={data}
                  index={index}
                  detailWidth={getColumnWidth(column.name)}
                  detailContentRef={detailContentRef}
                  handleRef={handleRef}
                  disableL={disableL}
                  disableP={disableP}
                  disableC={disableC}
                  observations={observations}
                  ligandRepresentations={ligandRepresentations}
                  viewConfig={viewConfig}
                  getComputedInspirations={getComputedInspirations}
                  previousPose={previousPose}
                  nextPose={nextPose}
                  poseTransferConfig={poseTransferConfig}
                  poseTransferInProgress={poseTransferInProgress}
                  poseTransferResetKey={poseTransferResetKey}
                  onPoseTransfer={onPoseTransfer}
                />
              </TooltipPathProvider>
            );
          case COLUMN_TYPES.MOLECULE:
            return (
              <TooltipPathProvider path="image">
                <ImageView
                  moleculeImgRef={moleculeImgRef}
                  img_data={img_data}
                  warningIconVisible={warningIconVisible}
                  current_style={current_style}
                  imageHeight={imageHeight}
                  imageWidth={imageWidth}
                  displayImageHeight={displayImageHeight}
                  displayImageWidth={displayImageWidth}
                  onQuality={onQuality}
                />
              </TooltipPathProvider>
            );
          case COLUMN_TYPES.CANON_SITE:
            return (
              <TooltipPathProvider path="canonSite">
                <CanonSiteView
                  resolveTagBackgroundColor={resolveTagBackgroundColor}
                  resolveTagForegroundColor={resolveTagForegroundColor}
                  canonSitesTag={getCanonSitesTag()}
                />
              </TooltipPathProvider>
            );
          case COLUMN_TYPES.CONFORMER_SITE:
            return (
              <TooltipPathProvider path="conformerSite">
                <ConformerSiteView
                  tagList={tagList}
                  observations={observations}
                  conformerSitesCategory={getConformerSitesTagCategory()}
                  canonSitesTag={getCanonSitesTag()}
                  resolveTagBackgroundColor={resolveTagBackgroundColor}
                  resolveTagForegroundColor={resolveTagForegroundColor}
                />
              </TooltipPathProvider>
            );
          case COLUMN_TYPES.OBSERVATIONS:
            return (
              <TooltipPathProvider path="observationsView">
                <ObservationsView
                  data={data}
                  observations={observations}
                  isAnyObservationOn={isAnyObservationOn}
                  handleRef={handleRef}
                  dialogSide={viewConfig.kind}
                />
              </TooltipPathProvider>
            );
          case COLUMN_TYPES.NUMBER:
            return (
              <TooltipPathProvider path="numericView">
                <NumericView data={data} column={column} />
              </TooltipPathProvider>
            );
          default:
            return (
              <TooltipPathProvider path="textView">
                <TextView data={data} column={column} />
              </TooltipPathProvider>
            );
        }
      };

      return (
        <TableRow
          key={data.id}
          ref={handleRowRef}
          className={classNames(classes.container, {
            [classes.siteOpenObservations]: poseIdForObservationsDialog === data.id && isObservationDialogOpen
          })}
          wrap="nowrap"
        >
          {columns?.map(
            column =>
              column.visible && (
                <TableCell
                  key={column.name}
                  className={classes.cell}
                  style={{ width: getColumnWidth(column.name), maxWidth: getColumnWidth(column.name) }}
                >
                  {getProperView(column)}
                </TableCell>
              )
          )}
        </TableRow>

        // </Grid>
      );
    }
  )
);

ObservationUnifiedView.displayName = 'ObservationUnifiedView';
export default ObservationUnifiedView;
