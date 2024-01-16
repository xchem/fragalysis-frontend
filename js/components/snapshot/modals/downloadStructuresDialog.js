import React, { memo, useState, useContext, useEffect, useCallback } from 'react';
import Modal from '../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  makeStyles,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  Tooltip,
  Paper
} from '@material-ui/core';
import { selectJoinedMoleculeList } from '../../preview/molecule/redux/selectors';
import { getDownloadStructuresUrl, downloadStructuresZip, getDownloadFileSize } from '../api/api';
import { setDownloadStructuresDialogOpen, setDontShowShareSnapshot, setSharedSnapshot } from '../redux/actions';
import { saveAndShareSnapshot } from '../redux/dispatchActions';
import { getFileSizeString } from '../../../utils/api';
import { v4 as uuidv4 } from 'uuid';
import { createMoleculeTagObject, DEFAULT_TAG_COLOR } from '../../preview/tags/utils/tagUtils';
import { CATEGORY_TYPE, CATEGORY_ID } from '../../../constants/constants';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { createNewDownloadTag } from '../../preview/tags/api/tagsApi';
import { base_url } from '../../routes/constants';
import { updateClipboard } from '../helpers';
import { NglContext } from '../../nglView/nglProvider';
import { initSharedSnapshot } from '../redux/reducer';
import moment from 'moment-timezone';
import { appendToDownloadTags } from '../../../reducers/api/actions';
import { getTagByName } from '../../preview/tags/api/tagsApi';
import { withStyles } from '@material-ui/core/styles';
import { ToastContext } from '../../toast';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 4, 3),
    minWidth: '60vw',
    overflowY: 'auto', // In case of narrow screen
    maxHeight: '100vh'
  },
  select: {
    color: 'inherit',
    fill: 'inherit',
    '&:hover:not(.Mui-disabled):before': {
      borderColor: 'inherit'
    },
    '&:before': {
      borderColor: 'inherit'
    },
    '&:not(.Mui-disabled)': {
      fill: theme.palette.white
    }
  },
  grid: {
    marginTop: theme.spacing(4),
    display: 'grid',
    gridTemplateColumns: 'repeat(3, auto)',
    gap: `0 ${theme.spacing()}px`,
    '& > h6': {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing()
    },
    '& > div': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(),
      marginLeft: theme.spacing(2)
    }
  },
  permalinkSection: {
    gridColumn: '1 / 3'
  },
  button: {
    textTransform: 'none'
  },
  buttonRow: {
    justifyContent: 'flex-start'
  },
  closeButton: {
    color: theme.palette.error.main
  }
}));

const SUBSET_SELECTION = [
  { flag: 'allStructures', text: 'All structures', defaultValue: true },
  { flag: 'displayedStructures', text: 'Structures displayed in the 3D display', defaultValue: false },
  { flag: 'selectedStructures', text: 'Structures selected in the Hit Navigator', defaultValue: false },
  { flag: 'tagged', text: 'Structures associated with the active tags', defaultValue: false }
];

const MAP_FILES = [
  { flag: 'event_file', text: 'PanDDA Event maps - primary evidence', defaultValue: false },
  { flag: 'sigmaa_file', text: 'Conventional inspection maps ("2FoFc")', defaultValue: false },
  { flag: 'diff_file', text: 'Conventional residual maps ("FoFc")', defaultValue: false },
  { flag: 'trans_matrix_info', text: 'Transformations applied for alignments', defaultValue: false }
];

const CRYSTALLOGRAPHIC_FILES = [
  { flag: 'NAN', text: 'Coordinate files (not re-aligned) (.pdb)', defaultValue: false },
  { flag: 'mtz_info', text: 'Reflections and map coefficients (.mtz)', defaultValue: false },
  { flag: 'cif_info', text: 'Ligand definitions and geometry restrains (.cif)', defaultValue: false },
  { flag: 'NAN2', text: 'Coordinate files (not re-aligned) (.pdb)', defaultValue: false },
  { flag: 'map_info', text: 'Real-space map files (VERY BIG!!) (.map)', defaultValue: false }
];

