/**
 * Created by abradley on 14/03/2018.
 */
import { ListGroupItem, ListGroup, Col, Row} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as apiActions from '../actions/apiActions'
import { GenericView } from './generalComponents'
import * as nglObjectTypes from './nglObjectTypes'
import * as selectionActions from '../actions/selectionActions'
import * as listTypes from './listTypes'
import '../../css/toggle.css';
import Toggle from 'react-bootstrap-toggle';
import SVGInline from "react-svg-inline"


class MoleculeView extends GenericView {

    constructor(props) {
        super(props);
        this.generateObject = this.generateObject.bind(this);
        this.generateMolObject = this.generateMolObject.bind(this);
        this.handleVector = this.handleVector.bind(this);
        this.getViewUrl = this.getViewUrl.bind(this);
        this.onVector = this.onVector.bind(this);
        this.onComplex = this.onComplex.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.url = new URL(base_url + '/viewer/img_from_mol_pk/' + this.props.data.id + "/")
        this.state.vectorOn= false
        this.state.complexOn= false
        this.state.backgroundColour = this.getRandomColor();
        this.colourToggle = this.getRandomColor();
    }

    getViewUrl(pk,get_view){
        var base_url = window.location.protocol + "//" + window.location.host
        base_url += "/viewer/"+get_view+"/"+pk.toString()+"/"
        return base_url
    }

    /**
     * Convert the JSON into a list of arrow objects
     */
    generateObjectList(out_data){
        var colour = [1,0,0]
        var deletions = out_data["deletions"]
        var outList = new Array();
        for(var key in deletions) {
            outList.push(this.generateArrowObject(deletions[key][0],
                deletions[key][1],key.split("_")[0],colour))
        }
        var additions = out_data["additions"]
        for(var key in additions) {
            outList.push(this.generateArrowObject(additions[key][0],
                additions[key][1],key.split("_")[0],colour))
        }
        var linker = out_data["linkers"]
        for(var key in linker) {
            outList.push(this.generateCylinderObject(linker[key][0],
                linker[key][1],key.split("_")[0],colour))
        }

        var rings = out_data["ring"]
        for (var key in rings){
            outList.push(this.generateCylinderObject(rings[key][0],
                rings[key][2],key.split("_")[0],colour))
        }
        return outList;
    }

    generateArrowObject(start,end,name,colour){
        return {
            "name": listTypes.VECTOR+"_"+name,
            "OBJECT_TYPE": nglObjectTypes.ARROW,
            "start": start,
            "end": end,
            "colour": colour
        }
    }

    generateCylinderObject(start,end,name,colour){
        return {
            "name": listTypes.VECTOR+"_"+name,
            "OBJECT_TYPE": nglObjectTypes.CYLINDER,
            "start": start,
            "end": end,
            "colour": colour
        }
    }

    generateMolObject(){
        // Get the data
        const data = this.props.data;
        var nglObject = {
            "name": "MOLLOAD" + "_" + data.id.toString(),
            "OBJECT_TYPE":nglObjectTypes.MOLECULE,
            "colour": this.colourToggle,
            "sdf_info": data.sdf_info
        }
        return nglObject;
    }

    generateObject(){
        // Get the data
        const data = this.props.data;
        var nglObject = {
            "name": "COMPLEXLOAD" + "_" + data.id.toString(),
            "OBJECT_TYPE":nglObjectTypes.COMPLEX,
            "sdf_info": data.sdf_info,
            "colour": this.colourToggle,
            "prot_url": this.getViewUrl(data.prot_id,"prot_from_pk")
        }
        return nglObject;
    }

