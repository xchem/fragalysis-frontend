import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import { SketchPicker } from 'react-color';
import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentTarget } from '../../../../../../reducers/api/selectors';
import { DENSITY_MAP_TYPES, MAP_RENDERING_MODES } from '../../../utils/constants';
import { getRandomColor } from '../../../utils/color';
import { NGL_OBJECTS } from '../../../../../../reducers/ngl/constants';
import { RHS_INSPIRATION } from '../../../../../../constants/poseNavigation';
import { isEqual, throttle } from 'lodash';
import { appendToBeDisplayedList, updateInToBeDisplayedList } from '../../../../../../reducers/selection/actions';

export const DensityButtonPopover = ({ mol, rhsInspiration = false }) => {
  const dispatch = useDispatch();

  const densityList = useSelector(state => state.selectionReducers.densityList);
  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const activeTarget = useSelector(state => getCurrentTarget(state));
  const defaultMapType = activeTarget?.settings?.electron_density_map_type || DENSITY_MAP_TYPES.EVENT;
  const defaultMapRendering = activeTarget?.settings?.electron_density_rendering_mode || MAP_RENDERING_MODES.WIREFRAME;
  const colourToggle = getRandomColor(mol);

  const currentDensity =
    toBeDisplayedList.find(d => d.id === mol.id && d.type === NGL_OBJECTS.DENSITY)?.densityObject ||
    densityList.find(d => d.id === mol.id);

  const densityData = mol.proteinData;

  const isDensityAvailable = url => {
    if (!url || url.endsWith('None')) {
      return false;
    }
    return true;
  };

  const checkDensity = mapType => {
    if (currentDensity) {
      if (mapType === DENSITY_MAP_TYPES.EVENT) {
        return !!currentDensity.render_event;
      } else if (mapType === DENSITY_MAP_TYPES._2FoFc) {
        return !!currentDensity.render_2FoFc;
      } else if (mapType === DENSITY_MAP_TYPES.FoFC) {
        return !!currentDensity.render_FoFc;
      }
    } else {
      const defaultChecked = { render_event: false, render_2FoFc: false, render_FoFc: false };
      if (defaultMapType === DENSITY_MAP_TYPES.EVENT) {
        if (isDensityAvailable(mol?.proteinData?.event_info)) {
          defaultChecked.render_event = true;
        } else if (isDensityAvailable(mol?.proteinData?.sigmaa_info)) {
          defaultChecked.render_2FoFc = true;
        } else if (isDensityAvailable(mol?.proteinData?.diff_info)) {
          defaultChecked.render_FoFc = true;
        }
      } else if (defaultMapType === DENSITY_MAP_TYPES._2FoFc) {
        if (isDensityAvailable(mol?.proteinData?.sigmaa_info)) {
          defaultChecked.render_2FoFc = true;
        } else if (isDensityAvailable(mol?.proteinData?.event_info)) {
          defaultChecked.render_event = true;
        } else if (isDensityAvailable(mol?.proteinData?.diff_info)) {
          defaultChecked.render_FoFc = true;
        }
      } else if (defaultMapType === DENSITY_MAP_TYPES.FoFC) {
        if (isDensityAvailable(mol?.proteinData?.diff_info)) {
          defaultChecked.render_FoFc = true;
        } else if (isDensityAvailable(mol?.proteinData?.event_info)) {
          defaultChecked.render_event = true;
        } else if (isDensityAvailable(mol?.proteinData?.sigmaa_info)) {
          defaultChecked.render_2FoFc = true;
        }
      } else {
        // unknown type so defaulting first available
        if (isDensityAvailable(mol?.proteinData?.event_info)) {
          defaultChecked.render_event = true;
        } else if (isDensityAvailable(mol?.proteinData?.sigmaa_info)) {
          defaultChecked.render_2FoFc = true;
        } else if (isDensityAvailable(mol?.proteinData?.diff_info)) {
          defaultChecked.render_FoFc = true;
        }
      }
      if (mapType === DENSITY_MAP_TYPES.EVENT) {
        return defaultChecked.render_event;
      } else if (mapType === DENSITY_MAP_TYPES._2FoFc) {
        return defaultChecked.render_2FoFc;
      } else if (mapType === DENSITY_MAP_TYPES.FoFC) {
        return defaultChecked.render_FoFc;
      }
    }
  };

  const resolveContour = mapType => {
    if (currentDensity) {
      if (mapType === DENSITY_MAP_TYPES.EVENT) {
        return currentDensity.contour_event ?? 1.0;
      } else if (mapType === DENSITY_MAP_TYPES._2FoFc) {
        return currentDensity.contour_2FoFc ?? 1.0;
      } else if (mapType === DENSITY_MAP_TYPES.FoFC) {
        return currentDensity.contour_FoFc ?? 3.0;
      }
    } else {
      if (mapType === DENSITY_MAP_TYPES.EVENT) {
        return 1.0;
      } else if (mapType === DENSITY_MAP_TYPES._2FoFc) {
        return 1.2;
      } else if (mapType === DENSITY_MAP_TYPES.FoFC) {
        return 3.0;
      }
    }
  };

  const [checked, setChecked] = useState({
    render_event: checkDensity(DENSITY_MAP_TYPES.EVENT),
    render_FoFc: checkDensity(DENSITY_MAP_TYPES.FoFC),
    render_2FoFc: checkDensity(DENSITY_MAP_TYPES._2FoFc)
  });

  const [mode, setMode] = useState(
    currentDensity
      ? currentDensity.isWireframeStyle
        ? MAP_RENDERING_MODES.WIREFRAME
        : MAP_RENDERING_MODES.SURFACE
      : defaultMapRendering
  );

  const [contour, setContour] = useState({
    render_event: resolveContour(DENSITY_MAP_TYPES.EVENT),
    render_2FoFc: resolveContour(DENSITY_MAP_TYPES._2FoFc),
    render_FoFc: resolveContour(DENSITY_MAP_TYPES.FoFC)
  });

  const [color, setColor] = useState(currentDensity ? currentDensity.color : colourToggle);

  const createDefaultDensityObject = useCallback(
    (representations = undefined) => {
      if (!mol || !mol.id) {
        return {};
      }
      return {
        type: NGL_OBJECTS.DENSITY,
        id: mol.id,
        display: true,
        ...(rhsInspiration && { [RHS_INSPIRATION]: true }),
        representations: representations,
        densityData: mol.proteinData,
        densityObject: {
          id: mol.id,
          isWireframeStyle: mode === MAP_RENDERING_MODES.WIREFRAME,
          color: color,
          ...checked,
          contour_event: contour.render_event,
          contour_2FoFc: contour.render_2FoFc,
          contour_FoFc: contour.render_FoFc
        }
      };
    },
    [mol, rhsInspiration, mode, color, checked, contour]
  );

  // Opening the editor normalizes omitted flags/defaults for its controls.
  // Treat that initial appearance as unchanged so an existing map stays loaded.
  const lastSubmittedDensity = useRef(currentDensity ? createDefaultDensityObject().densityObject : null);

  useEffect(() => {
    const densityToEdit = createDefaultDensityObject();
    if (!densityToEdit.id || isEqual(lastSubmittedDensity.current, densityToEdit.densityObject)) return;
    lastSubmittedDensity.current = densityToEdit.densityObject;
    // Submit local edits once. Queue acknowledgements must not resubmit stale
    // settings or retry a failed map load while the popover remains open.
    dispatch((dispatch, getState) => {
      const densityRenderObject = getState().selectionReducers.toBeDisplayedList.find(
        d => d.id === densityToEdit.id && d.type === NGL_OBJECTS.DENSITY
      );
      if (!densityRenderObject) {
        dispatch(appendToBeDisplayedList(densityToEdit));
      } else if (!isEqual(densityRenderObject.densityObject, densityToEdit.densityObject)) {
        dispatch(
          updateInToBeDisplayedList({
            ...densityRenderObject,
            densityObject: densityToEdit.densityObject,
            rendered: false
          })
        );
      }
    });
  }, [createDefaultDensityObject, dispatch]);

  const handleCheckbox = name => event => {
    setChecked({ ...checked, [name]: event.target.checked });
  };

  const handleMode = event => {
    setMode(event.target.value);
  };

  const handleContour = name => (event, value) => {
    setContour(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const throttledHandleColor = useMemo(
    () =>
      throttle(newColor => {
        setColor(newColor.hex);
      }, 100),
    [setColor]
  );

  const isEventAvailable =
    !!densityData &&
    !!densityData.event_info &&
    densityData.event_info !== '' &&
    !densityData.event_info?.endsWith('None');

  const is2FoFcAvailable =
    !!densityData &&
    !!densityData.sigmaa_info &&
    densityData.sigmaa_info !== '' &&
    !densityData.sigmaa_info?.endsWith('None');

  const isFoFcAvailable =
    !!densityData &&
    !!densityData.diff_info &&
    densityData.diff_info !== '' &&
    !densityData.diff_info?.endsWith('None');

  const atLeastOneDensityChecked = checked.render_event || checked.render_2FoFc || checked.render_FoFc;
  const disableColorPicker =
    (checked.render_FoFc && !checked.render_2FoFc && !checked.render_event) || !atLeastOneDensityChecked;

  return (
    <div style={{ padding: 16, minWidth: 240 }}>
      <Typography variant="subtitle1">Density Customization</Typography>

      <Box mt={2} mb={1}>
        <FormLabel component="legend">Density Maps</FormLabel>
        <FormGroup>
          <Box display="flex" alignItems="center" mb={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked.render_event}
                  onChange={handleCheckbox('render_event')}
                  color="primary"
                  disabled={!isEventAvailable}
                />
              }
              label="Event"
            />
            <Box ml={2} flexGrow={1}>
              <Slider
                value={contour.render_event}
                onChange={handleContour('render_event')}
                min={0.0}
                max={3.0}
                step={0.1}
                valueLabelDisplay="auto"
                disabled={!isEventAvailable || !checked.render_event}
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked.render_2FoFc}
                  onChange={handleCheckbox('render_2FoFc')}
                  color="primary"
                  disabled={!is2FoFcAvailable}
                />
              }
              label="2FoFc"
            />
            <Box ml={2} flexGrow={1}>
              <Slider
                value={contour.render_2FoFc}
                onChange={handleContour('render_2FoFc')}
                min={0.0}
                max={5.0}
                step={0.1}
                valueLabelDisplay="auto"
                disabled={!is2FoFcAvailable || !checked.render_2FoFc}
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked.render_FoFc}
                  onChange={handleCheckbox('render_FoFc')}
                  color="primary"
                  disabled={!isFoFcAvailable}
                />
              }
              label="FoFc"
            />
            <Box ml={2} flexGrow={1}>
              <Slider
                value={contour.render_FoFc}
                onChange={handleContour('render_FoFc')}
                min={2.0}
                max={4.0}
                step={0.1}
                valueLabelDisplay="auto"
                disabled={!isFoFcAvailable || !checked.render_FoFc}
              />
            </Box>
          </Box>
        </FormGroup>
      </Box>

      <Box mb={1}>
        <FormLabel component="legend">Display Mode</FormLabel>
        <RadioGroup row value={mode} onChange={handleMode}>
          <FormControlLabel value="surface" control={<Radio color="primary" />} label="Surface" />
          <FormControlLabel value="wireframe" control={<Radio color="primary" />} label="Wireframe" />
        </RadioGroup>
      </Box>

      <Box mb={1}>
        <FormLabel component="legend">Map Color</FormLabel>
        <Box
          mt={1}
          style={{
            width: 240,
            height: 220,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {disableColorPicker ? (
            <Box p={2} color="grey">
              {atLeastOneDensityChecked
                ? `Color selection disabled for FoFc-only mode.`
                : `Please select at least one density map to enable color selection.`}
            </Box>
          ) : (
            <SketchPicker
              color={color}
              onChange={throttledHandleColor}
              disableAlpha={true}
              presetColors={[]}
              disabled={checked.render_FoFc && !checked.render_2FoFc && !checked.render_event}
            />
          )}
        </Box>
      </Box>
    </div>
  );
};

export default DensityButtonPopover;