const PERMALINK_OPTIONS = [
  { flag: 'incremental', text: 'Incremental - always up-to-date with latest structures', defaultValue: true },
  { flag: 'static', text: 'Preserved - snapshot of current status, never changes', defaultValue: false }
];

const OTHERS = [
  { flag: 'single_sdf_file', text: 'Single SDF of all ligands', defaultValue: true },
  { flag: 'sdf_info', text: 'Separate SDFs in subdirectory', defaultValue: false }
];

// Creates an object with flag as keys with boolean values
const createFlagObjectFromFlagList = flagList => {
  return Object.fromEntries(
    flagList.map(item => {
      return [item.flag, item.defaultValue];
    })
  );
};

export const DownloadStructureDialog = memo(({}) => {
  const newDownload = '--- NEW DOWNLOAD ---';
  const dispatch = useDispatch();
  const classes = useStyles();
  const { nglViewList } = useContext(NglContext);

  const isOpen = useSelector(state => state.snapshotReducers.downloadStructuresDialogOpen);
  const targetId = useSelector(state => state.apiReducers.target_on);
  const targetName = useSelector(state => state.apiReducers.target_on_name);
  const allMolecules = useSelector(state => state.apiReducers.all_mol_lists);
  const ligandsTurnedOnIds = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const selectedMoleculesIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  const taggedMolecules = useSelector(state => selectJoinedMoleculeList(state));
  const downloadTags = useSelector(state => state.apiReducers.downloadTags);
  const currentSnapshot = useSelector(state => state.projectReducers.currentSnapshot);

  const [structuresSelection, setStructuresSelection] = useState('allStructures');

  const [mapFiles, setMapFiles] = useState(() => createFlagObjectFromFlagList(MAP_FILES));
  const [crystallographicFiles, setCrystallographicFiles] = useState(() =>
    createFlagObjectFromFlagList(CRYSTALLOGRAPHIC_FILES)
  );
  const [other, setOthers] = useState(() => createFlagObjectFromFlagList(OTHERS));

  const [linkType, setLinkType] = useState('incremental');

  // Default flags not visible in UI
  const [bound, setBound] = useState(true);
  const [metadata, setMetadata] = useState(true);
  const [smiles, setSmiles] = useState(true);
  const [pdb, setPdb] = useState(false);

  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [zipPreparing, setZipPreparing] = useState(false);
  const [downloadTagUrl, setDownloadTagUrl] = useState(null);
  const [selectedDownload, setSelectedDownload] = useState(newDownload);
  const [error, setError] = useState(false);
  const [alreadyInProgress, setAlreadyInProgress] = useState(false);

  const { toastSuccess, toastError, toastInfo } = useContext(ToastContext);

  useEffect(() => {
    if (currentSnapshot && currentSnapshot.data && currentSnapshot.data !== '[]') {
      const dataObj = JSON.parse(currentSnapshot.data);
      if (dataObj.downloadTag && downloadTags) {
        const associatedDownloadTag = downloadTags.find(dt => dt.tag === dataObj.downloadTag);
        if (associatedDownloadTag) {
          updateExistingDownload(associatedDownloadTag.additional_info.downloadName);
        } else {
          //download may just not be shown in the dropdown for variety reasons (e.g
          // I'm not the author of the download or it's anonymous download older than 5 days)
          getTagByName(dataObj.downloadTag).then(tag => {
            if (tag.additional_info) {
              dispatch(appendToDownloadTags(tag));
            }
          });
        }
      }
    }
  }, [currentSnapshot, downloadTags, updateExistingDownload, dispatch]);

  const isStaticDownload = () => {
    return linkType !== 'incremental';
  };

  const prepareRequestObject = () => {
    let structuresToDownload = [];
    let isAllStructures = false;
    if (structuresSelection === 'allStructures') {
      structuresToDownload = allMolecules;
      isAllStructures = true;
    } else if (structuresSelection === 'displayedStructures') {
      structuresToDownload = allMolecules.filter(m => ligandsTurnedOnIds.some(id => id === m.id));
    } else if (structuresSelection === 'selectedStructures') {
      structuresToDownload = allMolecules.filter(m => selectedMoleculesIds.some(id => id === m.id));
    } else if (structuresSelection === 'tagged') {
      structuresToDownload = taggedMolecules;
    }

    const requestObject = getRequestObject(structuresToDownload, isAllStructures);

    return requestObject;
  };

  const getRequestObject = (structuresToDownload, allStructures = false) => {
    let proteinNames = '';
    if (!allStructures) {
      for (let i = 0; i < structuresToDownload.length; i++) {
        const struct = structuresToDownload[i];
        proteinNames = proteinNames + struct.code;
        if (i < structuresToDownload.length - 1) {
          proteinNames = proteinNames + ',';
        }
      }
    }
    let requestObject;
    if (!allStructures && structuresToDownload.length === 0) {
      requestObject = null;
    } else {
      requestObject = {
        target_name: targetName,
        proteins: proteinNames,
        ...mapFiles,
        ...crystallographicFiles,
        ...other,
        apo_file: pdb,
        bound_file: bound,
        metadata_info: metadata,
        smiles_info: smiles,
        static_link: isStaticDownload(),
        file_url: ''
      };
    }

    return requestObject;
  };

  const prepareDownloadClicked = () => async (dispatch, getState) => {
    const options = { link: { linkAction: downloadStructuresZip, linkText: 'Click to Download', linkParams: [] } };
    if (selectedDownload !== newDownload) {
      const donwloadTag = findDownload(selectedDownload);
      if (donwloadTag) {
        setError(false);
        setZipPreparing(true);
        setAlreadyInProgress(false);
        getDownloadStructuresUrl(donwloadTag.additional_info.requestObject)
          .then(resp => {
            if (resp.status === 208) {
              //same download is already preparing for someone else
              setAlreadyInProgress(true);
              toastInfo('Same download is already preparing for someone else. Try again in a minute.');
              return null;
            } else {
              //everything is fine and we got the URL
              setDownloadUrl(resp.data.file_url);

              return getDownloadFileSize(resp.data.file_url);
            }
          })
          .then(resp => {
            if (resp) {
              const fileSizeInBytes = resp.headers['content-length'];
              setFileSize(getFileSizeString(fileSizeInBytes));
              const url = generateUrlFromTagName(donwloadTag.tag);
              options.link.linkParams = [url];
              setDownloadTagUrl(url);
              setZipPreparing(false);
              toastSuccess('Download is ready!', options);
            }
          });
      }
    } else {
      setError(false);
      setZipPreparing(true);
      setAlreadyInProgress(false);
      let inProgress = false;

      // for testing purposes - preparation is way to fast
      // await new Promise(r => setTimeout(r, 120000));

      const requestObject = prepareRequestObject();
      if (requestObject) {
        const tagData = { requestObject: requestObject, structuresSelection: structuresSelection };
        dispatch(setDontShowShareSnapshot(true));
        const tagName = generateTagName();
        const auxData = { downloadTag: tagName };
        dispatch(saveAndShareSnapshot(nglViewList, false, auxData))
          .then(() => {
            const state = getState();
            const sharedSnapshot = state.snapshotReducers.sharedSnapshot;
            tagData['snapshot'] = sharedSnapshot;
            tagData['downloadName'] = moment().format('-- YYYY-MM-DD -- HH:mm:ss') + ' -- ' + moment.tz.guess();
            dispatch(setSharedSnapshot(initSharedSnapshot));
            dispatch(setDontShowShareSnapshot(false));
            return getDownloadStructuresUrl(requestObject);
          })
          .then(resp => {
            if (resp.status === 208) {
              //same download is already preparing for someone else
              setAlreadyInProgress(true);
              toastInfo('Same download is already preparing for someone else. Try again in a minute.');
              inProgress = true;
              return null;
            } else {
              //everything is fine and we got the URL
              setDownloadUrl(resp.data.file_url);
              options.link.linkParams = [resp.data.file_url];
              if (isStaticDownload()) {
                tagData.requestObject.file_url = resp.data.file_url;
              }
              return getDownloadFileSize(resp.data.file_url);
            }
          })
          .then(resp => {
            if (resp && !inProgress) {
              const fileSizeInBytes = resp.headers['content-length'];
              const fileSizeString = getFileSizeString(fileSizeInBytes);
              options.link.linkText = `Click to Download - ${fileSizeString}`;
              setFileSize(fileSizeString);
            }
          })
          .then(resp => {
            if (!inProgress) {
              return createDownloadTag(tagData, tagName);
            } else {
              return null;
            }
          })
          .then(molTag => {
            if (molTag && !inProgress) {
              dispatch(appendToDownloadTags(molTag));
              const url = generateUrl(molTag);
              setDownloadTagUrl(url);
              toastSuccess('Download is ready!', options);
            }
            setZipPreparing(false);
          })
          .catch(e => {
            setZipPreparing(false);
            setError(true);
            console.log(e);
            toastError('Download failed!!!');
          });
      } else {
        setZipPreparing(false);
      }
    }
  };

  const generateTagName = () => {
    return uuidv4();
  };

  const generateUrl = tag => {
    return generateUrlFromTagName(tag.tag);
  };

  const generateUrlFromTagName = tagName => {
    return `${base_url}/viewer/react/download/tag/${tagName}`;
  };

  const createDownloadTag = (tagData, tagName) => {
    const tagObject = createMoleculeTagObject(
      tagName,
      targetId,
      CATEGORY_ID[CATEGORY_TYPE.OTHER],
      DJANGO_CONTEXT.pk,
      DEFAULT_TAG_COLOR,
      'something/something/something',
      [],
      new Date(),
      tagData
    );

    return createNewDownloadTag(tagObject);
  };

  const downloadZipFile = () => {
    if (downloadUrl) {
      downloadStructuresZip(downloadUrl);
    }
  };

  const handleClose = () => {
    setDownloadUrl(null);
    setFileSize(null);
    setAlreadyInProgress(false);
    dispatch(setDownloadStructuresDialogOpen(false));
  };

  const findDownload = useCallback(
    downloadName => {
      const selectedTag = downloadTags.find(t => t.additional_info.downloadName === downloadName);
      return selectedTag;
    },
    [downloadTags]
  );

  const onUpdateExistingDownload = event => {
    updateExistingDownload(event.target.value);
  };

  // Extracts flags for specified flagList and returns them as a JSON object
  const getFlagsFromExistingDownload = (flagList, requestObject) => {
    const entries = flagList.map(({ flag }) => {
      return [flag, requestObject[flag]];
    });
    return Object.fromEntries(entries);
  };

  const updateExistingDownload = useCallback(
    downloadName => {
      setSelectedDownload(downloadName);
      if (downloadName !== newDownload) {
        const selectedTag = findDownload(downloadName);
        if (selectedTag) {
          setStructuresSelection(selectedTag.additional_info.structuresSelection || 'allStructures');

          setMapFiles(getFlagsFromExistingDownload(MAP_FILES, selectedTag.additional_info.requestObject));
          setCrystallographicFiles(
            getFlagsFromExistingDownload(CRYSTALLOGRAPHIC_FILES, selectedTag.additional_info.requestObject)
          );
          setOthers(getFlagsFromExistingDownload(OTHERS, selectedTag.additional_info.requestObject));

          setLinkType(selectedTag.additional_info.requestObject.static_link ? 'static' : 'incremental');

          setBound(selectedTag.additional_info.requestObject.bound_info);
          setMetadata(selectedTag.additional_info.requestObject.metadata_info);
          setSmiles(selectedTag.additional_info.requestObject.smiles_info);
          setPdb(selectedTag.additional_info.requestObject.pdb_info);
        }
      }
    },
    [findDownload]
  );

  const showSnapshotClicked = () => {
    const download = findDownload(selectedDownload);
    if (download && download.additional_info && download.additional_info.snapshot) {
      if (download.additional_info.snapshot.url.includes('http')) {
        window.open(download.additional_info.snapshot.url, '_blank');
      } else {
        window.open(`${base_url}${download.additional_info.snapshot.url}`, '_blank');
      }
    }
  };

  const copyPOSTJson = () => {
    const requestObject = prepareRequestObject();
    const jsonString = JSON.stringify(requestObject);
    updateClipboard(jsonString);
  };

  const ErrorMsg = withStyles({
    root: {
      color: 'red'
    }
  })(Typography);

  const WarnMsg = withStyles({
    root: {
      color: 'orange'
    }
  })(Typography);

  return (
    <Modal open={isOpen} noPadding>
      <div className={classes.root}>
        {!zipPreparing && !error && (
          <DialogTitle id="form-dialog-structures-title" disableTypography>
            <Typography variant="h5">{`Download structures and data for target ${targetName}`}</Typography>
          </DialogTitle>
        )}
        {zipPreparing && (
          <>
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
            {!error && (
              <DialogTitle id="form-dialog-structures-title" disableTypography>
                <Typography variant="h5">{'Preparing download... You can safely close this dialog'}</Typography>
              </DialogTitle>
            )}
          </>
        )}
        {error && (
          <DialogTitle id="form-dialog-structures-title" disableTypography>
            <ErrorMsg variant="h4">{'Download failed!!!'}</ErrorMsg>
          </DialogTitle>
        )}
        {alreadyInProgress && (
          <DialogTitle id="form-dialog-structures-title" disableTypography>
            <WarnMsg variant="h4">{'Same download is already being prepared. Try again in a minute.'}</WarnMsg>
          </DialogTitle>
        )}
        <DialogContent>
          <Grid container direction="column">
            <Typography variant="h6">Historic downloads</Typography>
            <Grid item container direction="row">
              <Grid item>
                <Select className={classes.select} value={selectedDownload} onChange={onUpdateExistingDownload}>
                  <MenuItem value={newDownload}>{newDownload}</MenuItem>
                  {downloadTags.map(dt => (
                    <MenuItem value={dt.additional_info.downloadName}>{dt.additional_info.downloadName}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item>
                <Button
                  className={classes.button}
                  color="primary"
                  disabled={!(selectedDownload && selectedDownload !== newDownload)}
                  onClick={() => {
                    showSnapshotClicked();
                  }}
                >
                  Open snapshot in new tab
                </Button>
              </Grid>
            </Grid>
            <div className={classes.grid}>
              {/* First row */}
              <Typography variant="h6">Subset selection</Typography>
              <Typography variant="h6">Map files, re-aligned to reference</Typography>
              <Typography variant="h6">Crystallographic files</Typography>

              {/* Second row */}
              <div>
                <RadioGroup
                  value={structuresSelection}
                  name="radio-group-structures-selection"
                  onChange={event => {
                    setStructuresSelection(event.currentTarget.value);
                  }}
                >
                  {SUBSET_SELECTION.map(({ flag, text }) => {
                    return (
                      <FormControlLabel
                        key={flag}
                        value={flag}
                        control={<Radio disabled={zipPreparing} />}
                        label={text}
                      />
                    );
                  })}
                </RadioGroup>
              </div>
              <div>
                {MAP_FILES.map(({ flag, text }) => {
                  return (
                    <FormControlLabel
                      key={flag}
                      control={
                        <Checkbox
                          checked={mapFiles[flag]}
                          onChange={() =>
                            setMapFiles(prevState => {
                              return { ...prevState, [flag]: !prevState[flag] };
                            })
                          }
                          disabled={zipPreparing}
                        />
                      }
                      label={text}
                    />
                  );
                })}
              </div>
              <div>
                {CRYSTALLOGRAPHIC_FILES.map(({ flag, text }) => {
                  return (
                    <FormControlLabel
                      key={flag}
                      control={
                        <Checkbox
                          checked={crystallographicFiles[flag]}
                          onChange={() =>
                            setCrystallographicFiles(prevState => {
                              return { ...prevState, [flag]: !prevState[flag] };
                            })
                          }
                          disabled={zipPreparing}
                        />
                      }
                      label={text}
                    />
                  );
                })}
              </div>

              {/* Third row */}
              <Typography className={classes.permalinkSection} variant="h6">
                Version of data stored in permalink
              </Typography>
              <Typography variant="h6">Other</Typography>

              {/* Fourth row */}
              <div className={classes.permalinkSection}>
                <RadioGroup
                  value={linkType}
                  name="radio-group-download-type"
                  onChange={event => {
                    setLinkType(event.currentTarget.value);
                  }}
                >
                  {PERMALINK_OPTIONS.map(({ flag, text }) => {
                    return (
                      <FormControlLabel
                        key={flag}
                        value={flag}
                        control={<Radio disabled={zipPreparing} />}
                        label={text}
                      />
                    );
                  })}
                </RadioGroup>
              </div>
              <div>
                {OTHERS.map(({ flag, text }) => {
                  return (
                    <FormControlLabel
                      key={flag}
                      control={
                        <Checkbox
                          checked={other[flag]}
                          onChange={() =>
                            setOthers(prevState => {
                              return { ...prevState, [flag]: !prevState[flag] };
                            })
                          }
                          disabled={zipPreparing}
                        />
                      }
                      label={text}
                    />
                  );
                })}
              </div>
            </div>
          </Grid>
        </DialogContent>
        <DialogActions className={classes.buttonRow}>
          <Button
            className={classes.button}
            disabled={zipPreparing}
            color="primary"
            onClick={() => {
              dispatch(prepareDownloadClicked());
            }}
          >
            Prepare download
          </Button>
          <Button
            className={classes.button}
            disabled={!downloadTagUrl}
            color="primary"
            onClick={() => {
              updateClipboard(downloadTagUrl);
            }}
          >
            Copy permalink
          </Button>
          <Button
            className={classes.button}
            disabled={!(downloadUrl && fileSize) || zipPreparing}
            color="primary"
            onClick={() => {
              downloadZipFile();
            }}
          >
            {fileSize ? `Download - ${fileSize}` : 'Download'}
          </Button>
          <Tooltip
            title={
              <Paper>
                <Typography varian="h6">
                  {`Get a json for a POST request (${base_url}/api/download_structures/) that will generate a FILE_URL. Download your data at ${base_url}/api/download_structures/?file_url=<FILE_URL>`}
                </Typography>
              </Paper>
            }
          >
            <Button
              className={classes.button}
              color="primary"
              onClick={() => {
                copyPOSTJson();
              }}
            >
              (For coders) Copy JSON for API call
            </Button>
          </Tooltip>
          <Tooltip title="Navigates to github thread with curl and python examples.">
            <Button
              className={classes.button}
              color="primary"
              onClick={() => {
                window.open('https://github.com/xchem/fragalysis-frontend/blob/master/EXAMPLES.md', '_blank');
              }}
            >
              Show Examples
            </Button>
          </Tooltip>
          <Button
            className={classes.closeButton}
            onClick={() => {
              handleClose();
            }}
          >
            Close
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
});
