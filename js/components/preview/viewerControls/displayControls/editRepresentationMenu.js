import React, { memo, useContext, Fragment } from 'react';
import { Menu, Popover, Slider, Grid, makeStyles, Checkbox, TextField, Select, Box } from '@material-ui/core';
import { NglContext } from '../../../nglView/nglProvider';
import { useDispatch, useSelector } from 'react-redux';
import { updateComponentRepresentation } from '../../../../reducers/ngl/actions';
import { throttle } from 'lodash';
import { PhotoshopPicker } from 'react-color';

const useStyles = makeStyles(theme => ({
  menu: {
    minWidth: 332,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  itemWidth: {
    width: 180
  },
  checkbox: {
    margin: theme.spacing(-1)
  }
}));

export const EditRepresentationMenu = memo(
  ({ editMenuAnchor, closeRepresentationEditMenu, representation, parentKey }) => {
    const classes = useStyles();
    const { getNglView } = useContext(NglContext);
    const objectsInView = useSelector(state => state.nglReducers.objectsInView) || {};
    const [colorMenus, setColorMenus] = React.useState({});

    const dispatch = useDispatch();
    const oldRepresentation = JSON.parse(JSON.stringify(representation));
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;

    const closeColorMenu = menuKey => setColorMenus({ ...colorMenus, [menuKey]: null });

    const openColorMenu = (menuKey, anchorEl, previousColor) =>
      setColorMenus({ ...colorMenus, [menuKey]: { menu: anchorEl, previousColor } });

    const handleRepresentationPropertyChange = throttle((key, value) => {
      const r = comp.reprList.find(rep => rep.uuid === representation.uuid || rep.uuid === representation.lastKnownID);
      if (r) {
        let oldValue = oldRepresentation.params[key];
        let change = { key, value, oldValue };

        // update in ngl
        r.setParameters({ [key]: value });
        //update in redux
        oldRepresentation.params[key] = value;

        dispatch(updateComponentRepresentation(parentKey, oldRepresentation.uuid, oldRepresentation, change));
      }
    }, 250);

    const renderRepresentationValue = (templateItem, representationItem, key) => {
      let representationComponent = null;

      const numericType = (
        <TextField
          className={classes.itemWidth}
          type="number"
          value={representationItem && isNaN(representationItem) === false ? representationItem : ''}
          InputProps={
            templateItem && {
              inputProps: {
                min: templateItem.min,
                max: templateItem.max,
                step: (templateItem.precision && templateItem.precision * templateItem.min) || 1
              }
            }
          }
          onKeyDown={e => e.stopPropagation()}
          onChange={e => handleRepresentationPropertyChange(key, e.target.value)}
        />
      );

      switch ((templateItem && templateItem.type) || undefined) {
        case 'boolean':
          representationComponent = (
            <Checkbox
              className={classes.checkbox}
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
          representationComponent = (
            <Grid container direction="row" justify="space-between" className={classes.itemWidth}>
              {['x', 'y', 'z'].map(axis => (
                <Grid item xs={4} key={axis}>
                  <TextField
                    label={`${axis}:`}
                    type="number"
                    value={
                      representationItem[axis] && isNaN(representationItem[axis]) === false
                        ? representationItem[axis]
                        : ''
                    }
                    onKeyDown={e => e.stopPropagation()}
                    onChange={e => {
                      handleRepresentationPropertyChange(key, { ...representationItem, [axis]: e.target.value });
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          );
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
          const color = `#${representationItem.toString(16)}` || `#000`;
          representationComponent = (
            <Fragment>
              <Box
                border="1px solid black"
                bgcolor={color}
                width={24}
                height={24}
                spacing={1}
                onClick={e => openColorMenu(key, e.currentTarget, color)}
              />
              <Popover
                id={`color-menu-${key}`}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                anchorEl={(colorMenus[key] && colorMenus[key].menu) || null}
                open={(colorMenus[key] && Boolean(colorMenus[key].menu)) || false}
                onClose={() => closeColorMenu(key)}
              >
                <PhotoshopPicker
                  header={key}
                  color={color}
                  onChangeComplete={c => {
                    handleRepresentationPropertyChange(key, parseInt(c.hex.replace(/^#/, ''), 16));
                  }}
                  onCancel={() => {
                    handleRepresentationPropertyChange(
                      key,
                      parseInt(colorMenus[key].previousColor.replace(/^#/, ''), 16)
                    );
                    closeColorMenu(key);
                  }}
                  onAccept={() => {
                    closeColorMenu(key);
                  }}
                />
              </Popover>
            </Fragment>
          );

          break;
      }

      if (representationComponent === null) {
        return null;
      }

      return (
        <Grid container justify="space-between" direction="row" alignItems="center" key={key} spacing={1}>
          <Grid item>{key}</Grid>
          <Grid item>{representationComponent}</Grid>
        </Grid>
      );
    };

    return (
      <Menu
        id="representationEditMenu"
        anchorEl={editMenuAnchor}
        open={Boolean(editMenuAnchor)}
        onClose={closeRepresentationEditMenu}
      >
        <div className={classes.menu}>
          {Object.keys(representation.templateParams).map(key =>
            renderRepresentationValue(representation.templateParams[key], representation.params[key], key)
          )}
        </div>
      </Menu>
    );
  }
);
