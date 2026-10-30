/**
 * This is a modal window for target settings
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  GridLegacy as Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import { makeStyles } from '../../ui/styles';
import { Close } from '@mui/icons-material';
import { base_url } from '../routes/constants';
import { api, METHOD } from '../../utils/api';
import { useDispatch, useSelector } from 'react-redux';
import { TOAST_LEVELS } from '../toast/constants';
import { addToastMessage } from '../../reducers/selection/actions';
import { replaceTarget, setTargetOnAliases, setTargetOnName } from '../../reducers/api/actions';
import { getCurrentTarget } from '../../reducers/api/selectors';
import { DENSITY_MAP_TYPES, MAP_RENDERING_MODES } from '../preview/molecule/utils/constants';
import RichTooltip from '../tooltip/RichTooltip';
import { TargetAccessAction } from '../access/TargetAccessAction';
import { TargetBlogSettings } from './TargetBlogSettings';
import { useTargetBlog } from './useTargetBlog';
import { blogApiErrors } from './targetBlogApi';

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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const saveScope = useRef(null);
  const initialTargetValues = useRef(null);
  const [identifierTypes, setIdentifierTypes] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [shortName, setShortName] = useState('');
  const [longName, setLongName] = useState('');
  const [alias, setAlias] = useState('');
  const [organism, setOrganism] = useState('');
  const [externalURL, setExternalURL] = useState('');
  const [externalURLName, setExternalURLName] = useState('');
  const [currentTarget, setCurrentTarget] = useState(null);
  const [electronDensityMapType, setElectronDensityMapType] = useState(DENSITY_MAP_TYPES.EVENT);
  const [electronDensityRenderingMode, setElectronDensityRenderingMode] = useState(MAP_RENDERING_MODES.WIREFRAME);

  const [crystallographicBindingEvents, setCrystallographicBindingEvents] = useState(0);
  const [boundCompounds, setBoundCompounds] = useState(0);
  const [associatedAffinityMeasurements, setAssociatedAffinityMeasurements] = useState(0);
  const [measuredCompounds, setMeasuredCompounds] = useState(0);

  const target_on_name = useSelector(state => state.apiReducers.target_on_name);
  const target_on_aliases = useSelector(state => state.apiReducers.target_on_aliases);
  // const targets = useSelector(state => state.apiReducers.target_id_list);
  const activeTarget = useSelector(state => getCurrentTarget(state));
  const selectedTarget = useSelector(state => state.selectionReducers.targetToEdit);
  const targetId = (isTargetOn ? activeTarget : selectedTarget)?.id;
  const blog = useTargetBlog(targetId, openModal);

  useEffect(() => {
    const scope = { saving: false };
    saveScope.current = scope;
    setSaving(false);
    setSaveError('');
    setEditable(false);
    return () => {
      if (saveScope.current === scope) saveScope.current = null;
    };
  }, [targetId, openModal]);

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

  const initData = useCallback(
    async isActive => {
      let targetAliasOrder = [];
      let targetName = '';
      const target = isTargetOn ? activeTarget : selectedTarget;
      if (!target) return;
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
      if (!isActive()) return;
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
      setShortName(target.short_name);
      setLongName(target.long_name);
      setAlias(target.project?.alias);
      setOrganism(target.organism);
      setExternalURL(target.external_url);
      setExternalURLName(target.external_url_display_name);
      setElectronDensityMapType(target.settings?.electron_density_map_type || DENSITY_MAP_TYPES.EVENT);
      setElectronDensityRenderingMode(
        target.settings?.electron_density_rendering_mode || MAP_RENDERING_MODES.WIREFRAME
      );
      setCrystallographicBindingEvents(target.settings?.crystallographic_binding_events || 0);
      setBoundCompounds(target.settings?.bound_compounds || 0);
      setAssociatedAffinityMeasurements(target.settings?.associated_affinity_measurements || 0);
      setMeasuredCompounds(target.settings?.measured_compounds || 0);
      initialTargetValues.current = JSON.stringify([
        targetName,
        target.short_name,
        target.long_name,
        target.project?.alias,
        target.organism,
        target.external_url,
        target.external_url_display_name,
        types,
        target.settings?.electron_density_map_type || DENSITY_MAP_TYPES.EVENT,
        target.settings?.electron_density_rendering_mode || MAP_RENDERING_MODES.WIREFRAME,
        target.settings?.crystallographic_binding_events || 0,
        target.settings?.bound_compounds || 0,
        target.settings?.associated_affinity_measurements || 0,
        target.settings?.measured_compounds || 0
      ]);
      // setElectronDensity(null);
    },
    [isTargetOn, target_on_name, target_on_aliases, activeTarget, selectedTarget]
  );

  useEffect(() => {
    let active = true;
    if (openModal) {
      setCurrentTarget(null);
      initData(() => active);
    }
    return () => {
      active = false;
    };
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
    const scope = saveScope.current;
    if (!openModal || !scope || scope.saving || currentTarget?.id !== targetId || blog.status !== 'ready') return;
    scope.saving = true;
    setSaving(true);
    setSaveError('');
    const isCurrent = () => saveScope.current === scope;
    let blogSaved = false;
    let resource = 'target settings';
    try {
      const blogChanged = blog.dirty;
      const targetValuesUnchanged =
        initialTargetValues.current ===
        JSON.stringify([
          displayName,
          shortName,
          longName,
          alias,
          organism,
          externalURL,
          externalURLName,
          identifierTypes,
          electronDensityMapType,
          electronDensityRenderingMode,
          crystallographicBindingEvents,
          boundCompounds,
          associatedAffinityMeasurements,
          measuredCompounds
        ]);
      if (!(await blog.save()) || !isCurrent()) return;
      blogSaved = blogChanged;
      // A blog-only save must not replace the target list: doing so reloads the live Preview.
      if (blogChanged && targetValuesUnchanged) {
        dispatch(addToastMessage({ text: 'Blog updated successfully', level: TOAST_LEVELS.SUCCESS }));
        setEditable(false);
        onModalClose();
        return;
      }
      const updatedSettings = {
        ...(currentTarget.settings || {}),
        electron_density_map_type: electronDensityMapType,
        electron_density_rendering_mode: electronDensityRenderingMode,
        crystallographic_binding_events: crystallographicBindingEvents,
        bound_compounds: boundCompounds,
        associated_affinity_measurements: associatedAffinityMeasurements,
        measured_compounds: measuredCompounds
      };
      const targetData = {
        display_name: displayName,
        short_name: shortName,
        long_name: longName,
        organism,
        external_url: externalURL,
        external_url_display_name: externalURLName,
        alias_order: identifierTypes,
        settings: updatedSettings
      };
      await api({ url: `${base_url}/api/targets/${currentTarget.id}/`, method: METHOD.PATCH, data: targetData });
      if (!isCurrent()) return;
      let updatedTarget = { ...currentTarget, ...targetData };
      const projectId = currentTarget.project?.id || currentTarget.project;
      if (projectId) {
        resource = 'project alias';
        const projectAlias = alias?.length > 0 ? alias : null;
        await api({
          url: `${base_url}/api/projects/${projectId}/`,
          method: METHOD.PATCH,
          data: { alias: projectAlias }
        });
        if (!isCurrent()) return;
        if (typeof currentTarget.project === 'object') {
          updatedTarget = { ...updatedTarget, project: { ...currentTarget.project, alias: projectAlias } };
        }
      }
      dispatch(replaceTarget(updatedTarget));
      if (isTargetOn) {
        dispatch(setTargetOnName(displayName));
        dispatch(setTargetOnAliases(identifierTypes));
      }
      dispatch(addToastMessage({ text: 'Target updated successfully', level: TOAST_LEVELS.SUCCESS }));
      setEditable(false);
      onModalClose();
    } catch (error) {
      if (isCurrent()) {
        const details = Object.values(blogApiErrors(error, 'Please try again.')).join(' ');
        setSaveError(`${blogSaved ? 'Blog changes were saved. ' : ''}Unable to save ${resource}. ${details}`);
      }
    } finally {
      if (isCurrent()) {
        scope.saving = false;
        setSaving(false);
      }
    }
  };

  const closeDialog = () => {
    if (!saveScope.current?.saving) onModalClose();
  };

  return (
    <Dialog open={openModal} onClose={closeDialog}>
      <DialogTitle sx={{ m: 0, p: 2 }}>{editable ? 'Edit target settings' : 'Target settings'}</DialogTitle>
      <RichTooltip absolutePath path="fragalysis.components.targetSettings.close">
        <IconButton color="inherit" className={classes.headerButton} onClick={closeDialog} disabled={saving}>
          <Close />
        </IconButton>
      </RichTooltip>
      <DialogContent dividers>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}
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
          {openModal && (
            <Grid item>
              <TargetAccessAction target={isTargetOn ? activeTarget : selectedTarget} />
            </Grid>
          )}
          <Divider />
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Display name</Typography>
            </Grid>
            <Grid item xs>
              {editable ? (
                <TextField
                  value={displayName ?? ''}
                  placeholder="enter display name"
                  onChange={e => setDisplayName(e.target.value)}
                  disabled={!editable || saving}
                />
              ) : (
                <Typography variant="body1">{displayName}</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Short name</Typography>
            </Grid>
            <Grid item xs>
              {editable ? (
                <TextField
                  value={shortName ?? ''}
                  placeholder="enter short name"
                  onChange={e => setShortName(e.target.value)}
                  disabled={!editable || saving}
                />
              ) : (
                <Typography variant="body1">{shortName}</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Long name</Typography>
            </Grid>
            <Grid item xs>
              {editable ? (
                <TextField
                  value={longName ?? ''}
                  placeholder="enter long name"
                  onChange={e => setLongName(e.target.value)}
                  disabled={!editable || saving}
                />
              ) : (
                <Typography variant="body1">{longName}</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Alias</Typography>
            </Grid>
            <Grid item xs>
              {editable ? (
                <TextField
                  value={alias ?? ''}
                  placeholder="enter alias"
                  onChange={e => setAlias(e.target.value)}
                  disabled={!editable || saving}
                />
              ) : (
                <Typography variant="body1">{alias}</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Organism</Typography>
            </Grid>
            <Grid item xs>
              {editable ? (
                <TextField
                  value={organism ?? ''}
                  placeholder="enter organism"
                  onChange={e => setOrganism(e.target.value)}
                  disabled={!editable || saving}
                />
              ) : (
                <Typography variant="body1">{organism}</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">External URL</Typography>
            </Grid>
            <Grid item xs>
              {editable ? (
                <TextField
                  value={externalURL ?? ''}
                  placeholder="enter external URL"
                  onChange={e => setExternalURL(e.target.value)}
                  disabled={!editable || saving}
                />
              ) : (
                <Typography variant="body1">{externalURL}</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">External URL name</Typography>
            </Grid>
            <Grid item xs>
              {editable ? (
                <TextField
                  value={externalURLName ?? ''}
                  placeholder="enter external URL name"
                  onChange={e => setExternalURLName(e.target.value)}
                  disabled={!editable || saving}
                />
              ) : (
                <Typography variant="body1">{externalURLName}</Typography>
              )}
            </Grid>
          </Grid>
          <Divider />
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Preferred alias</Typography>
            </Grid>
            <Grid item xs>
              {editable ? (
                <RichTooltip absolutePath path="fragalysis.components.targetSettings.dragAndDrop">
                  <Grid
                    item
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={1}
                    onDrop={e => e.preventDefault()}
                    onDragOver={e => e.preventDefault()}
                  >
                    {identifierTypes?.map((type, index) => (
                      <Grid
                        key={type}
                        item
                        className={classes.identifier}
                        draggable={!saving}
                        onDragStart={() => (draggedIdentifier.current = index)}
                        onDragEnter={() => (draggedOverIdentifier.current = index)}
                        onDragEnd={handleSort}
                        onDragOver={e => e.preventDefault()}
                      >
                        <Typography variant="body1">{`${index + 1}. ${type}`}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </RichTooltip>
              ) : (
                <Grid item container direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
                  {identifierTypes?.map((type, index) => (
                    <Grid key={type} item>
                      <Typography variant="body1">{`${index + 1}. ${type}`}</Typography>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
          <Divider />
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Electron density</Typography>
            </Grid>

            <Grid item xs>
              <Grid container direction="column" spacing={1}>
                {/* Map type group */}
                <Grid item>
                  <Typography variant="body2">Map type</Typography>
                  <RadioGroup
                    row
                    name="electron-density-map-type"
                    value={electronDensityMapType}
                    onChange={e => setElectronDensityMapType(e.target.value)}
                  >
                    <FormControlLabel
                      value={DENSITY_MAP_TYPES.EVENT}
                      control={<Radio />}
                      label="PanDDA Event maps - primary evidence"
                      disabled={!editable || saving}
                    />
                    <FormControlLabel
                      value={DENSITY_MAP_TYPES._2FoFc}
                      control={<Radio />}
                      label='Conventional inspection maps ("2FoFc")'
                      disabled={!editable || saving}
                    />
                    <FormControlLabel
                      value={DENSITY_MAP_TYPES.FoFC}
                      control={<Radio />}
                      label='Conventional residual maps ("FoFc")'
                      disabled={!editable || saving}
                    />
                  </RadioGroup>
                </Grid>

                {/* Rendering mode group */}
                <Grid item>
                  <Typography variant="body2">Rendering mode</Typography>
                  <RadioGroup
                    row
                    name="electron-density-rendering-mode"
                    value={electronDensityRenderingMode}
                    onChange={e => setElectronDensityRenderingMode(e.target.value)}
                  >
                    <FormControlLabel
                      value={MAP_RENDERING_MODES.WIREFRAME}
                      control={<Radio />}
                      label="Wireframe"
                      disabled={!editable || saving}
                    />
                    <FormControlLabel
                      value={MAP_RENDERING_MODES.SURFACE}
                      control={<Radio />}
                      label="Surface"
                      disabled={!editable || saving}
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider />
          <TargetBlogSettings blog={blog} editable={editable} disabled={saving} />
          <Divider />
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Graph Data</Typography>
            </Grid>
            <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Grid item xs>
                <Typography variant="body1">Crystallographic Binding events</Typography>
              </Grid>
              <Grid item xs>
                {editable ? (
                  <TextField
                    value={crystallographicBindingEvents ?? ''}
                    placeholder="enter crystallographic binding events"
                    onChange={e => setCrystallographicBindingEvents(e.target.value)}
                    disabled={!editable || saving}
                  />
                ) : (
                  <Typography variant="body1">{crystallographicBindingEvents}</Typography>
                )}
              </Grid>
            </Grid>
            <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Grid item xs>
                <Typography variant="body1">Bound Compounds</Typography>
              </Grid>
              <Grid item xs>
                {editable ? (
                  <TextField
                    value={boundCompounds ?? ''}
                    placeholder="enter bound compounds"
                    onChange={e => setBoundCompounds(e.target.value)}
                    disabled={!editable || saving}
                  />
                ) : (
                  <Typography variant="body1">{boundCompounds}</Typography>
                )}
              </Grid>
            </Grid>
            <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Grid item xs>
                <Typography variant="body1">Associated Affinity Measurements</Typography>
              </Grid>
              <Grid item xs>
                {editable ? (
                  <TextField
                    value={associatedAffinityMeasurements ?? ''}
                    placeholder="enter associated affinity measurements"
                    onChange={e => setAssociatedAffinityMeasurements(e.target.value)}
                    disabled={!editable || saving}
                  />
                ) : (
                  <Typography variant="body1">{associatedAffinityMeasurements}</Typography>
                )}
              </Grid>
            </Grid>
            <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Grid item xs>
                <Typography variant="body1">Measured Compounds</Typography>
              </Grid>
              <Grid item xs>
                {editable ? (
                  <TextField
                    value={measuredCompounds ?? ''}
                    placeholder="enter measured compounds"
                    onChange={e => setMeasuredCompounds(e.target.value)}
                    disabled={!editable || saving}
                  />
                ) : (
                  <Typography variant="body1">{measuredCompounds}</Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <RichTooltip path={editable ? 'cancel' : 'edit'}>
          <Button
            autoFocus
            disabled={saving || !currentTarget}
            onClick={() => {
              if (editable) blog.reset();
              setSaveError('');
              setEditable(!editable);
            }}
          >
            {editable ? 'Cancel' : 'Edit'}
          </Button>
        </RichTooltip>
        <RichTooltip path="saveChanges">
          <Button
            autoFocus
            onClick={onSubmitForm}
            disabled={!editable || !displayName || saving || currentTarget?.id !== targetId || blog.status !== 'ready'}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </RichTooltip>
      </DialogActions>
    </Dialog>
  );
});
