import React from 'react';
import { Typography, Link, Grid } from '@material-ui/core';
import { getDiscourseURL } from '../../utils/discourse';

export const RegisterNotice = () => {
  return (
    <Grid container direction="row" spacing={1}>
      <Grid item>
        <Typography variant="body1">Your Discourse account doesn't exist. You can register </Typography>
      </Grid>
      <Grid item>
        <Link href={`${getDiscourseURL()}`}> here</Link>
      </Grid>
    </Grid>
  );
};
