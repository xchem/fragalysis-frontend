import { FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  appendProteinSettings,
  removeProteinSettings,
  setProteinSettings
} from '../../../../../../reducers/selection/actions';
import { withDisabledMoleculeNglControlButton } from '../../../redux/dispatchActions';

export const ProteinButtonPopover = props => {
  const { toogleProtein, proteinSettings, setProteinSettingsState, moleculeId, disabled } = props;
  const dispatch = useDispatch();

  const proteinSettingsList = useSelector(state => state.selectionReducers.proteinSettings);

  useEffect(() => {
    const filteredSetting = proteinSettingsList.find(item => item.id === moleculeId);
    if (filteredSetting) {
      setProteinSettingsState({ protein: filteredSetting.protein, artefact: filteredSetting.artefact });
    } else {
      setProteinSettingsState({ protein: true, artefact: true });
    }
  }, [proteinSettingsList]);

  const updateProteinSetting = async setting => {
    console.log('setting', setting);
    const filteredSetting = proteinSettingsList.find(item => item.id === moleculeId);
    if (setting.protein && setting.artefact && filteredSetting) {
      dispatch(removeProteinSettings(filteredSetting));
      return;
    }
    if (filteredSetting) {
      const newProteinSettingsList = proteinSettingsList.map(item => {
        if (item.id === moleculeId) {
          return { id: item.id, ...setting };
        }
        return item;
      });
      console.log('settings', newProteinSettingsList);
      // dispatch(
      //   withDisabledMoleculeNglControlButton(moleculeId, 'protein', async () => {
      await dispatch(setProteinSettings(newProteinSettingsList));
      //   })
      // );
    } else {
      dispatch(appendProteinSettings({ id: moleculeId, protein: setting.protein, artefact: setting.artefact }));
    }
  };

  const onToggleSetting = type => async event => {
    console.log('id', moleculeId);
    dispatch(
      withDisabledMoleculeNglControlButton(moleculeId, 'protein', async () => {
        await updateProteinSetting({ ...proteinSettings, [type]: event.target.checked });
      })
    );
    // setProteinSettingsState(prev => {
    //   return { ...prev, [type]: event.target.checked };
    // });

    toogleProtein(undefined, type);
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
        ></FormControlLabel>
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
        ></FormControlLabel>
      </FormGroup>
    </div>
  );
};
export default ProteinButtonPopover;
