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
import moment from 'moment';
import { appendToDownloadTags } from '../../../reducers/api/actions';
import { getTagByName } from '../../preview/tags/api/tagsApi';
import { withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
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
  }
}));

export const DownloadStructureDialog = memo(({}) => {
  const newDownload = '--- NEW DOWNLOAD ---';
  const dispatch = useDispatch();
  const classes = useStyles();
  const { nglViewList } = useContext(NglContext);

  const isOpen = useSelector(state => state.snapshotReducers.downloadStructuresDialogOpen);
  const targetId = useSelector(state => state.apiReducers.target_on);
  const targetName = useSelector(state => state.apiReducers.target_on_name);
  const allMolecules = useSelector(state => state.apiReducers.all_mol_lists);
  const ligandsTurnedOnIds = useSelector(state => state.selectionReducers.proteinList);
  const selectedMoleculesIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  const taggedMolecules = useSelector(state => selectJoinedMoleculeList(state));
  const downloadTags = useSelector(state => state.apiReducers.downloadTags);
  const currentSnapshot = useSelector(state => state.projectReducers.currentSnapshot);

  const [structuresSelection, setStructuresSelection] = useState('allStructures');
  const [bound, setBound] = useState(true);
  const [cif, setCif] = useState(false);
  const [diff, setDiff] = useState(false);
  const [event, setEvent] = useState(false);
  const [sigmaa, setSigmaa] = useState(false);
  const [sdf, setSdf] = useState(false);
  const [transformMatrix, setTransformMatrix] = useState(false);
  const [metadata, setMetadata] = useState(true);
  const [smiles, setSmiles] = useState(true);
  const [pdb, setPdb] = useState(false);
  const [mtz, setMtz] = useState(false);
  const [map, setMap] = useState(false);
  const [singleSdf, setSingleSdf] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [zipPreparing, setZipPreparing] = useState(false);
  const [downloadTagUrl, setDownloadTagUrl] = useState(null);
  const [selectedDownload, setSelectedDownload] = useState(newDownload);
  const [linkType, setLinkType] = useState('incremental');
  const [error, setError] = useState(false);

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
        proteinNames = proteinNames + struct.protein_code;
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
        pdb_info: pdb,
        bound_info: bound,
        cif_info: cif,
        mtz_info: mtz,
        diff_info: diff,
        event_info: event,
        sigmaa_info: sigmaa,
        sdf_info: sdf,
        single_sdf_file: singleSdf,
        trans_matrix_info: transformMatrix,
        metadata_info: metadata,
        smiles_info: smiles,
        static_link: isStaticDownload(),
        file_url: ''
      };
    }

    return requestObject;
  };

  const prepareDownloadClicked = () => (dispatch, getState) => {
    if (selectedDownload !== newDownload) {
      const donwloadTag = findDownload(selectedDownload);
      if (donwloadTag) {
        setError(false);
        setZipPreparing(true);
        getDownloadStructuresUrl(donwloadTag.additional_info.requestObject)
          .then(resp => {
            setDownloadUrl(resp.data.file_url);
            return getDownloadFileSize(resp.data.file_url);
          })
          .then(resp => {
            const fileSizeInBytes = resp.headers['content-length'];
            setFileSize(getFileSizeString(fileSizeInBytes));
            setDownloadTagUrl(generateUrlFromTagName(donwloadTag.tag));
            setZipPreparing(false);
          });
      }
    } else {
      setError(false);
      setZipPreparing(true);

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
            tagData['downloadName'] = moment().format('-- YYYY-MM-DD -- HH:mm:ss');
            dispatch(setSharedSnapshot(initSharedSnapshot));
            dispatch(setDontShowShareSnapshot(false));
            return getDownloadStructuresUrl(requestObject);
          })
          .then(resp => {
            setDownloadUrl(resp.data.file_url);
            if (isStaticDownload()) {
              tagData.requestObject.file_url = resp.data.file_url;
            }
            return getDownloadFileSize(resp.data.file_url);
          })
          .then(resp => {
            const fileSizeInBytes = resp.headers['content-length'];
            setFileSize(getFileSizeString(fileSizeInBytes));
          })
          .then(resp => {
            return createDownloadTag(tagData, tagName);
          })
          .then(molTag => {
            dispatch(appendToDownloadTags(molTag));
            setDownloadTagUrl(generateUrl(molTag));
            setZipPreparing(false);
          })
          .catch(e => {
            setZipPreparing(false);
            setError(true);
            console.log(e);
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

  const updateExistingDownload = useCallback(
    downloadName => {
      setSelectedDownload(downloadName);
      if (downloadName !== newDownload) {
        const selectedTag = findDownload(downloadName);
        if (selectedTag) {
          setStructuresSelection(selectedTag.additional_info.structuresSelection || 'allStructures');
          setBound(selectedTag.additional_info.requestObject.bound_info);
          setCif(selectedTag.additional_info.requestObject.cif_info);
          setDiff(selectedTag.additional_info.requestObject.diff_info);
          setEvent(selectedTag.additional_info.requestObject.event_info);
          setSigmaa(selectedTag.additional_info.requestObject.sigmaa_info);
          setSdf(selectedTag.additional_info.requestObject.sdf_info);
          setTransformMatrix(selectedTag.additional_info.requestObject.trans_matrix_info);
          setMetadata(selectedTag.additional_info.requestObject.metadata_info);
          setSmiles(selectedTag.additional_info.requestObject.smiles_info);
          setPdb(selectedTag.additional_info.requestObject.pdb_info);
          setMtz(selectedTag.additional_info.requestObject.mtz_info);
          setSingleSdf(selectedTag.additional_info.requestObject.single_sdf_file);
          setLinkType(selectedTag.additional_info.requestObject.static_link ? 'static' : 'incremental');
        }
      }
    },
    [findDownload]
  );

  const showSnapshotClicked = () => {
    const download = findDownload(selectedDownload);
    if (download && download.additional_info && download.additional_info.snapshot) {
      window.open(download.additional_info.snapshot.url, '_blank');
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

  return (
    <Modal open={isOpen}>
      {!zipPreparing && !error && (
        <DialogTitle id="form-dialog-structures-title">
          <Typography variant="h5">{`Download structures for target ${targetName}`}</Typography>
        </DialogTitle>
      )}
      {zipPreparing && (
        <>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
          {!error && (
            <DialogTitle id="form-dialog-structures-title">
              <Typography variant="h5">{'Preparing download...'}</Typography>
            </DialogTitle>
          )}
        </>
      )}
      {error && (
        <DialogTitle id="form-dialog-structures-title">
          <ErrorMsg variant="h4">{'Download failed!!!'}</ErrorMsg>
        </DialogTitle>
      )}
      <DialogContent>
        <Grid container direction="column">
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
                color="primary"
                disabled={!(selectedDownload && selectedDownload !== newDownload)}
                onClick={() => {
                  showSnapshotClicked();
                }}
              >
                Show snapshot
              </Button>
            </Grid>
          </Grid>
          <Grid item>
            <RadioGroup
              value={linkType}
              name="radio-group-download-type"
              onChange={event => {
                setLinkType(event.currentTarget.value);
              }}
            >
              <FormControlLabel
                value="incremental"
                control={<Radio disabled={zipPreparing} />}
                label="Incremental always up to date download"
              />
              <FormControlLabel
                value="static"
                control={<Radio disabled={zipPreparing} />}
                label="Preserve snapshot of the download"
              />
            </RadioGroup>
          </Grid>
          <Grid container item direction="row">
            <Grid container item direction="column" xs={4}>
              <RadioGroup
                value={structuresSelection}
                name="radio-group-structures-selection"
                onChange={event => {
                  setStructuresSelection(event.currentTarget.value);
                }}
              >
                <FormControlLabel
                  value="allStructures"
                  control={<Radio disabled={zipPreparing} />}
                  label="All structures"
                />
                <FormControlLabel
                  value="displayedStructures"
                  control={<Radio disabled={zipPreparing} />}
                  label="Structures with ligands displayed in 3D pane"
                />
                <FormControlLabel
                  value="selectedStructures"
                  control={<Radio disabled={zipPreparing} />}
                  label="Structures selected in Hit Navigator"
                />
                <FormControlLabel
                  value="tagged"
                  control={<Radio disabled={zipPreparing} />}
                  label="Structures associated with selected tags"
                />
              </RadioGroup>
            </Grid>
            <Grid container item direction="column" xs={4}>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={cif} onChange={event => setCif(!cif)} disabled={zipPreparing} />}
                  label="CIF"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={diff} onChange={event => setDiff(!diff)} disabled={zipPreparing} />}
                  label="DIFF"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={event} onChange={e => setEvent(!event)} disabled={zipPreparing} />}
                  label="EVENT"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={sigmaa} onChange={event => setSigmaa(!sigmaa)} disabled={zipPreparing} />}
                  label="SIGMAA"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={sdf} onChange={event => setSdf(!sdf)} disabled={zipPreparing} />}
                  label="SDF"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={transformMatrix}
                      onChange={event => setTransformMatrix(!transformMatrix)}
                      disabled={zipPreparing}
                    />
                  }
                  label="Transformation matrix"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={singleSdf}
                      onChange={event => setSingleSdf(!singleSdf)}
                      disabled={zipPreparing}
                    />
                  }
                  label="All ligands in single SDF"
                />
              </Grid>
            </Grid>
            <Grid container item direction="column" xs={4}>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={pdb} onChange={event => setPdb(!pdb)} disabled={zipPreparing} />}
                  label="PDB"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={mtz} onChange={event => setMtz(!mtz)} disabled={zipPreparing} />}
                  label="MTZ"
                />
              </Grid>
              <Grid item>
                <FormControlLabel control={<Checkbox checked={false} disabled={true} />} label="Event MTZ" />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={map} onChange={event => setMap(!map)} disabled={zipPreparing} />}
                  label="Raw ccp4 map files"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
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
            color="primary"
            onClick={() => {
              copyPOSTJson();
            }}
          >
            (for coders) Copy POST request json
          </Button>
        </Tooltip>
        <Button
          disabled={!(downloadUrl && fileSize) || zipPreparing}
          color="primary"
          onClick={() => {
            downloadZipFile();
          }}
        >
          {fileSize ? `Download - ${fileSize}` : 'Download'}
        </Button>
        <Button
          disabled={!downloadTagUrl}
          color="primary"
          onClick={() => {
            updateClipboard(downloadTagUrl);
          }}
        >
          Copy link
        </Button>
        <Button
          disabled={zipPreparing}
          color="primary"
          onClick={() => {
            dispatch(prepareDownloadClicked());
          }}
        >
          Prepare download
        </Button>
        <Button
          color="secondary"
          onClick={() => {
            handleClose();
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Modal>
  );
});
