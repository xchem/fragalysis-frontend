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
      setProteinSettingsState({ protein: savedSetting.protein, artefact: savedSetting.artefact });
    } else {
      setProteinSettingsState({ protein: true, artefact: true });
    }
  }, [moleculeId, proteinSettingsList, setProteinSettingsState]);

  const updateProteinSetting = async setting => {
    const savedSetting = proteinSettingsList.find(item => item.id === moleculeId);
    if (setting.protein && setting.artefact && savedSetting) {
      dispatch(removeProteinSettings(savedSetting));
      return;
    }
    if (savedSetting) {
      const newProteinSettingsList = proteinSettingsList.map(item =>
        item.id === moleculeId ? { id: item.id, ...setting } : item
      );
      await dispatch(setProteinSettings(newProteinSettingsList));
    } else {
      dispatch(appendProteinSettings({ id: moleculeId, protein: setting.protein, artefact: setting.artefact }));
    }
  };

  const onToggleSetting = type => async event => {
    const nextSettings = { ...proteinSettings, [type]: event.target.checked };
    setProteinSettingsState(nextSettings);
    dispatch(
      withDisabledMoleculeNglControlButton(moleculeId, 'protein', async () => {
        await updateProteinSetting(nextSettings);
      })
    );
    toggleProtein(undefined, type);
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
