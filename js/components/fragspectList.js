/**
 * Created by ricgillams on 04/02/2019.
 */
import {Row, Well} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import FragspectView from "./hotspotView";

const molStyle = {height: "250px",
    overflow:"scroll"}
class FragspectList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLECULE;
        this.updateCount = this.updateCount.bind(this);
        this.state = {
            fsCount: undefined,
            confidenceState: ["low", "medium", "high"],
            depositionStatus: [1, 2, 3, 4, 5]
        };
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }

     async updateCount(props){
        if(props.object_list != undefined && props.object_list.length>0){
        var response = await fetch("/api/hotspots/?map_type=DO&target_id=5", {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        var myJson = await response.json();
        this.setState(prevState => ({fsCount: myJson.count}));
        }
    }

    componentWillReceiveProps(nextProps){
        this.updateCount(nextProps);
    }

    componentDidMount(){
        this.updateCount(this.props);
    }

    render() {
        if (this.state.fsCount > 0) {
            return <Well><Row style={molStyle}>
                {
                    this.props.object_list.map((data) => <FragspectView key={data.id} data={data}/>)
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
      object_list: state.apiReducers.present.molecule_list
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setMoleculeList,
}

export default connect(mapStateToProps, mapDispatchToProps)(FragspectList);
