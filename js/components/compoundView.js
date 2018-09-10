/**
 * Created by abradley on 15/03/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import { GenericView } from './generalComponents'
import * as selectionActions from '../actions/selectionActions'
import SVGInline from "react-svg-inline"
import fetch from 'cross-fetch';
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from '../components/nglObjectTypes'

class CompoundView extends GenericView {

    getCookie(name) {
        if (!document.cookie) {
            return null;
        }
        const xsrfCookies = document.cookie.split(';')
            .map(c => c.trim())
            .filter(c => c.startsWith(name + '='));
        if (xsrfCookies.length === 0) {
            return null;
        }
        return decodeURIComponent(xsrfCookies[0].split('=')[1]);
    }

    constructor(props) {
        super(props);
        this.base_url = window.location.protocol + "//" + window.location.host;
        if(this.props.data.id != undefined) {
            this.url = new URL(this.base_url + '/api/cmpdimg/' + this.props.data.id + "/")
            this.key = "cmpd_image"
        }
        else{
            this.url = new URL(this.base_url + '/viewer/img_from_smiles/')
            var get_params = {"smiles": props.data.smiles}
            Object.keys(get_params).forEach(key => this.url.searchParams.append(key, get_params[key]))
            this.key = undefined;
        }

        this.send_obj = props.data
        this.conf_on_style = {opacity: "0.3"};
        this.comp_on_style = {backgroundColor: "#B7C185"};
        this.highlightedCompStyle = {borderStyle:"solid"};
        this.checkInList = this.checkInList.bind(this);
        this.handleConf = this.handleConf.bind(this);
        this.handleComp = this.handleComp.bind(this);
    }

    checkInList() {
        var isToggleOn = false;
        for(var item in this.props.to_buy_list) {
            if (this.props.to_buy_list[item].smiles == this.send_obj.smiles) {
                isToggleOn = true
            }
        }
        this.setState(prevState => ({isToggleOn: isToggleOn}))
    }

    handleClick(e) {
        this.props.setHighlighted({index: this.send_obj.index, smiles: this.send_obj.smiles});
        if(e.shiftKey){
            var isConfOn = this.state.isConfOn;
            this.setState(prevState => ({isConfOn: !isConfOn}))
            this.handleConf();
        }
        else {
            if (this.state.compoundClass == this.props.currentCompoundClass){
                this.setState(prevState => ({compoundClass: 0}))
                this.props.removeFromToBuyList(this.send_obj);
            } else {
                this.setState(prevState => ({compoundClass: this.props.currentCompoundClass}))
                Object.assign(this.send_obj, {class:parseInt(this.props.currentCompoundClass)})
                this.props.appendToBuyList(this.send_obj)
            }
        }
    }

    generateMolObject(data,identifier) {
        // Get the data
        var nglObject = {
            "name": "CONFLOAD_"+identifier,
            "OBJECT_TYPE":nglObjectTypes.MOLECULE,
            "colour": "cyan",
            "sdf_info": data
        }
        return nglObject;
    }

    async handleConf(){
        if (this.state.isConfOn) {
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateMolObject(this.conf,this.props.data.smiles)))
        }
        else {
            // This needs currying
            const csrfToken = this.getCookie("csrftoken");
            var post_data = {
                INPUT_VECTOR: this.send_obj.vector,
                INPUT_SMILES: [this.send_obj.smiles],
                INPUT_MOL_BLOCK: this.props.to_query_sdf_info
            }
            const rawResponse = await fetch(
                this.base_url + "/scoring/gen_conf_from_vect/",
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(post_data)
                }
            );
            const content = await rawResponse.json();
            // Now load this into NGL
            this.conf = content[0]
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateMolObject(this.conf, this.props.data.smiles)))
        }
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        this.checkInList();
    }

    componentWillReceiveProps(nextProps) {
        var isHighlighted = false;
        if (nextProps.highlightedCompound.smiles == this.send_obj.smiles) {
            isHighlighted = true;
        }
        this.setState(prevState => ({isHighlighted: isHighlighted}));

        var compoundClass = 0;
        for(var item in nextProps.to_buy_list){
            if (nextProps.to_buy_list[item].smiles == this.send_obj.smiles) {
                var compoundClass = nextProps.to_buy_list[item].class
            }
        }
        this.setState(prevState => ({compoundClass: compoundClass}))
    }

    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        var current_style = Object.assign({},this.not_selected_style);
        if(this.state.isToggleOn==true){
            current_style = Object.assign(current_style, this.comp_on_style)
        }
        if(this.state.isConfOn==true){
            current_style = Object.assign(current_style, this.conf_on_style)
        }
        if(this.state.isHighlighted==true){
            current_style = Object.assign(current_style, this.highlightedCompStyle)
        }
        if(this.state.compoundClass!=0){
            var colourList = ['#78DBE2', '#b3cde3', '#fbb4ae', '#ccebc5', '#decbe4', '#fed9a6'];
            current_style = Object.assign(current_style, {backgroundColor: colourList[this.state.compoundClass]})
        }
        return <div onClick={this.handleClick} style={current_style}>{svg_image}</div>
    }
}

function mapStateToProps(state) {
  return {
      to_buy_list: state.selectionReducers.present.to_buy_list,
      to_query_sdf_info: state.selectionReducers.present.to_query_sdf_info,
      highlightedCompound: state.selectionReducers.present.highlightedCompound,
      thisVectorList: state.selectionReducers.present.this_vector_list,
      currentCompoundClass: state.selectionReducers.present.currentCompoundClass,
      to_query: state.selectionReducers.present.to_query,
      currentVector: state.selectionReducers.present.currentVector,
  }
}
const mapDispatchToProps = {
    loadObject: nglLoadActions.loadObject,
    deleteObject: nglLoadActions.deleteObject,
    removeFromToBuyList: selectionActions.removeFromToBuyList,
    appendToBuyList: selectionActions.appendToBuyList,
    setHighlighted: selectionActions.setHighlighted,
}

export default connect(mapStateToProps, mapDispatchToProps)(CompoundView);