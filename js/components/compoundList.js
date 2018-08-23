/**
 * Created by abradley on 15/03/2018.
 */
import { ListGroupItem, ListGroup, Col, Row} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import CompoundView from './compoundView';

const molStyle = {height: "400px",
    overflow:"scroll"}

class CompoundList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var totArray = []
        for(var key in this.props.moleculeList){
            var retArray = [];
            for (var ele in this.props.moleculeList[key]){
                var input_data = {}
                input_data.smiles=this.props.moleculeList[key][ele]
                input_data.vector=key.split("_")[0]
                input_data.mol=this.props.thisMol
                retArray.push(<CompoundView height={100} width={100} key={ele+"__"+key} data={input_data}/>)
            }
            totArray.push(<Row style={molStyle} key={key}>{retArray}</Row>)
        }
        return totArray;
    }
}
function mapStateToProps(state) {
  return {
      moleculeList: state.selectionReducers.present.this_vector_list,
      thisMol: state.selectionReducers.present.to_query
  }
}
const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(CompoundList);
