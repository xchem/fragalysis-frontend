/**
 * Created by ricgillams on 26/06/2018.
 */
import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
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
        this.list_type = listType.HOTSPOT_MAP;
        this.render_method = this.render_method.bind(this);
        this.generateHotspotObject = this.generateHotspotObject.bind(this);
    }

    render_method(data) {
        return <ListGroupItem key={data.id} >
           {data.id}
        </ListGroupItem>
    }

    generateHotspotObject(targetData) {
        // Now deal with this target
        var out_object = {
                "name": "HOTSPOT_" + targetData.id.toString(),
                "hotUrl": targetData.map_info,
                "OBJECT_TYPE": nglObjectTypes.HOTSPOT
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
            return (<FillMe />)
        }
    }
}


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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HotspotList));
