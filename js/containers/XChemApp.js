/**
 * Created by abradley on 07/03/2018.
 */
import {Row, Col} from 'react-bootstrap';
import Tindspect from '../components/overallComponents';
import React, { Component } from 'react'


export default class XChemApp extends Component {

    // Here we can launch different apps - with the same store - without reloading the page
    render() {
            return <Tindspect />
    }
}