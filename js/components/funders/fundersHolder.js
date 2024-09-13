/**
 * Created by ricgillams on 23/10/2018.
 */
import React, { PureComponent } from 'react';
import { Grid } from '@material-ui/core';

class FundersHolder extends PureComponent {
  constructor(props) {
    super(props);
    this.openXchem = this.openXchem.bind(this);
    this.openDls = this.openDls.bind(this);
    this.openSgc = this.openSgc.bind(this);
    this.openInext = this.openInext.bind(this);
    this.openJff = this.openJff.bind(this);
    this.openNf = this.openNf.bind(this);
  }

  openXchem() {
    window.location.href = 'https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html';
  }
  openDls() {
    window.location.href = 'https://www.diamond.ac.uk/Home.html';
  }
  openSgc() {
    window.location.href = 'https://www.sgc.ox.ac.uk/';
  }
  openInext() {
    window.location.href = 'http://www.inext-eu.org/';
  }
  openJff() {
    window.location.href = 'https://researchsupport.admin.ox.ac.uk/funding/internal/jff';
  }
  openNf() {
    window.location.href = 'https://www.newtonfund.ac.uk/';
  }
  openMrc() {
    window.location.href = 'https://mrc.ukri.org/';
  }
  openWt() {
    window.location.href = 'https://wellcome.ac.uk/';
  }

  render() {
    var logoWidth = window.innerWidth * (0.16).toString();
    return (
      <Grid container>
        <Grid item xs={4} md={4}>
          <div className="text-center">
            <img src={require('../../img/logos/xchemLogo.png')} width={logoWidth} onClick={this.openXchem} />
          </div>
        </Grid>
        <Grid item xs={4} md={4}>
          <div className="text-center">
            <img src={require('../../img/logos/dlsLogo.png')} width={logoWidth} onClick={this.openDls} />
          </div>
        </Grid>
        <Grid item xs={4} md={4}>
          <div className="text-center">
            <img src={require('../../img/logos/sgcLogo.png')} width={logoWidth} onClick={this.openSgc} />
          </div>
        </Grid>
        <Grid item xs={4} md={4}>
          <div className="text-center">
            <img src={require('../../img/logos/mrcLogo.png')} width={logoWidth} onClick={this.openMrc} />
          </div>
        </Grid>
        <Grid item xs={4} md={4}>
          <div className="text-center">
            <img src={require('../../img/logos/wtLogo.png')} width={logoWidth} onClick={this.openWt} />
          </div>
        </Grid>
        <Grid item xs={4} md={4}>
          <div className="text-center">
            <img src={require('../../img/logos/inextLogo.png')} width={logoWidth} onClick={this.openInext} />
          </div>
        </Grid>
        <Grid item xs={4} md={4}>
          <div className="text-center">
            <img src={require('../../img/logos/jffLogo.jpg')} width={logoWidth} onClick={this.openJff} />
          </div>
        </Grid>
        <Grid item xs={4} md={4}>
          <div className="text-center">
            <img src={require('../../img/logos/nfLogo.png')} width={logoWidth} onClick={this.openNf} />
          </div>
        </Grid>
      </Grid>
    );
  }
}

export default FundersHolder;
