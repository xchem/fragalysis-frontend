/**
 * Created by abradley on 13/03/2018.
 */
import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as listType from './listTypes'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from '../components/nglObjectTypes'

class TargetList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.TARGET;
        this.getViewUrl = this.getViewUrl.bind(this);
        this.render_method = this.render_method.bind(this);
        this.generateTargetObject = this.generateTargetObject.bind(this);
        this.checkForTargetChange = this.checkForTargetChange.bind(this);
        this.origTarget = -1;
    }
    render_method(data) {
        return <ListGroupItem key={data.id} >
            <label>
                <input type="radio" value={data.id} checked={this.props.object_on == data.id} onChange={this.handleOptionChange}/>
                {data.title}
            </label>
        </ListGroupItem>
    }

    checkForTargetChange(){
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

    getViewUrl(pk,get_view){
        var base_url = window.location.protocol + "//" + window.location.host
        base_url += "/viewer/"+get_view+"/"+pk.toString()+"/"
        return base_url
    }

    generateTargetObject(targetData){
        // Now deal with this target
        var prot_to_load = targetData.protein_set[0]
        if(prot_to_load!=undefined) {
            var out_object = {
                "name": "PROTEIN_" + prot_to_load.toString(),
                "prot_url": this.getViewUrl(prot_to_load, "prot_from_pk"),
                "OBJECT_TYPE": nglObjectTypes.PROTEIN
            }
            return out_object
        }
        return undefined;
    }

    componentDidMount(){
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
};


function mapStateToProps(state) {
  return {
      objectsInView: state.nglReducers.objectsInView,
      object_list: state.apiReducers.target_id_list,
      object_on: state.apiReducers.target_on
  }
}
const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    setObjectOn: apiActions.setTargetOn,
    setMoleculeList: apiActions.setMoleculeList,
    setObjectList: apiActions.setTargetIdList
}
export default connect(mapStateToProps, mapDispatchToProps)(TargetList)
