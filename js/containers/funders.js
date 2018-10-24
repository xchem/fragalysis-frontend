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
        var rowHeight = window.innerHeight * 0.25.toString() + "px";

        return (
            <div>
                <Grid fluid>
                    <Row>
                        <h1></h1>
                    </Row>
                    <Row>
                        <Col xs={4} md={4}>
                            <img src={require('../img/xchemLogo.png')} width="170" height="75" onClick={this.openXchem}/>
                        </Col>
                        <Col xs={4} md={4}>
                            <img src={require('../img/dlsLogo.png')} width="200" height="63" onClick={this.openDls}/>
                        </Col>
                        <Col xs={4} md={4} className="pull-right">
                            <img src={require('../img/sgcLogo.png')} width="209" height="99" onClick={this.openSgc}/>
                        </Col>
                    </Row>
                    <Row>
                        <h1></h1>
                    </Row>
                    <Row>
                        <Col xs={2} md={2}>
                        </Col>
                        <Col xs={4} md={4}>
                            <img src={require('../img/mrcLogo.png')} width="213" height="94" onClick={this.openMrc}/>
                        </Col>
                        <Col xs={4} md={4}>
                            <img src={require('../img/wtLogo.png')} width="176" height="55" onClick={this.openWt}/>
                        </Col>
                        <Col xs={2} md={2}>
                        </Col>
                    </Row>
                    <Row>
                        <h1></h1>
                    </Row>
                    <Row>
                        <Col xs={4} md={4}>
                            <img src={require('../img/inextLogo.png')} width="135" height="90"
                                 onClick={this.openInext}/>
                        </Col>
                        <Col xs={4} md={4}>
                            <img src={require('../img/jffLogo.jpg')} width="175" height="82" onClick={this.openJff}/>
                        </Col>
                        <Col xs={4} md={4} className="pull-right">
                            <img src={require('../img/nfLogo.png')} width="176" height="71" onClick={this.openNf}/>
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