/**
 * Created by ricGillams on 7/12/2018.
 */
import React from "react";
import JSZip from "jszip";
import {connect} from "react-redux";
import {Button, ButtonToolbar} from "react-bootstrap";
import fetch from "cross-fetch";
import FileSaver from "file-saver";

class DownloadPdb extends React.Component {
    constructor(props) {
        super(props);
        this.handlePdbDownload = this.handlePdbDownload.bind(this);
    }

    async handlePdbDownload() {
        var protPdbUrl = window.location.protocol + "//" + window.location.host + "/api/protpdbbound/?target_id=" + this.props.targetOn.toString();
        var proteinsUrl = window.location.protocol + "//" + window.location.host + "/api/proteins/?target_id=" + this.props.targetOn.toString();
        const protResponse = await fetch(proteinsUrl);
        const protJson = await protResponse.json();
        const protInfo = protJson.results;
        const pdbResponse = await fetch(protPdbUrl);
        const pdbJson = await pdbResponse.json();
        const pdbInfo = pdbJson.results;
        var zip = new JSZip();
        const timeOptions = {year: 'numeric', month: 'short', day: '2-digit'};
        var fName = this.props.targetOnName + "_allPdb_" + new Intl.DateTimeFormat('en-GB', timeOptions).format(Date.now()).replace(/\s/g, '-');
        var totFolder = zip.folder(fName);
        for (var structure in protInfo) {
            var pdbData = pdbInfo[structure].bound_pdb_data;
            var pdbCode = protInfo[structure].code;
            totFolder.file(pdbCode + ".pdb", pdbData);
        }
        const content = await zip.generateAsync({type: "blob"});
        FileSaver.saveAs(content, fName + ".zip");
    }

    render() {
        if (this.props.targetOnName == undefined) {
            return <Button bsSize="sm" bsStyle="warning" onClick={this.handlePdbDownload}>loading...</Button>
        } else {
            return <Button bsSize="sm" bsStyle="warning"
                           onClick={this.handlePdbDownload}>Download {this.props.targetOnName.toString()} structures</Button>
        }
    }
}

function mapStateToProps(state) {
  return {
      targetOn: state.apiReducers.present.target_on,
      targetOnName: state.apiReducers.present.target_on_name,
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(DownloadPdb);