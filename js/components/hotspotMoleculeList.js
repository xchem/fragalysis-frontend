/**
 * Created by ricgillams on 04/07/2018.
 */
import { ListGroupItem, ListGroup, Col, Row, Well, Button} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as listType from './listTypes'
import * as nglLoadActions from '../actions/nglLoadActions'
import HotspotMoleculeView from './hotspotMoleculeView'

const molStyle = {height: "250px",
    overflow:"scroll"}
class HotspotMoleculeList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLECULE;
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
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



    render() {
        if (this.props != undefined && this.props.object_list) {
            console.log(this.props.message)
            return <Well><Row style={molStyle}>
                {
                    this.props.object_list.map((data) => <HotspotMoleculeView height={125} width={250} key={data.id} data={data}/>)
                    // this.render_method(data)
                }
            </Row></Well>;
        }
        else {
            return null;
        }
    }

}
function mapStateToProps(state) {
  return {
      group_type: state.apiReducers.group_type,
      target_on: state.apiReducers.target_on,
      mol_group_on: state.apiReducers.mol_group_on,
      object_list: state.apiReducers.hotspot_list
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setMoleculeList,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject

}
export default connect(mapStateToProps, mapDispatchToProps)(HotspotMoleculeList);
