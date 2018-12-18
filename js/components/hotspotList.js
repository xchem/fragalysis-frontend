/**
 * Created by ricgillams on 04/07/2018.
 */
import {Row, Well} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import HotspotView from "./hotspotView";

const molStyle = {height: "250px",
    overflow:"scroll"}
class HotspotList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLECULE;
        this.hsCount = undefined;
        this.updateCount = this.updateCount.bind(this);
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }


     async updateCount(props){
        if(props.object_list != undefined && props.object_list.length>0){
        var response = await fetch("/api/hotspots/?map_type=DO&prot_id=" + props.object_list[0].prot_id.toString(), {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        var myJson = await response.json();
        this.setState(prevState => ({hsCount: myJson.length}));
        }
    }

    componentWillReceiveProps(nextProps){
        this.updateCount(nextProps);
    }


    componentDidMount(){
        this.updateCount(this.props);
    }


    render() {
        if (this.props.hsCount > 0) {
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
      object_list: state.apiReducers.present.molecule_list
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setMoleculeList,
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotList);
