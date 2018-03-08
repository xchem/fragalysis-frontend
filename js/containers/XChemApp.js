/**
 * Created by abradley on 07/03/2018.
 */
import {Row, Col} from 'react-bootstrap';
import Tindspect from '../components/overallComponents';
import React, { Component } from 'react'


export default class XChemApp extends Component {

    render() {
            return <div>
                <Row>
                    <Header/>
                </Row>
                <Row>
                    <Col xs={12} md={12}>
                        <Tindspect/>
                    </Col>
                </Row>
            </div>
    }
}

class Header extends Component {

    render() {
            return <div>HEADER</div>
    }
}