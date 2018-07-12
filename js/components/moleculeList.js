/**
 * Created by abradley on 14/03/2018.
 */
import { ListGroupItem, ListGroup, Col, Row, Well} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as listType from './listTypes'
import * as nglLoadActions from '../actions/nglLoadActions'
import MoleculeView from './moleculeView'

const molStyle = {height: "250px",
    overflow:"scroll"}
class MoleculeList extends GenericList {

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
                    this.props.object_list.map((data) => <MoleculeView height={125} width={125} key={data.id} data={data}/>)
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
      object_list: state.apiReducers.molecule_list
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setMoleculeList,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject

}
export default connect(mapStateToProps, mapDispatchToProps)(MoleculeList);
