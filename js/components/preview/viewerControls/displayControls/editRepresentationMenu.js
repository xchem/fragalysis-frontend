import React, { memo, useContext } from 'react';
import { Menu, MenuItem, Grid, makeStyles } from '@material-ui/core';
import { NglContext } from '../../../nglView/nglProvider';
import { useDispatch, useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
  menu: {
    width: 'content-fit'
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

    // console.log(r.setParameters({ opacity: 0.5 }));

    const handleRepresentationPropertyChange = e => {};

    return (
      <Menu
        id="representationEditMenu"
        anchorEl={editMenuAnchor}
        keepMounted
        open={Boolean(editMenuAnchor)}
        onClose={closeRepresentationEditMenu}
        className={classes.menu}
      >
        {Object.keys(representation.representationTemplateParams).map(template => (
          <MenuItem onClick={handleRepresentationPropertyChange} key={template}>
            <Grid container justify="space-between" spacing={1} direction="row">
              <Grid item>{template}</Grid>
              <Grid item>{representation.representationTemplateParams[template].type}</Grid>
            </Grid>
          </MenuItem>
        ))}
      </Menu>
    );
  }
);
