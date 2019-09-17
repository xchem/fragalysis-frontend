import React from 'react';
import { Grid, Button, makeStyles } from '@material-ui/core';
import classNames from 'classnames';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
    height: '100%',
    color: 'black',
    backgroundColor: 'white'
  },
  gridItemTitle: {
      height: '40px',
      width: 'calc(100% + 4px)',
      marginLeft: '-2px',
      marginTop: '-2px',
      backgroundColor: '#F4F4F4',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      fontSize: '16px'
  },
  button: {
    minWidth: 'unset'
  },
  border: {
      border: 'solid 2px #DEDEDE',
      borderRadius: '8px'
  }
}));

export default (props) => {
  const classes = useStyles();
  const { title, titleButtonData, children } = props;

  return (
    <Grid container direction="column" className={classNames(classes.container, classes.border)}>
      <Grid item container justify="space-between" className={classNames(classes.gridItemTitle, classes.border)}>
        <Grid item>
          {title}
        </Grid>
        <Grid item>
          {
            titleButtonData &&
            <Button onClick={titleButtonData.onClick} className={classes.button}>{titleButtonData.content}</Button>
          }
        </Grid>
      </Grid>
      <Grid item container>
        {children}
      </Grid>
    </Grid>
  )
}
