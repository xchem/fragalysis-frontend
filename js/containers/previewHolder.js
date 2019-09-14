/**
 * Created by abradley on 14/04/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import { Grid, withStyles } from "@material-ui/core";
import NGLView from "../components/nglComponents";
import MolGroupList from "../components/molGroupList";
import MoleculeList from "../components/moleculeList";
import MolGroupSlider from "../components/molGroupSlider";
import SummaryView from "../components/summaryView";
import CompoundList from '../components/compoundList';
import NglViewerControls from "../components/nglViewerControls";
import HotspotList from "../components/hotspotList";
import ModalStateSave from "../components/modalStateSave";
import ModalErrorMessage from "../components/modalErrorDisplay";
import ModalTargetUnrecognised from "../components/modalTargetUnrecognised";
import * as apiActions from "../actions/apiActions";
import fetch from "cross-fetch";
import {withRouter} from "react-router-dom";
import {BrowserBomb} from "../components/browserBombModal";

const styles = () => ({
    gridItemLhs: {
        width: '500px'
    },
    gridItemRhs: {
        paddingLeft: '8px',
        width: 'calc(100% - 500px)'
    }
})

class Preview extends Component {

    constructor(props) {
        super(props)
        this.updateTarget = this.updateTarget.bind(this);
        this.deployErrorModal = this.deployErrorModal.bind(this);
    }

    deployErrorModal(error) {
        this.props.setErrorMessage(error);
    }

    updateTarget(){
        var target = this.props.match.params.target;
        // Get from the REST API
        if (this.props.targetIdList.length != 0) {
            var targetUnrecognised = true;
            for (var i in this.props.targetIdList) {
                if (target == this.props.targetIdList[i].title) {
                    targetUnrecognised = false;
                }
            }
        }
        this.props.setTargetUnrecognised(targetUnrecognised);
        fetch(window.location.protocol + "//" + window.location.host+"/api/targets/?title="+target)
            .then(response => response.json())
            .then(json => this.props.setTargetOn(json["results"][0].id))
            .catch((error) => {
                    this.deployErrorModal(error);
                })
    }

    componentDidMount() {
        this.updateTarget()
    }

    componentDidUpdate(){
        this.updateTarget()
    }

    render() {
        const { classes } = this.props;
        var screenHeight= window.innerHeight*0.7.toString()+"px"
        var molListHeight= window.innerHeight*0.45.toString()+"px"
        return (
            <Grid container>
                <Grid item>
                    <MolGroupList />
                </Grid>
                <Grid item className={classes.gridItemLhs}>
                    <NGLView div_id="summary_view" height="200px" />
                    <MolGroupSlider />
                    <MoleculeList height={molListHeight} />
                </Grid>
                <Grid item container direction="column" className={classes.gridItemRhs}>
                    <Grid item>
                        <NGLView div_id="major_view" height={screenHeight} />
                        <NglViewerControls />
                    </Grid>
                    <Grid item>
                        <SummaryView />
                        <CompoundList />
                        <HotspotList />
                    </Grid>
                </Grid>
                 <ModalStateSave/>
                 <ModalErrorMessage/>
                 <ModalTargetUnrecognised/>
                 <BrowserBomb/>
            </Grid>
        )
    }
}

function mapStateToProps(state) {
  return {
      targetIdList: state.apiReducers.present.target_id_list,
  }
}
const mapDispatchToProps = {
    setTargetOn: apiActions.setTargetOn,
    setTargetUnrecognised: apiActions.setTargetUnrecognised,
    setErrorMessage: apiActions.setErrorMessage,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Preview)))
