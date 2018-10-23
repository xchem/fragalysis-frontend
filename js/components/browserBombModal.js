/**
 * Created by ricgillams on 14/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button} from 'react-bootstrap';

const customStyles = {
    overlay : {
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    },
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-20%',
        transform: 'translate(-50%, -50%)',
        border: '10px solid #7a7a7a'
    }
};

export class BrowserBomb extends React.Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.checkBrowser = this.checkBrowser.bind(this);
        this.state = {
            currentBrowser: undefined,
            notSupported: undefined
        };
    }

    checkBrowser(){
        if (typeof InstallTrigger !== 'undefined'){
            this.setState(prevState => ({currentBrowser: "Firefox should be supported"}));
            this.setState(prevState => ({notSupported: false}));
        } else if (!!window.chrome && !!window.chrome.webstore){
            this.setState(prevState => ({currentBrowser: "Chrome should be supported"}))
            this.setState(prevState => ({notSupported: false}));
        } else {
            this.setState(prevState => ({currentBrowser: "This browser may not perform properly. Please consider using Firefox or Chrome."}))
            this.setState(prevState => ({notSupported: true}));
        }
    }

    closeModal(){
        this.setState(prevState => ({notSupported:undefined}));
    }

    componentWillMount() {
        ReactModal.setAppElement('body')
        this.checkBrowser()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.errorMessage != undefined){
            this.setState(prevState => ({errorMessage: nextProps.errorMessage}))
        }
    }

    render() {
        return (
            <ReactModal isOpen={this.state.notSupported} style={customStyles}>
                <div>
                    <h4>This browser is not supported by Fragalysis, please consider moving to
                    <a href="https://www.google.com/chrome/"> Google Chrome</a> or <a href="https://www.mozilla.org/en-GB/firefox/">Mozilla Firefox.</a></h4>
                    <Button bsSize="sm" bsStyle="success" onClick={this.closeModal}>Close</Button>
                </div>
            </ReactModal>
        );
    }
}

function mapStateToProps(state) {
    return {
    }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserBomb);
