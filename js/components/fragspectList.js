/**
 * Created by ricgillams on 04/02/2019.
 */
import {Well, Col, Row, ToggleButtonGroup, ToggleButton} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import FragspectView from "./fragspectView";

// const customStyles = {
//     divider: {
//         background: '#e0e0e0',
//         width: '1px',
//         content: '',
//         display: 'block',
//         position: 'absolute',
//         minHeight: '70px'
//     }
// }

class FragspectList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLECULE;
        this.confFilterChange = this.confFilterChange.bind(this);
        this.depoFilterChange = this.depoFilterChange.bind(this);
        this.siteButtonGenerator = this.siteButtonGenerator.bind(this);
        this.radioButtonRender = this.radioButtonRender.bind(this);
        this.state = {
            maximumSiteNumber: 4,
            confidenceFilter: [1,2,3],
            depositionFilter: [1,2,3,4,5,6,7],
            stateFilter: [],
            confidenceState: [
                {1: "low"},
                {2: "medium"},
                {3: "high"}
                ],
            depositionStatus: [
                {1: "Analysis Pending"},
                {2: "PanDDA Model"},
                {3: "In Refinement"},
                {4: "CompChem Ready"},
                {5: "Deposition Ready"},
                {6: "Deposited"},
                {7: "Analysed and Rejected"}
                ],
            fragspectObjects: [
                {
                    "fragId": 49,
                    "crystal": "NUDT5A_Crude-x0005",
                    "site_number": "1",
                    "event_number": "1",
                    "code": "NUDT5A_Crude-x0005_1",
                    "lig_id": "LIG-D1",
                    "target_name": "NUDT5A",
                    "target_id": 6,
                    "prot_id": 8657,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "crystal_status": 1,
                    "event_status": 1,
                    "confidence": 3,
                    "resolution": 2.1,
                    "smiles": "O=C(O)c1ccc(Cl)c(Cl)c1",
                    "space_group": "P 3 2 1",
                    "cell_dimensions": "125, 125, 41",
                    "cell_angles": "90, 90, 120"
                },
                {
                    "frag_id": 50,
                    "crystal": "NUDT7A_Crude-x2415",
                    "site_number": "3",
                    "event_number": "1",
                    "code": "NUDT7A_Crude-x1232_1",
                    "lig_id": "LIG-D1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8652,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "crystal_status": 5,
                    "event_status": 2,
                    "confidence": 2,
                    "resolution": 1.5,
                    "smiles": "O=C(Nc1cccnc1)c1ccccc1F",
                    "space_group": "P 1",
                    "cell_dimensions": "48, 59, 79",
                    "cell_angles": "79, 82, 76"
                },
                {
                    "fragId": 51,
                    "crystal": "NUDT7A_Crude-x2415",
                    "site_number": "1",
                    "event_number": "1",
                    "code": "NUDT7A_Crude-x0142_2",
                    "lig_id": "LIG-E1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8651,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "crystal_status": 3,
                    "event_status": 3,
                    "confidence": 1,
                    "resolution": 1.4,
                    "smiles": "COc1ccc(CC(=O)Nc2cccc(Cl)c2)cc1",
                    "space_group": "P 1",
                    "cell_dimensions": "49, 59, 80 ",
                    "cell_angles": "79, 81, 75"
                },
                {
                    "fragId": 52,
                    "crystal": "NUDT7A_Crude-x2415",
                    "site_number": "2",
                    "event_number": "1",
                    "code": "NUDT7A_Crude-x2415_3",
                    "lig_id": "LIG-E1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8657,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "crystal_status": 2,
                    "event_status": 4,
                    "confidence": 3,
                    "resolution": 1.8,
                    "smiles":"O=C(O)c1ccc(Br)nc1",
                    "space_group": "C 1 2 1",
                    "cell_dimensions": "102, 45, 60",
                    "cell_angles": "90, 90, 90"
                },
                {
                    "fragId": 53,
                    "crystal": "NUDT7A_Crude-x1647",
                    "site_number": "1",
                    "event_number": "1",
                    "code": "NUDT7A_Crude-x1647_1",
                    "lig_id": "LIG-D1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8658,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "crystal_status": 4,
                    "event_status": 5,
                    "confidence": 2,
                    "resolution": 2.2,
                    "smiles": "Cc1cc(NC(=O)Cc2cccc(O)c2)no1",
                    "space_group": "P 1",
                    "cell_dimensions": "49, 59, 79",
                    "cell_angles": "79, 81, 75"
                },
                {
                    "fragId": 54,
                    "crystal": "NUDT7A_Crude-x0245",
                    "site_number": "1",
                    "event_number": "1",
                    "code": "NUDT7A_Crude-x0245_3",
                    "lig_id": "LIG-D1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8752,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "crystal_status": 7,
                    "event_status": 6,
                    "confidence": 3,
                    "resolution": 1.8,
                    "smiles": "O=C(Nc1ccon1)c1ccccc1F",
                    "space_group": "P 3 2 1",
                    "cell_dimensions": "125, 125, 41",
                    "cell_angles": "90, 90, 120"
                },
                {
                    "fragId": 55,
                    "crystal": "NUDT5A_Crude-x0526",
                    "site_number": "1",
                    "event_number": "1",
                    "code": "NUDT5A_Crude-x0526_3",
                    "lig_id": "LIG-E1",
                    "target_name": "NUDT5A",
                    "target_id": 6,
                    "prot_id": 8655,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "crystal_status": 6,
                    "event_status": 7,
                    "confidence": 3,
                    "resolution": 2.5,
                    "smiles": "Cc1cc(NC(=O)Cc2cccc(O)c2)no1",
                    "space_group": "C 1 2 1",
                    "cell_dimensions": "102, 45, 60",
                    "cell_angles": "90, 90, 90"
                }
            ]
        };
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }

    confFilterChange(value){
        if (this.state.confidenceFilter.includes(value)){
            this.setState(prevState => ({confidenceFilter: prevState.confidenceFilter.filter(conf => conf != value)}))
        } else {
            var newConfFilter = this.state.confidenceFilter.slice();
            newConfFilter.push(value);
            newConfFilter.sort();
            this.setState(prevState => ({confidenceFilter: newConfFilter}));
        }
    }

    depoFilterChange(value){
        if (this.state.depositionFilter.includes(value)){
            this.setState(prevState => ({depositionFilter: prevState.depositionFilter.filter(depo => depo != value)}))
        } else {
            var newDepoFilter = this.state.depositionFilter.slice();
            newDepoFilter.push(value);
            newDepoFilter.sort();
            this.setState(prevState => ({depositionFilter: newDepoFilter}));
        }
    }

    siteButtonGenerator(){
        var buttons = [];
        for (var i = 1; i < this.state.maximumSiteNumber; i++) {
            buttons.push(this.radioButtonRender("Site", i, "active"));
            var newStateFilter = this.state.stateFilter.push(i)
            this.setState(prevState => ({stateFilter: newStateFilter}))
        }
        return buttons;
    }

    radioButtonRender(type, value, status) {
        if (type == "Site") {
            // var button = <ToggleButton bsSize="sm" bsStyle="info" value={value} onClick={this.confFilterChange(value)}>{type}: {status}</ToggleButton>;
            var button = <ToggleButton bsSize="sm" bsStyle="danger" value={value}>{type}: {value}</ToggleButton>;
        } else if (type == "Confidence") {
            // var button = <ToggleButton bsSize="sm" bsStyle="info" value={value} onClick={this.confFilterChange(value)}>{type}: {status}</ToggleButton>;
            var button = <ToggleButton bsSize="sm" bsStyle="info" value={value}>{type}: {status}</ToggleButton>;
        } else if (type == "Deposition") {
            // var button = <ToggleButton bsSize="sm" bsStyle="warning" value={value + 4} onClick={this.depoFilterChange(value)}>{value}: {status}</ToggleButton>;
            var button = <ToggleButton bsSize="sm" bsStyle="warning" value={value + 4}>{value}: {status}</ToggleButton>;
        }
        return button;
    }

    render() {
        return <Well>
            <Row height="50px" style={{overflow: scroll}}>
                <Row>
                    <Col xs={1} md={1}></Col>
                    <Col xs={1} md={1}><h4 className="text-center">Site selector</h4></Col>
                    <Col xs={1} md={1}></Col>
                    <Col xs={3} md={3}><h4 className="text-center">XChem status filter</h4></Col>
                    <Col xs={1} md={1}></Col>
                    <Col xs={2} md={2}><h4 className="text-center">Confidence filter</h4></Col>
                    <Col xs={1} md={1}></Col>
                    <Col xs={1} md={1}><h4 className="text-center">View</h4></Col>
                    <Col xs={1} md={1}></Col>
                </Row>
                <Col xs={1} md={1}></Col>
                <Col xs={1} md={1}>
                    <ToggleButtonGroup vertical block type="checkbox" value="siteSelector">
                        {this.siteButtonGenerator()}
                        <p className="text-center">Site filter: {this.state.stateFilter.toString()}</p>
                    </ToggleButtonGroup>
                </Col>
                <Col xs={1} md={1}></Col>
                <Col xs={3} md={3}>
                    <Col xs={6} md={6}>
                        <ToggleButtonGroup vertical block type="checkbox" value="depoFilter">
                            {this.radioButtonRender("Deposition", 1, "Analysis Pending")}
                            {this.radioButtonRender("Deposition", 2, "PanDDA Model")}
                            {this.radioButtonRender("Deposition", 3, "In Refinement")}
                            <p className="text-center">Deposition filter: {this.state.depositionFilter.toString()}</p>
                        </ToggleButtonGroup>
                    </Col>
                    <Col xs={6} md={6}>
                        <ToggleButtonGroup vertical block type="checkbox" value="depoFilter2">
                            {this.radioButtonRender("Deposition", 4, "CompChem Ready")}
                            {this.radioButtonRender("Deposition", 5, "Deposition Ready")}
                            {this.radioButtonRender("Deposition", 6, "Deposited")}
                            {this.radioButtonRender("Deposition", 7, "Analysed and Rejected")}
                            </ToggleButtonGroup>
                    </Col>
                </Col>
                <Col xs={1} md={1}></Col>
                <Col xs={2} md={2}>
                    <ToggleButtonGroup vertical block type="checkbox" value="confFilter">
                        {this.radioButtonRender("Confidence", 1, "Low")}
                        {this.radioButtonRender("Confidence", 2, "Medium")}
                        {this.radioButtonRender("Confidence", 3, "High")}
                        <p className="text-center">Confidence filter: {this.state.confidenceFilter.toString()}</p>
                    </ToggleButtonGroup>
                </Col>
                <Col xs={1} md={1}></Col>
                <Col xs={1} md={1}>
                    <p className="text-center">Event view</p>
                </Col>
                <Col xs={1} md={1}></Col>
            </Row>
            {/*<Row style={customStyles}></Row>*/}
            <Row>
                <Col xs={2} md={2}><h4 className="text-center">Crystal ID</h4></Col>
                <Col xs={1} md={1}><h4 className="text-center">Site</h4></Col>
                <Col xs={1} md={1}><h4 className="text-center">Ligand ID</h4></Col>
                <Col xs={1} md={1}><h4 className="text-center">Structure</h4></Col>
                <Col xs={2} md={2}><h4 className="text-center">Status</h4></Col>
                <Col xs={1} md={1}><h4 className="text-center">Confidence</h4></Col>
                <Col xs={1} md={1}><h4 className="text-center">Density</h4></Col>
                <Col xs={1} md={1}><h4 className="text-center">Spider</h4></Col>
                <Col xs={1} md={1}><h4 className="text-center">Resolution</h4></Col>
                <Col xs={1} md={1}><h4 className="text-center">SPG and cell</h4></Col>
            </Row>
            {this.state.fragspectObjects.map((data) => <FragspectView key={data.code} data={data}/>)}
        </Well>;
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
