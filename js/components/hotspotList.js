/**
 * Created by ricgillams on 04/07/2018.
 */
import { ListGroupItem, ListGroup, Col, Row, Well} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as listType from './listTypes'
import HotspotView from './hotspotView'

const molStyle = {height: "250px",
    overflow:"scroll"}
class HotspotList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLECULE;
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }

    render() {
        if (this.props != undefined && this.props.object_list) {
            console.log(this.props.message)
            return <Well><Row style={molStyle}>
                {
                    this.props.object_list.map((data) => <HotspotView key={data.id} data={data}/>)
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
      object_list: state.apiReducers.molecule_list
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setMoleculeList,
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotList);
