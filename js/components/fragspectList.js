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
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.confFilterChange = this.confFilterChange.bind(this);
        this.depoFilterChange = this.depoFilterChange.bind(this);
        this.siteFilterChange = this.siteFilterChange.bind(this);
        this.siteButtonGenerator = this.siteButtonGenerator.bind(this);
        this.buttonRender = this.buttonRender.bind(this);
        this.generateTableRows = this.generateTableRows.bind(this);
        this.state = {
            maximumSiteNumber: 0,
            confidenceFilter: [1,2,3],
            depositionFilter: [1,2,3,4,5,6,7],
            siteFilter: [],
            buttonsDepressed: [],
            confidenceState: [
                {1: "low"},
                {2: "medium"},
                {3: "high"}
                ],
            // add not viewed, interesting, discard
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
                    "crystal": "NUDT5A-x0005",
                    "site_number": 1,
                    "event_number": 1,
                    "code": "NUDT5A-x0005_1",
                    "lig_id": "LIG-D1",
                    "target_name": "NUDT5A",
                    "target_id": 6,
                    "prot_id": 8657,
                    "event_map_info": "media/maps/NUDT5A-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/NUDT5A-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/NUDT5A-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/NUDT5A-x0349_acceptor_ebBZqDc.png",
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
                    "crystal": "NUDT7A-x2415",
                    "site_number": 5,
                    "event_number": 1,
                    "code": "NUDT7A-x1232_1",
                    "lig_id": "LIG-D1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8652,
                    "event_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
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
                    "crystal": "NUDT7A-x2415",
                    "site_number": 1,
                    "event_number": 1,
                    "code": "NUDT7A-x0142_2",
                    "lig_id": "LIG-E1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8651,
                    "event_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
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
                    "crystal": "NUDT7A-x2415",
                    "site_number": 2,
                    "event_number": 1,
                    "code": "NUDT7A-x2415_3",
                    "lig_id": "LIG-E1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8657,
                    "event_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
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
                    "crystal": "NUDT7A-x1647",
                    "site_number": 4,
                    "event_number": 1,
                    "code": "NUDT7A-x1647_1",
                    "lig_id": "LIG-D1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8658,
                    "event_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
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
                    "crystal": "NUDT7A-x0245",
                    "site_number": 1,
                    "event_number": 1,
                    "code": "NUDT7A-x0245_3",
                    "lig_id": "LIG-D1",
                    "target_name": "NUDT7A",
                    "target_id": 5,
                    "prot_id": 8752,
                    "event_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/NUDT7A-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/NUDT7A-x0349_acceptor_ebBZqDc.png",
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
                    "crystal": "NUDT5A-x0526",
                    "site_number": 4,
                    "event_number": 1,
                    "code": "NUDT5A-x0526_3",
                    "lig_id": "LIG-E1",
                    "target_name": "NUDT5A",
                    "target_id": 6,
                    "prot_id": 8655,
                    "event_map_info": "media/maps/NUDT5A-x0349_acceptor_ebBZqDc.ccp4",
                    "sigmaa_map_info": "media/maps/NUDT5A-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/NUDT5A-x0349_acceptor_ebBZqDc.png",
                    "2d_view_png": "media/spideys/NUDT5A-x0349_acceptor_ebBZqDc.png",
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

    handleFilterChange(value) {
        console.log(value)
        if (value <= 7) {
            this.depoFilterChange(value);
        } else if (value <= 10) {
            this.confFilterChange(value);
        } else {
            this.siteFilterChange(value);
        }
    }

    confFilterChange(value){
        var confValue = value - 7;
        if (this.state.confidenceFilter.includes(confValue)){
            this.setState(prevState => ({confidenceFilter: prevState.confidenceFilter.filter(conf => conf != confValue)}))
        } else {
            var newConfFilter = this.state.confidenceFilter.slice();
            newConfFilter.push(confValue);
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

    siteFilterChange(value){
        var siteValue = value - 10;
        if (this.state.siteFilter.includes(siteValue)){
            this.setState(prevState => ({siteFilter: prevState.siteFilter.filter(site => site != siteValue)}))
        } else {
            var newSiteFilter = this.state.siteFilter.slice();
            newSiteFilter.push(siteValue);
            newSiteFilter.sort();
            this.setState(prevState => ({siteFilter: newSiteFilter}));
        }
    }

    siteButtonGenerator(){
        var buttons = {};
        for (var i = 1; i <= this.state.maximumSiteNumber; i++) {
            buttons.push(this.buttonRender("Site", i+10, i));
        }
        return buttons;
    }

    buttonRender(type, value, status) {
        if (type == "Deposition") {
            var button = <ToggleButton bsSize="sm" bsStyle="warning" value={value} key={"depo"+value.toString()}>{value}: {status}</ToggleButton>;
        } else if (type == "Confidence") {
            var button = <ToggleButton bsSize="sm" bsStyle="info" value={value} key={"conf"+value.toString()}>{type}: {status}</ToggleButton>;
        } else if (type == "Site") {
            var button = <ToggleButton bsSize="sm" bsStyle="danger" value={value} key={"site"+value.toString()}>{type}: {this.state.confidenceState[status]}</ToggleButton>;
        }
        return button;
    }

    generateTableRows() {
        var rows = [];
        for (event in this.state.fragspectObjects) {
            if (this.state.confidenceFilter.includes(this.state.fragspectObjects[event].confidence) &&
                this.state.depositionFilter.includes(this.state.fragspectObjects[event].event_status) &&
                this.state.siteFilter.includes(this.state.fragspectObjects[event].site_number)) {
                rows.push(<FragspectView key={this.state.fragspectObjects[event].code} data={this.state.fragspectObjects[event]}/>)
            }
        }
        return rows;
    }

    componentWillMount(){
        var maxSite = 1;
        for (var event in this.state.fragspectObjects){
            if (this.state.fragspectObjects[event].site_number > maxSite) {
                maxSite = this.state.fragspectObjects[event].site_number;
            }
        }
        this.setState(prevState => ({maximumSiteNumber: maxSite}))
        var newSiteFilter = this.state.siteFilter.splice();
        for (var i = 1; i <= maxSite; i++) {
            newSiteFilter.push(i);
        }
        this.setState(prevState => ({siteFilter: newSiteFilter}))
    }

    componentDidMount() {
        var filtersOn = [];
        for (var d in this.state.depositionFilter){
            filtersOn.push(this.state.depositionFilter[d])
        }
        for (var c in this.state.confidenceFilter){
            filtersOn.push(this.state.confidenceFilter[c]+7)
        }
        for (var s in this.state.siteFilter){
            filtersOn.push(this.state.siteFilter[s]+10)
        }
        this.setState(prevState => ({buttonsDepressed: filtersOn}))
    }

    render() {
        return <Well>
            <Row height="50px" style={{overflow: scroll}}>
                <Row>
                    <Col xs={1} md={1}></Col>
                    <Col xs={1} md={1}><h4 className="text-center">Site selector</h4></Col>
                    <Col xs={1} md={1}></Col>
                    <Col xs={3} md={3}><h4 className="text-center">Status filter</h4></Col>
                    <Col xs={1} md={1}></Col>
                    <Col xs={2} md={2}><h4 className="text-center">Confidence filter</h4></Col>
                    <Col xs={1} md={1}></Col>
                    <Col xs={1} md={1}><h4 className="text-center">View</h4></Col>
                    <Col xs={1} md={1}></Col>
                </Row>
                <Col xs={1} md={1}></Col>
                <Col xs={1} md={1}>
                    <ToggleButtonGroup vertical block type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleFilterChange}>
                        {this.siteButtonGenerator()}
                        <p className="text-center">Site filter: {this.state.siteFilter.toString()}</p>
                    </ToggleButtonGroup>
                </Col>
                <Col xs={1} md={1}></Col>
                <Col xs={3} md={3}>
                    <Col xs={6} md={6}>
                        <ToggleButtonGroup vertical block type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleFilterChange}>
                            {this.buttonRender("Deposition", 1, "Analysis Pending")}
                            {this.buttonRender("Deposition", 2, "PanDDA Model")}
                            {this.buttonRender("Deposition", 3, "In Refinement")}
                            <p className="text-center">Deposition filter: {this.state.depositionFilter.toString()}</p>
                        </ToggleButtonGroup>
                    </Col>
                    <Col xs={6} md={6}>
                        <ToggleButtonGroup vertical block type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleFilterChange}>
                            {this.buttonRender("Deposition", 4, "CompChem Ready")}
                            {this.buttonRender("Deposition", 5, "Deposition Ready")}
                            {this.buttonRender("Deposition", 6, "Deposited")}
                            {this.buttonRender("Deposition", 7, "Analysed and Rejected")}
                            </ToggleButtonGroup>
                    </Col>
                </Col>
                <Col xs={1} md={1}></Col>
                <Col xs={2} md={2}>
                    <ToggleButtonGroup vertical block type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleFilterChange}>
                        {this.buttonRender("Confidence", 8, 1)}
                        {this.buttonRender("Confidence", 9, 2)}
                        {this.buttonRender("Confidence", 10, 3)}
                        <p className="text-center">Confidence filter: {this.state.confidenceFilter.toString()}</p>
                    </ToggleButtonGroup>
                </Col>
                <Col xs={1} md={1}></Col>
                <Col xs={1} md={1}>
                    <p className="text-center">Event review</p>
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
            {this.generateTableRows()}
            {/*{this.state.fragspectObjects.map((data) => <FragspectView key={data.code} data={data}/>)}*/}
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
