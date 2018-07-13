/**
 * Created by ricgillams on 26/06/2018.
 */
import { ListGroupItem, ListGroup, Col, Button} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as listType from './listTypes';
import * as nglLoadActions from '../actions/nglLoadActions';
import * as nglObjectTypes from '../components/nglObjectTypes';
import { withRouter, Link } from 'react-router-dom';
const hotStyle = {height: "500px", overflow:"scroll"}

class HotspotButtonList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.HOTSPOT;
        this.render_method = this.render_method.bind(this);
        this.loadHotspot = this.loadHotspot.bind(this);
        this.removeHotspot = this.removeHotspot.bind(this);
        this.generateHotspotObject = this.generateHotspotObject.bind(this);
    }

    loadHotspot(data){
        var nglObject = this.generateHotspotObject(data);
        this.props.loadObject(nglObject);
    }

    removeHotspot(data){
        var nglObject = this.generateHotspotObject(data);
        this.props.deleteObject(nglObject);
    }

    render_method(data) {
        // const doData = data.filter(word => word.map_type.toString() === 'DO');
        var buttonLabel = 'fragment ' + data.prot_id.toString() + ' - ' + data.map_type.toString() + ' hotspot'
        return <ListGroupItem key={data.id} >
            <Button value={data} onClick={() => this.loadHotspot(data)}> {buttonLabel} </Button>
            <Button value={data} onClick={() => this.removeHotspot(data)}> {buttonLabel} off</Button>
        </ListGroupItem>
    }

    generateHotspotObject(targetData) {
        var out_object = {
            "name": "HOTSPOT_" + targetData.id.toString(),
            // "hotUrl": targetData.map_info.replace('http:', 'https:'),
            "hotUrl": targetData.map_info,
            "display_div": "major_view",
            "OBJECT_TYPE": nglObjectTypes.HOTSPOT,
            "map_type": targetData.map_type.toString(),
            "fragment" : targetData.prot_id.toString()
            }
            return out_object
    }

    componentDidMount() {
        this.loadFromServer();
        setInterval(this.loadFromServer,50);
    }

    handleOptionChange(changeEvent) {
        this.props.setHotspotOn(changeEvent.target.value);
    }

    render() {
        if (this.props != undefined && this.props.hotspotList) {
            return <ListGroup>
                {
                this.props.hotspotList.map((data) => (this.render_method(data)))
                }
            </ListGroup>;
        } else {
            return null
        }
    }
}

function mapStateToProps(state) {
    return {
        group_type: state.apiReducers.group_type,
        mol_group_on: state.apiReducers.mol_group_on,
        molecule_list: state.apiReducers.molecule_list,
        objectsInView: state.nglReducers.objectsInView,
        hotspotList: state.apiReducers.hotspot_list,
        target_on: state.apiReducers.target_on,
        object_on: state.apiReducers.hotspot_on
    }
}
const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    setHotspotOn: apiActions.setHotspotOn,
    setObjectList: apiActions.setHotspotList,
    setMoleculeList: apiActions.setMoleculeList,

}
export default connect(mapStateToProps, mapDispatchToProps)(HotspotButtonList);
