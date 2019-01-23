/**
 * Created by abradley on 13/03/2018.
 */

import {ListGroupItem, ListGroup, Row, Col} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import * as nglLoadActions from "../actions/nglLoadActions";
import * as nglObjectTypes from "../components/nglObjectTypes";
import fetch from "cross-fetch";
import {withRouter, Link} from "react-router-dom";

class TargetList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.TARGET;
        this.afterPush = this.afterPush.bind(this);
        this.processOpenTargets = this.processOpenTargets.bind(this);
        this.fetchOpenTargetList = this.fetchOpenTargetList.bind(this);
        this.ownTargetRenderMethod = this.ownTargetRenderMethod.bind(this);
        this.openTargetRenderMethod = this.openTargetRenderMethod.bind(this);
        this.generateTargetObject = this.generateTargetObject.bind(this);
        this.checkForTargetChange = this.checkForTargetChange.bind(this);
        this.origTarget = -1;
    }

    afterPush(data){
    }

    processOpenTargets(json){
        var results = json.target_names;
        this.afterPush(results)
        return results;
    }

    fetchOpenTargetList() {
        fetch(window.location.protocol + "//" + window.location.host+"/viewer/open_targets/", {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then(function (response) {
            return response.json();
        }).then(
            json => this.props.setOpenTargetIdList(this.processOpenTargets(json))
        )
    }

    ownTargetRenderMethod(data) {
        if (this.props.openTargetIdList.length === 0){
            this.fetchOpenTargetList();
        }
        var preview = "/viewer/react/preview/target/" + data.title;
        var sgcUrl = "https://thesgc.org/sites/default/files/XChem/"+data.title+"/html/index.html";
        var sgcUploaded = ['BRD1A', 'DCLRE1AA', 'FALZA', 'FAM83BA', 'HAO1A', 'NUDT4A', 'NUDT5A', 'NUDT7A', 'PARP14A'];
        if (this.props.openTargetIdList.includes(data.title) === false) {
            if (sgcUploaded.includes(data.title)) {
                return <ListGroupItem key={data.id}>
                    <Row>
                        <Col xs={5} sm={5} mdOffset={1} md={5} lg={6}><Row></Row><p></p><Row><p><Link to={preview}>{data.title}</Link></p></Row></Col>
                        <Col xs={7} sm={7} md={6} lg={5}><Row></Row><p></p><Row><p><a href={sgcUrl} target="new" styles={{float: 'right'}}>Model quality overview</a></p></Row></Col>
                    </Row>
                </ListGroupItem>
            } else {
                return <ListGroupItem key={data.id}>
                    <Row>
                        <Col xs={12} sm={12} mdOffset={1} md={11} lg={11}><Row></Row><p></p><Row><p><Link to={preview}>{data.title}</Link></p></Row></Col>
                    </Row>
                </ListGroupItem>
            }
        }
    }

    openTargetRenderMethod(data) {
        if (this.props.openTargetIdList == []){
            this.fetchOpenTargetList();
        }
        var preview = "/viewer/react/preview/target/" + data.title;
        var sgcUrl = "https://thesgc.org/sites/default/files/XChem/"+data.title+"/html/index.html";
        var sgcUploaded = ['BRD1A', 'DCLRE1AA', 'FALZA', 'FAM83BA', 'HAO1A', 'NUDT4A', 'NUDT5A', 'NUDT7A', 'PARP14A'];
        if (this.props.openTargetIdList.includes(data.title)){
            if (sgcUploaded.includes(data.title)) {
                return <ListGroupItem key={data.id}>
                    <Row>
                        <Col xs={5} sm={5} mdOffset={1} md={5} lg={6}><Row></Row><p></p><Row><p><Link to={preview}>{data.title}</Link></p></Row></Col>
                        <Col xs={7} sm={7} md={6} lg={5}><Row></Row><p></p><Row><p><a href={sgcUrl} target="new" styles={{float: 'right'}}>Model quality overview</a></p></Row></Col>
                    </Row>
                </ListGroupItem>
            } else {
                return <ListGroupItem key={data.id}>
                    <Row>
                        <Col xs={12} sm={12} mdOffset={1} md={11} lg={11}><Row></Row><p></p><Row><p><Link
                            to={preview}>{data.title}</Link></p></Row></Col>
                    </Row>
                </ListGroupItem>
            }
        }
    }

    checkForTargetChange() {
        if(this.props.object_on!=this.origTarget && this.props.object_on!=undefined){
            var targetData;
            for(var index in this.props.object_list){
                var thisTarget = this.props.object_list[index];
                if (thisTarget.id==this.props.object_on){
                    targetData=thisTarget;
                    break;
                }
            }
            this.props.setMoleculeList([]);
            for(var key in this.props.objectsInView){
                this.props.deleteObject(this.props.objectsInView[key]);
            }
            var targObject = this.generateTargetObject(targetData);
            if(targObject) {
                this.props.loadObject(Object.assign({}, targObject, {display_div: "summary_view"}));
                this.props.loadObject(Object.assign({}, targObject,{display_div: "major_view", name: targObject.name+"_MAIN"}));
            }
            this.origTarget = this.props.object_on;
        }
    }

    generateTargetObject(targetData) {
        // Now deal with this target
        var prot_to_load =  window.location.protocol + "//" + window.location.host + targetData.template_protein
        if(JSON.stringify(prot_to_load)!=JSON.stringify(undefined)) {
            var out_object = {
                "name": "PROTEIN_" + targetData.id.toString(),
                "prot_url": prot_to_load,
                "OBJECT_TYPE": nglObjectTypes.PROTEIN,
                "nglProtStyle": this.props.nglProtStyle
            }
            return out_object
        }
        return undefined;
    }

    componentDidMount() {
        this.loadFromServer();
        setInterval(this.loadFromServer,50);
        setInterval(this.checkForTargetChange,50)
    }

    handleOptionChange(changeEvent) {
        this.props.setObjectOn(changeEvent.target.value);
    }

    render() {
        if (this.props.render==false){
            return null;
        }
        else if (this.props != undefined && this.props.object_list) {
            return <div>
                <h3>Own Targets:</h3>
                <ListGroup>
                    {
                        this.props.object_list.map((data) => (this.ownTargetRenderMethod(data)))
                    }
                </ListGroup>
                <h3>Open Targets:</h3>
                <ListGroup>
                    {
                        this.props.object_list.map((data) => (this.openTargetRenderMethod(data)))
                    }
                </ListGroup>
            </div>
        }
        else {
            return (<FillMe />)
        }
    }
}


function mapStateToProps(state) {
  return {
      objectsInView: state.nglReducers.present.objectsInView,
      object_list: state.apiReducers.present.target_id_list,
      object_on: state.apiReducers.present.target_on,
      nglProtStyle: state.nglReducers.present.nglProtStyle,
      openTargetIdList: state.apiReducers.present.openTargetIdList
  }
}
const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    setObjectOn: apiActions.setTargetOn,
    setMoleculeList: apiActions.setMoleculeList,
    setObjectList: apiActions.setTargetIdList,
    setOpenTargetIdList: apiActions.setOpenTargetIdList,
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TargetList));
