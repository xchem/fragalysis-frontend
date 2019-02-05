/**
 * Created by ricgillams on 04/02/2019.
 */
import {Row, Well} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import FragspectView from "./fragspectView";

class FragspectList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLECULE;
        // this.updateCount = this.updateCount.bind(this);
        this.state = {
            // fsCount: undefined,
            confidenceState: [
                {1: "low"},
                {2: "medium"},
                {3: "high"}
                ],
            depositionStatus: [
                {0: "PanDDA"},
                {1: "In Refinement"},
                {2: "Refined"},
                {3: "CompChem Ready"},
                {4: "Deposition ready"},
                {5: "Deposited"}
                ],
            fragspectObjects: [
                {
                    "fragId": 49,
                    "code": "NUDT7A_Crude-x0005_1",
                    "map_type": "AC",
                    "target_id": 5,
                    "prot_id": 8657,
                    "map_info": "http://fragalysis-rg.apps.xchem.diamond.ac.uk/media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "deposition_status": 3,
                    "confidence": 3,
                    "smiles": "O=C(O)c1ccc(Cl)c(Cl)c1"
                },
                {
                    "frag_id": 50,
                    "code": "NUDT7A_Crude-x1232_1",
                    "map_type": "eDensity",
                    "target_id": 5,
                    "prot_id": 8657,
                    "map_info": "http://fragalysis-rg.apps.xchem.diamond.ac.uk/media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "deposition_status": 4,
                    "confidence": 2,
                    "smiles": "O=C(Nc1cccnc1)c1ccccc1F"
                },
            ]
        };
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }

    //  async updateCount(props){
    //     if(props.object_list != undefined && props.object_list.length>0){
    //     var response = await fetch("/api/hotspots/?map_type=DO&target_id=5", {
    //         method: "get",
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         }
    //     })
    //     var myJson = await response.json();
    //     this.setState(prevState => ({fsCount: myJson.count}));
    //     }
    // }
    //
    // componentWillReceiveProps(nextProps){
    //     this.updateCount(nextProps);
    // }
    //
    // componentDidMount(){
    //     this.updateCount(this.props);
    // }

    render() {
        // if (this.state.fsCount > 0) {
            return <Well><Row>
                {
                    this.state.fragspectObjects.map((data) => <FragspectView key={data.fragId} data={data}/>)
                }
            </Row></Well>;
        // }
        // else {
        //     return null;
        // }
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
