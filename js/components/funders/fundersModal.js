/**
 * This is a modal window wrapper for funders.
 */

import React, { memo } from 'react';
import Modal from '../common/Modal';
import { Grid, makeStyles, Typography } from '@material-ui/core';

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
    maxWidth: '72%',
    maxHeight: '100%'
  },
  customModal: {
    width: '80%'
  }
}));

export const FundersModal = memo(({ openModal, onModalClose }) => {
  const classes = useStyles();
  const columnLayout = 3;

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  const openLink = link => {
    // window.location.href = link;
    window.open(link, 'blank');
  };

  // funded by
  const openXchem = () => {
    openLink('https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html');
  };
  const openDls = () => {
    openLink('https://www.diamond.ac.uk/Home.html');
  };
  const openSgc = () => {
    openLink('https://www.sgc.ox.ac.uk/');
  };
  const openInext = () => {
    openLink('http://www.inext-eu.org/');
  };
  const openJff = () => {
    openLink('https://researchsupport.admin.ox.ac.uk/funding/internal/jff');
  };
  const openNf = () => {
    openLink('https://www.newtonfund.ac.uk/');
  };
  const openMrc = () => {
    openLink('https://mrc.ukri.org/');
  };
  const openWt = () => {
    openLink('https://wellcome.ac.uk/');
  };
  const openUltradd = () => {
    openLink('https://ultra-dd.org/');
  };
  const openImi = () => {
    openLink('https://www.imi.europa.eu/');
  };
  const openHorizon = () => {
    openLink('https://ec.europa.eu/programmes/horizon2020/');
  };
  const openJanssen = () => {
    openLink('https://www.janssen.com/');
  };
  // contributors and collaborators
  const openM2ms = () => {
    openLink('https://www.en.m2ms.sk/');
  };
  const openInformatics = () => {
    openLink('https://www.informaticsmatters.com/');
  };
  const openAcellera = () => {
    openLink('https://www.acellera.com/');
  };
  const openOxrse = () => {
    openLink('https://www.rse.ox.ac.uk/');
  };
  const openMolsoft = () => {
    openLink('https://www.molsoft.com/');
  };
  const openCovidMoonshot = () => {
    openLink('https://covid.postera.ai/covid');
  };

  return (
    <Modal otherClasses={classes.customModal} open={openModal} onClose={() => onModalClose()}>
      <Typography variant="h5">Funded by:</Typography>
      <Grid container justifyContent="flex-start" alignItems="center">
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/xchemLogo.png')} className={classes.img} onClick={() => openXchem()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/dlsLogo.png')} className={classes.img} onClick={() => openDls()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/sgcLogo.png')} className={classes.img} onClick={() => openSgc()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/mrcLogo.png')} className={classes.img} onClick={() => openMrc()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/wtLogo.png')} className={classes.img} onClick={() => openWt()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/inextLogo.png')} className={classes.img} onClick={() => openInext()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/jffLogo.jpg')} className={classes.img} onClick={() => openJff()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/ultraddLogo.png')} className={classes.img} onClick={() => openUltradd()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/nfLogo.png')} className={classes.img} onClick={() => openNf()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/imiLogo.png')} className={classes.img} onClick={() => openImi()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/horizon2020Logo.jpg')} className={classes.img} onClick={() => openHorizon()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/janssenLogo.png')} className={classes.img} onClick={() => openJanssen()} />
        </Grid>
      </Grid>
      <Typography variant="h5">Contributors and collaborators:</Typography>
      <Grid container justifyContent="flex-start" alignItems="center">
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/m2msLogo.png')} className={classes.img} onClick={() => openM2ms()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img
            src={require('../../img/informaticsLogo.png')}
            className={classes.img}
            onClick={() => openInformatics()}
          />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/acelleraLogo.png')} className={classes.img} onClick={() => openAcellera()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/oxrseLogo.png')} className={classes.img} onClick={() => openOxrse()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/molsoftLogo.png')} className={classes.img} onClick={() => openMolsoft()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img src={require('../../img/janssenLogo.png')} className={classes.img} onClick={() => openJanssen()} />
        </Grid>
        <Grid item xs={columnLayout} md={columnLayout} className={classes.image}>
          <img
            src={require('../../img/covidMoonshotLogo.png')}
            className={classes.img}
            onClick={() => openCovidMoonshot()}
          />
        </Grid>
      </Grid>
    </Modal>
  );
});
