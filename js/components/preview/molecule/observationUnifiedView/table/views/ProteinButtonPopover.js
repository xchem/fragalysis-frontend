import React, { useEffect } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import { useDispatch, useSelector } from 'react-redux';
import {
  appendProteinSettings,
  removeProteinSettings,
  setProteinSettings
} from '../../../../../../reducers/selection/actions';
import { withDisabledMoleculeNglControlButton } from '../../../redux/dispatchActions';

export const DEFAULT_PROTEIN_SETTINGS = {
  protein: true,
  artefact: false
};

const normalizeProteinSettings = settings => ({
  protein: settings?.protein ?? DEFAULT_PROTEIN_SETTINGS.protein,
  artefact: settings?.artefact ?? DEFAULT_PROTEIN_SETTINGS.artefact
});

const isDefaultProteinSettings = settings => {
  const normalizedSettings = normalizeProteinSettings(settings);
  return Object.keys(DEFAULT_PROTEIN_SETTINGS).every(
    key => normalizedSettings[key] === DEFAULT_PROTEIN_SETTINGS[key]
  );
};

export const ProteinButtonPopover = ({
  toggleProtein,
  proteinSettings,
  setProteinSettingsState,
  moleculeId,
  disabled
}) => {
  const dispatch = useDispatch();
  const proteinSettingsList = useSelector(state => state.selectionReducers.proteinSettings);

  useEffect(() => {
    const savedSetting = proteinSettingsList.find(item => item.id === moleculeId);
    if (savedSetting) {
      setProteinSettingsState(normalizeProteinSettings(savedSetting));
    } else {
      setProteinSettingsState(DEFAULT_PROTEIN_SETTINGS);
    }
  }, [moleculeId, proteinSettingsList, setProteinSettingsState]);

  const updateProteinSetting = async setting => {
    const savedSetting = proteinSettingsList.find(item => item.id === moleculeId);
    if (isDefaultProteinSettings(setting) && savedSetting) {
      dispatch(removeProteinSettings(savedSetting));
      return;
    }
    const nextSetting = normalizeProteinSettings(setting);
    if (savedSetting) {
      const newProteinSettingsList = proteinSettingsList.map(item =>
        item.id === moleculeId ? { id: item.id, ...nextSetting } : item
      );
      await dispatch(setProteinSettings(newProteinSettingsList));
    } else {
      dispatch(appendProteinSettings({ id: moleculeId, ...nextSetting }));
    }
  };

  const onToggleSetting = type => async event => {
    const nextSettings = normalizeProteinSettings({ ...proteinSettings, [type]: event.target.checked });
    setProteinSettingsState(nextSettings);
    dispatch(
      withDisabledMoleculeNglControlButton(moleculeId, 'protein', async () => {
        await updateProteinSetting(nextSettings);
      })
    );
    toggleProtein(undefined, type, nextSettings[type]);
  };

  return (
    <div style={{ padding: 16, minWidth: 200, minHeight: 150 }}>
      <Typography variant="subtitle1">Protein Settings</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={proteinSettings.protein}
              onChange={onToggleSetting('protein')}
              color="primary"
              disabled={disabled}
            />
          }
          label="Show sidechains"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={proteinSettings.artefact}
              onChange={onToggleSetting('artefact')}
              color="primary"
              disabled={disabled}
            />
          }
          label="Show artefacts chain"
        />
      </FormGroup>
    </div>
  );
};

export default ProteinButtonPopover;
