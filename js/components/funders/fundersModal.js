/**
 * This is a modal window wrapper for funders.
 */

import React, { memo } from 'react';
import Modal from '../common/Modal';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  image: {
    paddingTop: '3px',
    paddingBottom: '3px'
  },
  // https://material-ui.com/components/grid/
  img: {
    cursor: 'pointer',
    margin: 'auto',
    display: 'block',
    maxWidth: '95%',
    maxHeight: '100%'
  }
}));

export const FundersModal = memo(({ openModal, onModalClose }) => {
  const classes = useStyles();

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  const openXchem = () => {
    // window.location.href = 'https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html';
    window.open('https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html', 'blank');
  };
  const openDls = () => {
    // window.location.href = 'https://www.diamond.ac.uk/Home.html';
    window.open('https://www.diamond.ac.uk/Home.html', 'blank');
  };
  const openSgc = () => {
    // window.location.href = 'https://www.sgc.ox.ac.uk/';
    window.open('https://www.sgc.ox.ac.uk/', 'blank');
  };
  const openInext = () => {
    // window.location.href = 'http://www.inext-eu.org/';
    window.open('http://www.inext-eu.org/', 'blank');
  };
  const openJff = () => {
    // window.location.href = 'https://researchsupport.admin.ox.ac.uk/funding/internal/jff';
    window.open('https://researchsupport.admin.ox.ac.uk/funding/internal/jff', 'blank');
  };
  const openNf = () => {
    // window.location.href = 'https://www.newtonfund.ac.uk/';
    window.open('https://www.newtonfund.ac.uk/', 'blank');
  };
  const openMrc = () => {
    // window.location.href = 'https://mrc.ukri.org/';
    window.open('https://mrc.ukri.org/', 'blank');
  };
  const openWt = () => {
    // window.location.href = 'https://wellcome.ac.uk/';
    window.open('https://wellcome.ac.uk/', 'blank');
  };
  const openUltradd = () => {
    // window.location.href = 'https://ultra-dd.org/';
    window.open('https://ultra-dd.org/', 'blank');
  };
  const openImi = () => {
    // window.location.href = 'https://www.imi.europa.eu/';
    window.open('https://www.imi.europa.eu/', 'blank');
  };
  const openHorizon = () => {
    // window.location.href = 'https://ec.europa.eu/programmes/horizon2020/';
    window.open('https://ec.europa.eu/programmes/horizon2020/', 'blank');
  };

  return (
    <Modal open={openModal} onClose={() => onModalClose()}>
      <Grid container justify="center" alignItems="center">
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/xchemLogo.png')} className={classes.img} onClick={() => openXchem()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/dlsLogo.png')} className={classes.img} onClick={() => openDls()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/sgcLogo.png')} className={classes.img} onClick={() => openSgc()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/mrcLogo.png')} className={classes.img} onClick={() => openMrc()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/wtLogo.png')} className={classes.img} onClick={() => openWt()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/inextLogo.png')} className={classes.img} onClick={() => openInext()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/jffLogo.jpg')} className={classes.img} onClick={() => openJff()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/nfLogo.png')} className={classes.img} onClick={() => openNf()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/ultraddLogo.png')} className={classes.img} onClick={() => openUltradd()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/imiLogo.png')} className={classes.img} onClick={() => openImi()} />
        </Grid>
        <Grid item xs={4} md={4} className={classes.image}>
          <img src={require('../../img/horizon2020Logo.jpg')} className={classes.img} onClick={() => openHorizon()} />
        </Grid>
      </Grid>
    </Modal>
  );
});
