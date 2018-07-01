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
import { withRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
class HotspotList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.HOTSPOT;
        this.render_method = this.render_method.bind(this);
        this.loadHotspot = this.loadHotspot.bind(this);
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
        var reverseData = data.reverse();
        var buttonLabel = 'fragment ' + reverseData.prot_id.toString() + ' - ' + reverseData.map_type.toString() + ' hotspot';
        return <ListGroupItem key={reverseData.id} >
            <Button value={reverseData} onClick={() => this.loadHotspot(reverseData)}> {buttonLabel} </Button>
            <Button value={reverseData} onClick={() => this.removeHotspot(reverseData)}> {buttonLabel} off</Button>
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
            return null
        }
    }
}


function mapStateToProps(state) {
  return {
      objectsInView: state.nglReducers.objectsInView,
      object_list: state.apiReducers.hotspot_list,
      target_on: state.apiReducers.target_on,
      object_on: state.apiReducers.hotspot_on
  }
}
const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    setObjectOn: apiActions.setHotspotOn,
    setObjectList: apiActions.setHotspotList
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HotspotList));
