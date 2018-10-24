/**
 * Created by abradley on 08/10/2018.
 */
import React from "react";
import {connect} from "react-redux";
import {Button} from "react-bootstrap";
// import { showReportDialog } from '@sentry/browser';

export class ErrorReport extends React.Component {
    constructor(props) {
        super(props);
    }

    reportError(){
        // Set a custom user error to invoke sentry
        const uuidv4 = require('uuid/v4');
        throw new Error('Custom user error.' + uuidv4());
    }

    render() {
        return <Button bsSize="sm" bsStyle="danger" onClick={this.reportError}>Report Error</Button>
    }
}

function mapStateToProps(state) {
  return {
  }
}
const mapDispatchToProps = {
}
export default connect(mapStateToProps, mapDispatchToProps)(ErrorReport);