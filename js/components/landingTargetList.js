/**
 * Created by ricgillams on 21/06/2018.
 */
import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as listType from './listTypes';
import * as nglLoadActions from '../actions/nglLoadActions';
import * as nglObjectTypes from '../components/nglObjectTypes';

class LandingTargetList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.TARGET;
        this.render_method = this.render_method.bind(this);
        this.generateTargetObject = this.generateTargetObject.bind(this);
        this.checkForTargetChange = this.checkForTargetChange.bind(this);
        this.origTarget = -1;
    }
    render_method(data) {
        return <ListGroupItem key={data.id} >
            <label>
                <input type="radio" value={data.id} checked={this.props.targetOn == data.id} onChange={this.handleOptionChange}/>
                {data.title}
            </label>
        </ListGroupItem>
    }

    checkForTargetChange() {
        if(this.props.targetOn!=this.origTarget && this.props.targetOn!=undefined){
            var targetData;
            for(var index in this.props.targetIdList){
                var thisTarget = this.props.targetIdList[index];
                if (thisTarget.id==this.props.targetOn){
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
            this.origTarget = this.props.targetOn
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
                "proteinName": targetData.id.toString()
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
        this.props.setTargetOn(changeEvent.target.value);

    }
    render() {
        if (this.props != undefined && this.props.targetIdList) {
            return <ListGroup>
                {
                this.props.targetIdList.map((data) => (this.render_method(data)))
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
      objectsInView: state.nglReducers.objectsInView,
      targetIdList: state.apiReducers.target_id_list,
      targetOn: state.apiReducers.target_on
  }
}

const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    setTargetOn: apiActions.setTargetOn,
    setMoleculeList: apiActions.setMoleculeList,
    setTargetIdList: apiActions.setTargetIdList
}
export default connect(mapStateToProps, mapDispatchToProps)(LandingTargetList);