/**
 * Created by ricgillams on 23/10/2018.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col, Grid} from "react-bootstrap";

class Funders extends Component {

    constructor(props) {
        super(props)
        this.openXchem = this.openXchem.bind(this);
        this.openDls = this.openDls.bind(this);
        this.openSgc = this.openSgc.bind(this);
        this.openInext = this.openInext.bind(this);
        this.openJff = this.openJff.bind(this);
        this.openNf = this.openNf.bind(this);
    }

    openXchem() {window.location.href = 'https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html'}
    openDls() {window.location.href = 'https://www.diamond.ac.uk/Home.html'}
    openSgc() {window.location.href = 'https://www.sgc.ox.ac.uk/'}
    openInext() {window.location.href = 'http://www.inext-eu.org/'}
    openJff() {window.location.href = 'https://researchsupport.admin.ox.ac.uk/funding/internal/jff'}
    openNf() {window.location.href = 'https://www.newtonfund.ac.uk/'}
    openMrc() {window.location.href = 'https://mrc.ukri.org/'}
    openWt() {window.location.href = 'https://wellcome.ac.uk/'}

    render() {
        var rowHeight = window.innerHeight * 0.28.toString() + "px";
        var padHeight = window.innerHeight * 0.1.toString() + "px";
        var logoWidth = window.innerWidth * 0.16.toString();
        return (
            <div>
                <Grid fluid>
                    <Row style={{height: padHeight}}>
                    </Row>
                    <Row style={{height: rowHeight}}>
                        <Col xs={4} md={4}>
                            <div className="text-center">
                                <img src={require('../img/xchemLogo.png')} width={logoWidth} onClick={this.openXchem}/>
                            </div>
                        </Col>
                        <Col xs={4} md={4}>
                            <div className="text-center">
                                <img src={require('../img/dlsLogo.png')} width={logoWidth} onClick={this.openDls}/>
                            </div>
                        </Col>
                        <Col xs={4} md={4}>
                            <div className="text-center">
                                <img src={require('../img/sgcLogo.png')} width={logoWidth} onClick={this.openSgc}/>
                            </div>
                        </Col>
                    </Row>
                    <Row style={{height: rowHeight}}>
                        <Col xs={2} md={2}>
                        </Col>
                        <Col xs={4} md={4}>
                            <div className="text-center">
                                <img src={require('../img/mrcLogo.png')} width={logoWidth} onClick={this.openMrc}/>
                            </div>
                        </Col>
                        <Col xs={4} md={4}>
                            <div className="text-center">
                                <img src={require('../img/wtLogo.png')} width={logoWidth} onClick={this.openWt}/>
                            </div>
                        </Col>
                        <Col xs={2} md={2}>
                        </Col>
                    </Row>
                    <Row style={{height: rowHeight}}>
                        <Col xs={4} md={4}>
                            <div className="text-center">
                                <img src={require('../img/inextLogo.png')} width={logoWidth} onClick={this.openInext}/>
                            </div>
                        </Col>
                        <Col xs={4} md={4}>
                            <div className="text-center">
                                <img src={require('../img/jffLogo.jpg')} width={logoWidth} onClick={this.openJff}/>
                            </div>
                        </Col>
                        <Col xs={4} md={4}>
                            <div className="text-center">
                                <img src={require('../img/nfLogo.png')} width={logoWidth} onClick={this.openNf}/>
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </div>
        )
    }
}

function mapStateToProps(state) {
  return { }
}

export default connect(mapStateToProps)(Funders)