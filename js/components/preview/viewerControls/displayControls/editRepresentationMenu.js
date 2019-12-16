import React, { Fragment, memo, useContext, useState } from 'react';
import { Menu, MenuItem, Grid, makeStyles, Checkbox, TextField } from '@material-ui/core';
import { NglContext } from '../../../nglView/nglProvider';
import { useDispatch, useSelector } from 'react-redux';
import { updateComponentRepresentation } from '../../../../reducers/ngl/nglActions';

const useStyles = makeStyles(theme => ({
  menu: {
    width: 'content-fit'
  },
  gridItem: {
    padding: theme.spacing(1)
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

    const handleRepresentationPropertyChange = (key, value) => {
      comp.eachRepresentation(r => {
        if (r.uuid === representation.uuid) {
          // update in ngl
          console.log({ [key]: value });
          r.setParameters({ [key]: value });
          //update in redux
          representation.representationParams[key] = value;
          dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation));
        }
      });
    };

    const renderRepresentationValue = (templateItem, representationItem, key) => {
      let representationComponent = null;

      const numericType = (
        <TextField
          type="number"
          value={`${representationItem}`}
          InputProps={{
            inputProps: { min: templateItem.min, max: templateItem.max, step: templateItem.precision }
          }}
          onKeyDown={e => e.stopPropagation()}
          onChange={e => handleRepresentationPropertyChange(key, Number(e.target.value))}
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
          break;
        case 'vector3':
          break;
        // this will be probably not rendered
        case 'hidden':
          break;
        // slider!!!!!
        case 'range':
          break;
        case 'color':
          break;
      }

      if (representationComponent === null) {
        return `not defined, ${key}`;
      }

      return (
        <Fragment>
          <Grid item>{key}</Grid>
          <Grid item>{representationComponent}</Grid>
        </Fragment>
      );
    };

    return (
      <Menu
        id="representationEditMenu"
        anchorEl={editMenuAnchor}
        //   keepMounted
        open={Boolean(editMenuAnchor)}
        onClose={closeRepresentationEditMenu}
        className={classes.menu}
      >
        {Object.keys(representation.representationTemplateParams).map(key => (
          <Grid
            container
            justify="space-between"
            className={classes.gridItem}
            direction="row"
            alignItems="center"
            key={key}
          >
            {renderRepresentationValue(
              representation.representationTemplateParams[key],
              representation.representationParams[key],
              key
            )}
          </Grid>
        ))}
      </Menu>
    );
  }
);
