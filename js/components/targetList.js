/**
 * Created by abradley on 13/03/2018.
 */

import {ListGroupItem, ListGroup} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import * as nglLoadActions from "../actions/nglLoadActions";
import * as nglObjectTypes from "../components/nglObjectTypes";
import {withRouter, Link} from "react-router-dom";

class TargetList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.TARGET;
        this.render_method = this.render_method.bind(this);
        this.generateTargetObject = this.generateTargetObject.bind(this);
        this.checkForTargetChange = this.checkForTargetChange.bind(this);
        this.origTarget = -1;
    }

    render_method(data) {
        var preview = "/viewer/react/preview/target/" + data.title;
        return <ListGroupItem key={data.id} >
            <Link to={preview}>{data.title}</Link>
        </ListGroupItem>
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
            this.origTarget = this.props.object_on
        }
    }

    generateTargetObject(targetData) {
        // Now deal with this target
        var prot_to_load =  window.location.protocol + "//" + window.location.host + targetData.template_protein
        if(prot_to_load!=undefined) {
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
        if (this.props != undefined && this.props.object_list) {
            return <ListGroup>
                {
                this.props.object_list.map((data) => (this.render_method(data)))
                 }
            </ListGroup>;
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
      nglProtStyle: state.nglReducers.present.nglProtStyle
  }
}
const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    setObjectOn: apiActions.setTargetOn,
    setMoleculeList: apiActions.setMoleculeList,
    setObjectList: apiActions.setTargetIdList
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TargetList));
