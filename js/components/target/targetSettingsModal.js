/**
 * This is a modal window for target settings
 */

import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Grid, IconButton, makeStyles, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from '@material-ui/core';
import { Tooltip } from '@mui/material';
import { Close } from '@mui/icons-material';
import { ToastContext } from '../toast';
import { base_url } from '../routes/constants';
import { api, METHOD } from '../../utils/api';
import { useDispatch, useSelector } from 'react-redux';
import { TOAST_LEVELS } from '../toast/constants';
import { addToastMessage } from '../../reducers/selection/actions';
import { replaceTarget, setTargetOnAliases, setTargetOnName } from '../../reducers/api/actions';
import { getCurrentTarget } from '../../reducers/api/selectors';

const useStyles = makeStyles(theme => ({
  copyButton: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  headerButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    color: theme.palette.grey[500]
  },
  root: {
    minWidth: 300
  },
  identifier: {
    '&:hover': {
      cursor: 'grab'
    },
    backgroundColor: theme.palette.grey[300],
    borderRadius: 5,
    marginTop: 2,
    marginBottom: 2,
    paddingLeft: '8px !important',
    paddingRight: '8px !important'
  }
}));

export const TargetSettingsModal = memo(({ openModal, onModalClose, isTargetOn = true }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const draggedIdentifier = useRef(0);
  const draggedOverIdentifier = useRef(0);

  const [editable, setEditable] = useState(false);
  const [identifierTypes, setIdentifierTypes] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [electronDensity, setElectronDensity] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);

  const target_on_name = useSelector(state => state.apiReducers.target_on_name);
  const target_on_aliases = useSelector(state => state.apiReducers.target_on_aliases);
  // const targets = useSelector(state => state.apiReducers.target_id_list);
  const activeTarget = useSelector(state => getCurrentTarget(state));
  const selectedTarget = useSelector(state => state.selectionReducers.targetToEdit);

  const getIdentifierTypes = async () => {
    return api({
      url: `${base_url}/api/compound-identifier-types/`,
      method: METHOD.GET
    })
      .then(resp => {
        return resp.data.results;
      })
      .catch(err => {
        console.log('error fetching compound-identifier-types', err);
        return [];
      });
  };

  const initData = useCallback(async () => {
    let targetAliasOrder = [];
    let targetName = '';
    const target = isTargetOn ? activeTarget : selectedTarget;
    if (isTargetOn) {
      // in target scope
      targetName = target_on_name;
      targetAliasOrder = target_on_aliases;
    } else {
      // out of in target scope
      targetName = target.display_name;
      targetAliasOrder = target.alias_order;
    }
    const allTypes = ['compound_code'].concat((await getIdentifierTypes()).map(identifier => identifier.name));
    let types = [];
    if (targetAliasOrder) {
      // use only existing types
      targetAliasOrder.forEach(alias => {
        if (allTypes.some(aliasToCheck => alias === aliasToCheck)) {
          types.push(alias);
        }
      });
      // add missing types
      allTypes.forEach(alias => {
        if (!types.some(aliasToCheck => alias === aliasToCheck)) {
          types.push(alias);
        }
      });
    } else {
      types = allTypes;
    }
    setCurrentTarget(target);
    setIdentifierTypes(types);
    setDisplayName(targetName);
    // setElectronDensity(null);
  }, [isTargetOn, target_on_name, target_on_aliases, activeTarget, selectedTarget]);

  useEffect(() => {
    if (openModal) {
      initData();
    }
  }, [openModal, initData]);

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  const handleSort = () => {
    const originalIdentifierTypes = [...identifierTypes];

    const temp = originalIdentifierTypes[draggedIdentifier.current];
    // originalIdentifierTypes[draggedIdentifier.current] = originalIdentifierTypes[draggedOverIdentifier.current];
    // originalIdentifierTypes[draggedOverIdentifier.current] = temp;

    if (draggedIdentifier.current !== -1 && draggedOverIdentifier.current !== -1) {
      originalIdentifierTypes.splice(draggedIdentifier.current, 1);
      originalIdentifierTypes.splice(draggedOverIdentifier.current, 0, temp);
    }

    setIdentifierTypes(originalIdentifierTypes);
  };

  const onSubmitForm = async () => {
    currentTarget &&
      api({
        url: `${base_url}/api/targets/${currentTarget.id}/`,
        method: METHOD.PATCH,
        data: { display_name: displayName, alias_order: identifierTypes }
      })
        .then(resp => {
          if (isTargetOn) {
            // in target scope
            dispatch(setTargetOnName(displayName));
            dispatch(setTargetOnAliases(identifierTypes));
          } else {
            // out of target scope
            currentTarget.display_name = displayName;
            currentTarget.alias_order = identifierTypes;
            dispatch(replaceTarget(currentTarget));
          }
          dispatch(addToastMessage({ text: `Target updated successfully`, level: TOAST_LEVELS.SUCCESS }));
          setEditable(false);
          onModalClose();
        })
        .catch(err => {
          dispatch(addToastMessage({ text: 'Error updated target', level: TOAST_LEVELS.ERROR }));
        });
  };

  return (
    <Dialog open={openModal} onClose={onModalClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>{editable ? "Edit target settings" : "Target settings"}</DialogTitle>
      <Tooltip title="Close editor">
        <IconButton
          color="inherit"
          className={classes.headerButton}
          onClick={onModalClose}
        >
          <Close />
        </IconButton>
      </Tooltip>
      <DialogContent dividers>
        <Grid container justifyContent="flex-start" direction="column" className={classes.root} spacing={2}>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Original name</Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="body1">{currentTarget?.title}</Typography>
            </Grid>
          </Grid>
          <Divider />
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Open to public</Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="body1">{currentTarget?.project?.open_to_public ? 'Yes' : 'No'}</Typography>
            </Grid>
          </Grid>
          <Divider />
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Display name</Typography>
            </Grid>
            <Grid item xs>
              {editable ?
                <TextField value={displayName ?? ""} placeholder="enter name" onChange={e => setDisplayName(e.target.value)} disabled={!editable} />
                :
                <Typography variant="body1">{displayName}</Typography>
              }
            </Grid>
          </Grid>
          <Divider />
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Preferred alias</Typography>
            </Grid>
            <Grid item xs>
              {editable ?
                <Tooltip title="Drag and drop to reorder">
                  <Grid item container direction="column" justifyContent="center" alignItems="flex-start" spacing={1} onDrop={e => e.preventDefault()} onDragOver={e => e.preventDefault()}>
                    {identifierTypes?.map((type, index) =>
                      <Grid key={type} item className={classes.identifier}
                        draggable="true"
                        onDragStart={() => draggedIdentifier.current = index}
                        onDragEnter={() => draggedOverIdentifier.current = index}
                        onDragEnd={handleSort}
                        onDragOver={e => e.preventDefault()}
                      >
                        <Typography variant="body1">{`${index + 1}. ${type}`}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Tooltip> :
                <Grid item container direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
                  {identifierTypes?.map((type, index) =>
                    <Grid key={type} item>
                      <Typography variant="body1">{`${index + 1}. ${type}`}</Typography>
                    </Grid>
                  )}
                </Grid>
              }
            </Grid>
          </Grid>
          <Divider />
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Electron density</Typography>
            </Grid>
            <Grid item xs>
              <RadioGroup
                name="electron-density-radio-group"
                value={electronDensity}
                onChange={e => setElectronDensity(e.target.value)}
              >
                <FormControlLabel value="wireframe" control={<Radio />} label="Wireframe" disabled={!editable || true} />
                <FormControlLabel value="surface" control={<Radio />} label="Surface" disabled={!editable || true} />
              </RadioGroup>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => setEditable(!editable)}>
          {editable ? 'Cancel' : 'Edit'}
        </Button>
        <Button autoFocus onClick={onSubmitForm} disabled={!editable || !displayName}>
          {'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
