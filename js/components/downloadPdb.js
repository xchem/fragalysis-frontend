/**
 * Created by ricGillams on 7/12/2018.
 */
import React from "react";
import JSZip from "jszip";
import {connect} from "react-redux";
import {Button, ButtonToolbar} from "react-bootstrap";
import fetch from "cross-fetch";
import FileSaver from "file-saver";

class DownloadPdb extends React.Component{
    constructor(props) {
        super(props);
        this.handlePdbDownload = this.handlePdbDownload.bind(this);
    }

    async handlePdbDownload() {
        var protPdbUrl = window.location.protocol + "//" + window.location.host + "/api/protpdb/?target_id=" + this.props.targetOn.toString();
        var proteinsUrl = window.location.protocol + "//" + window.location.host + "/api/proteins/?target_id=" + this.props.targetOn.toString();
        const protResponse = await fetch(proteinsUrl);
        const protJson = await protResponse.json();
        const protInfo = protJson.results;
        const pdbResponse = await fetch(protPdbUrl);
        const pdbJson = await pdbResponse.json();
        const pdbInfo = pdbJson.results;
        var zip = new JSZip();
        const timeOptions = {year:'numeric', month:'short', day:'2-digit'}
        var fName = this.props.targetOnName + "_allPdb_" + new Intl.DateTimeFormat('en-GB', timeOptions).format(Date.now()).replace(/\s/g, '-');
        var totFolder = zip.folder(fName);
        for(var structure in protInfo) {
            var pdbData = pdbInfo[structure].pdb_data;
            var pdbCode = protInfo[structure].code;
            var molGroupUrl = window.location.protocol + "//" + window.location.host + "/api/molecules/?prot_id=" + pdbInfo[0].id;
            const molResponse = await fetch(molGroupUrl);
            const molJson = await molResponse.json();
            const sdfData = molJson.results[0].sdf_info
            totFolder.file(pdbCode+".pdb",pdbData);
            totFolder.file(pdbCode+".sdf",sdfData);
        }
        const content = await zip.generateAsync({type: "blob"});
        FileSaver.saveAs(content, fName + ".zip");
    }

    render() {
        return <ButtonToolbar>
            <Button bsSize="sm" bsStyle="success" onClick={this.handlePdbDownload}>Download all PBDs for target</Button>
        </ButtonToolbar>
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