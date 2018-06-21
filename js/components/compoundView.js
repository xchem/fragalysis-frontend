/**
 * Created by abradley on 15/03/2018.
 */
import { ListGroupItem, ListGroup, Col, Row} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import { GenericView } from './generalComponents'
import * as selectionActions from '../actions/selectionActions'
import SVGInline from "react-svg-inline"
import fetch from 'cross-fetch';
import { Cookies } from 'js-cookie';

class CompoundView extends GenericView {

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
        this.checkInList = this.checkInList.bind(this);
        this.handleConf = this.handleConf.bind(this);
    }

    checkInList() {
        var isToggleOn = false;
        for(var item in this.props.to_buy_list){
            if( this.props.to_buy_list[item].smiles==this.send_obj.smiles){
                isToggleOn=true
            }
        }
        this.setState(prevState => ({isToggleOn: isToggleOn}))
    }

    handleClick(e) {

        if(e.shiftKey){
            this.handleConf();
        }
        else {
            var isToggleOn = this.state.isToggleOn
            this.setState(prevState => ({isToggleOn: !isToggleOn}))
            if (this.state.isToggleOn) {
                this.props.removeFromToBuyList(this.send_obj);
            }
            else {
                this.props.appendToBuyList(this.send_obj);
            }
        }
    }

    async handleConf(){
        var post_data = {
            "INPUT_VECTOR": this.send_obj.vector,
            "INPUT_SMILES": [this.send_obj.smiles],
            "INPUT_MOL_BLOCK": this.props.to_query_sdf_info,
        }
        var csrftoken = Cookies.get('csrftoken');
        const rawResponse = await fetch(this.base_url + "/scoring/gen_conf_from_vect/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(post_data)
        });
        const content = await rawResponse.json();
        // Now load this into NGL

    }


    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        this.checkInList();
    }

    componentWillReceiveProps(nextProps) {
        var isToggleOn = false;
        for(var item in nextProps.to_buy_list){
            if( nextProps.to_buy_list[item].smiles==this.send_obj.smiles){
                isToggleOn=true
            }
        }
        this.setState(prevState => ({isToggleOn: isToggleOn}));
    }


    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        this.current_style = this.state.isToggleOn ? this.selected_style : this.not_selected_style;
        return <div onClick={this.handleClick} style={this.current_style}>{svg_image}</div>
    }

}

function mapStateToProps(state) {
  return {
      to_buy_list: state.selectionReducers.to_buy_list,
      to_query_sdf_info: state.selectionReducers.to_query_sdf_info,
  }
}
const mapDispatchToProps = {

    removeFromToBuyList: selectionActions.removeFromToBuyList,
    appendToBuyList: selectionActions.appendToBuyList,
}

export default connect(mapStateToProps, mapDispatchToProps)(CompoundView);