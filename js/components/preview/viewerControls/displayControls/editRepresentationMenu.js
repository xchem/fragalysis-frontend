import React, { memo, useContext } from 'react';
import { Menu, Slider, Grid, makeStyles, Checkbox, TextField, Select } from '@material-ui/core';
import { NglContext } from '../../../nglView/nglProvider';
import { useDispatch, useSelector } from 'react-redux';
import { updateComponentRepresentation } from '../../../../reducers/ngl/nglActions';
import { throttle } from 'lodash';
import { MOL_REPRESENTATION } from '../../../nglView/constants';

const useStyles = makeStyles(theme => ({
  menu: {
    minWidth: 332,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  itemWidth: {
    width: 180
  }
}));

export const EditRepresentationMenu = memo(
  ({ editMenuAnchor, closeRepresentationEditMenu, representation, parentKey }) => {
    const classes = useStyles();
    const { getNglView } = useContext(NglContext);
    const objectsInView = useSelector(state => state.nglReducers.present.objectsInView) || {};

    const dispatch = useDispatch();
    const oldRepresentation = JSON.parse(JSON.stringify(representation));
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;

    const handleRepresentationPropertyChange = throttle(
      (key, value) =>
        comp.eachRepresentation(r => {
          if (r.uuid === representation.uuid) {
            // update in ngl
            r.setParameters({ [key]: value });
            //update in redux
            oldRepresentation.representationParams[key] = value;
            dispatch(updateComponentRepresentation(parentKey, oldRepresentation.uuid, oldRepresentation));
          }
        }),
      250
    );

    const renderRepresentationValue = (templateItem, representationItem, key) => {
      let representationComponent = null;

      const numericType = (
        <TextField
          className={classes.itemWidth}
          type="number"
          value={
            representationItem && (representationItem !== null || isNaN(representationItem) === false)
              ? representationItem
              : ''
          }
          InputProps={{
            inputProps: {
              min: templateItem.min,
              max: templateItem.max,
              step: (templateItem.precision && templateItem.precision * templateItem.min) || 1
            }
          }}
          onKeyDown={e => e.stopPropagation()}
          onChange={e => handleRepresentationPropertyChange(key, e.target.value)}
        />
      );

      switch (templateItem.type) {
        case 'boolean':
          representationComponent = (
            <Checkbox
              checked={representationItem}
              onChange={e => handleRepresentationPropertyChange(key, e.target.checked)}
            />
          );
          break;
        case 'number':
          representationComponent = numericType;
          break;
        case 'integer':
          representationComponent = numericType;
          break;
        case 'select':
          representationComponent = (
            <Select
              native
              value={representationItem}
              className={classes.itemWidth}
              onChange={e => handleRepresentationPropertyChange(key, e.target.value)}
            >
              {Object.keys(templateItem.options).map(option => (
                <option key={option} value={option}>
                  {templateItem.options[option]}
                </option>
              ))}
            </Select>
          );
          break;
        case 'vector3':
          break;
        // this will be probably not rendered
        case 'hidden':
          break;
        case 'range':
          representationComponent = (
            <Slider
              className={classes.itemWidth}
              value={representationItem}
              onChange={(e, value) => handleRepresentationPropertyChange(key, value)}
              aria-labelledby="continuous-slider"
              valueLabelDisplay="auto"
              min={templateItem.min}
              max={templateItem.max}
              step={templateItem.step}
            />
          );
          break;
        case 'color':
          break;
      }

      if (representationComponent === null) {
        return `NaN`;
      }

      return representationComponent;
    };

    return (
      <Menu
        id="representationEditMenu"
        anchorEl={editMenuAnchor}
        open={Boolean(editMenuAnchor)}
        onClose={closeRepresentationEditMenu}
      >
        <div className={classes.menu}>
          {Object.keys(representation.representationTemplateParams).map(key => (
            <Grid container justify="space-between" direction="row" alignItems="center" key={key} spacing={1}>
              <Grid item>{key}</Grid>
              <Grid item>
                {renderRepresentationValue(
                  representation.representationTemplateParams[key],
                  representation.representationParams[key],
                  key
                )}
              </Grid>
            </Grid>
          ))}
        </div>
      </Menu>
    );
  }
);
