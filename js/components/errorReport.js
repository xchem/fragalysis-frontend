/**
 * Created by abradley on 08/10/2018.
 */
import React from "react";
import {connect} from "react-redux";
import {Button} from "react-bootstrap";
import { showReportDialog } from '@sentry/browser';


export class ErrorReport extends React.Component {
    constructor(props) {
        super(props);
    }

    reportError(){
        // Set the custom event ids to -1
        throw new Error('Custom user error');
        showReportDialog({
            title:	"It looks like we’re having issues.",
            subtitle:	"Our team has been notified.",
            subtitle2:	"If you’d like to help, tell us what happened below. – not visible on small screen resolutions",
            labelName:	"Name",
            labelEmail:	"Email",
            labelComments:	"What happened?",
            labelClose:	"Close",
            labelSubmit: "Submit",
            errorGeneric:	"An unknown error occurred while submitting your report. Please try again.",
            errorFormEntry:	"Some fields were invalid. Please correct the errors and try again.",
            successMessage:	"Your feedback has been sent. Thank you!",
        })
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