    handleVector(json){
        var objList = this.generateObjectList(json);
        objList.forEach(item => this.props.loadObject(Object.assign({display_div: "major_view"}, item)));
        this.props.setVectorList(objList)
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        var thisToggleOn = false;
        var complexOn = false;
        for(var key in this.props.inViewList){
            if(key.startsWith("MOLLOAD_") && parseInt(key.split("MOLLOAD_")[[1]])==this.props.data.id){
                this.setState(prevState => ({isToggleOn: true}));
            }
            if(key.startsWith("COMPLEXLOAD_") && parseInt(key.split("COMPLEXLOAD_")[[1]])==this.props.data.id){
                this.setState(prevState => ({complexOn: true}));
            }
        }
    }

    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        const selected_style = {width: this.props.width.toString+'px',
            height: this.props.height.toString()+'px', backgroundColor: this.state.backgroundColour}
        this.current_style = this.state.isToggleOn ? selected_style : this.not_selected_style;
        return <div>
            <div onClick={this.handleClick} style={this.current_style}>{svg_image}</div>
            <Toggle onClick={this.onComplex}
                on={<p>Complex ON</p>}
                off={<p>Complex OFF</p>}
                size="xs"
                offstyle="danger"
                active={this.state.complexOn}/>
            <Toggle onClick={this.onVector}
                on={<p>Vector ON</p>}
                off={<p>Vector OFF</p>}
                size="xs"
                offstyle="danger"
                active={this.state.vectorOn}/>
            </div>
    }

    getRandomColor() {
        var colourList = ['#CD4A4A', '#CC6666', '#BC5D58', '#FF5349', '#FD5E53', '#FD7C6E', '#FDBCB4', '#FF6E4A', '#FFA089', '#EA7E5D', '#B4674D', '#A5694F', '#FF7538', '#FF7F49', '#DD9475', '#FF8243', '#FFA474', '#9F8170', '#CD9575', '#EFCDB8', '#D68A59', '#DEAA88', '#FAA76C', '#FFCFAB', '#FFBD88', '#FDD9B5', '#FFA343', '#EFDBC5', '#FFB653', '#E7C697', '#8A795D', '#FAE7B5', '#FFCF48', '#FCD975', '#FDDB6D', '#FCE883', '#F0E891', '#ECEABE', '#BAB86C', '#FDFC74', '#FDFC74', '#FFFF99', '#C5E384', '#B2EC5D', '#87A96B', '#A8E4A0', '#1DF914', '#76FF7A', '#71BC78', '#6DAE81', '#9FE2BF', '#1CAC78', '#30BA8F', '#45CEA2', '#3BB08F', '#1CD3A2', '#17806D', '#158078', '#1FCECB', '#78DBE2', '#77DDE7', '#80DAEB', '#414A4C', '#199EBD', '#1CA9C9', '#1DACD6', '#9ACEEB', '#1A4876', '#1974D2', '#2B6CC4', '#1F75FE', '#C5D0E6', '#B0B7C6', '#5D76CB', '#A2ADD0', '#979AAA', '#ADADD6', '#7366BD', '#7442C8', '#7851A9', '#9D81BA', '#926EAE', '#CDA4DE', '#8F509D', '#C364C5', '#FB7EFD', '#FC74FD', '#8E4585', '#FF1DCE', '#FF1DCE', '#FF48D0', '#E6A8D7', '#C0448F', '#6E5160', '#DD4492', '#FF43A4', '#F664AF', '#FCB4D5', '#FFBCD9', '#F75394', '#FFAACC', '#E3256B', '#FDD7E4', '#CA3767', '#DE5D83', '#FC89AC', '#F780A1', '#C8385A', '#EE204D', '#FF496C', '#EF98AA', '#FC6C85', '#FC2847', '#FF9BAA', '#CB4154', '#EDEDED', '#DBD7D2', '#CDC5C2', '#95918C', '#232323']
        return colourList[this.props.data.id % colourList.length];
    }

    handleClick(e){
        this.setState(prevState => ({isToggleOn: !prevState.isToggleOn, backgroundColour: this.colourToggle}))
        if(this.state.isToggleOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateMolObject()))
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateMolObject(this.colourToggle)))
        }
    }

    onComplex(){
        this.setState(prevState => ({complexOn: !prevState.complexOn}))
        if(this.state.complexOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateObject()))
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateObject()))
            if(!this.state.toggleOn){
                this.handleClick()
            }
        }
    }

    onVector(){
        this.setState(prevState => ({vectorOn: !prevState.vectorOn}))
        if(this.state.vectorOn) {
            this.props.vector_list.forEach(item => this.props.deleteObject(Object.assign({display_div: "major_view"}, item)));

        }
        else {
            fetch(this.getViewUrl(this.props.data.id, "get_vects_from_pk"))
                .then(
                    response => response.json(),
                    error => console.log('An error occurred.', error)
                )
                .then(json => this.handleVector(json))
            // Set this
            this.props.getFullGraph(this.props.data);
            // Do the query
            fetch(this.getViewUrl(this.props.data.id, "get_graph_from_pk"))
                .then(
                    response => response.text(),
                    error => console.log('An error occurred.', error)
                )
                .then(json => this.props.gotFullGraph(json))
        }
    }

}
function mapStateToProps(state) {
  return {
      currentList: state.apiReducers.possibleMols,
      inViewList:state.nglReducers.objectsInView,
      binList: state.apiReducers.binnedMols,
      vector_list: state.selectionReducers.vector_list,
      newListTwo: state.apiReducers.chosenMols,
  }
}
const mapDispatchToProps = {
    getFullGraph: selectionActions.getFullGraph,
    setVectorList: selectionActions.setVectorList,
    gotFullGraph: selectionActions.gotFullGraph,
    transferList: apiActions.transferList,
    deleteObject: nglLoadActions.deleteObject,
    removeFromToBuyList: selectionActions.removeFromToBuyList,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(MoleculeView);