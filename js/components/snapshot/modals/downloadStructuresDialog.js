import React, { memo, useState } from 'react';
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
  Typography
} from '@material-ui/core';
import { selectJoinedMoleculeList } from '../../preview/molecule/redux/selectors';
import { getDownloadStructuresUrl, downloadStructuresZip, getDownloadFileSize } from '../api/api';
import { setDownloadStructuresDialogOpen } from '../redux/actions';
import { getFileSizeString } from '../../../utils/api';
import { v4 as uuidv4 } from 'uuid';
import { createMoleculeTagObject, DEFAULT_TAG_COLOR } from '../../preview/tags/utils/tagUtils';
import { CATEGORY_TYPE, CATEGORY_ID } from '../../../constants/constants';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { createNewDownloadTag } from '../../preview/tags/api/tagsApi';
import { base_url } from '../../routes/constants';
import { updateClipboard } from '../helpers';

const useStyles = makeStyles(theme => ({}));

export const DownloadStructureDialog = memo(({}) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const isOpen = useSelector(state => state.snapshotReducers.downloadStructuresDialogOpen);
  const targetId = useSelector(state => state.apiReducers.target_on);
  const targetName = useSelector(state => state.apiReducers.target_on_name);
  const allMolecules = useSelector(state => state.apiReducers.all_mol_lists);
  const ligandsTurnedOnIds = useSelector(state => state.selectionReducers.proteinList);
  const selectedMoleculesIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  const taggedMolecules = useSelector(state => selectJoinedMoleculeList(state));

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
    const requestObject = {
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
      smiles_info: smiles
    };

    return requestObject;
  };

  const prepareDownloadClicked = () => {
    setZipPreparing(true);
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
    getDownloadStructuresUrl(requestObject)
      .then(resp => {
        setDownloadUrl(resp.data.file_url);
        return getDownloadFileSize(resp.data.file_url);
      })
      .then(resp => {
        const fileSizeInBytes = resp.headers['content-length'];
        setFileSize(getFileSizeString(fileSizeInBytes));
      })
      .then(resp => {
        return createDownloadTag(requestObject);
      })
      .then(molTag => {
        setDownloadTagUrl(generateUrl(molTag));
        setZipPreparing(false);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const generateTagName = () => {
    return uuidv4();
  };

  const generateUrl = tag => {
    return `${base_url}/viewer/react/download/tag/${tag.tag}`;
  };

  const createDownloadTag = requestObject => {
    const tagName = generateTagName();
    const tagObject = createMoleculeTagObject(
      tagName,
      targetId,
      CATEGORY_ID[CATEGORY_TYPE.OTHER],
      DJANGO_CONTEXT.pk,
      DEFAULT_TAG_COLOR,
      'something/something/something',
      [],
      new Date(),
      { requestObject: requestObject }
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

  return (
    <Modal open={isOpen}>
      {!zipPreparing && (
        <DialogTitle id="form-dialog-structures-title">{`Download structures for target ${targetName}`}</DialogTitle>
      )}
      {zipPreparing && (
        <>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
          <DialogTitle id="form-dialog-structures-title">{'Preparing download...'}</DialogTitle>
        </>
      )}
      <DialogContent>
        <Grid container direction="column">
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
          {/* {downloadTagUrl && (
            <Grid container item directio="row">
              <Grid item>
                <Typography>{downloadTagUrl}</Typography>
              </Grid>
              <Grid item></Grid>
            </Grid>
          )} */}
        </Grid>
      </DialogContent>
      <DialogActions>
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
            prepareDownloadClicked();
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
