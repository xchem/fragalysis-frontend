/**
 * Created by abradley on 15/03/2018.
 */
import { ListGroupItem, ListGroup, Col, Row} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import { GenericView } from './generalComponents'
import * as selectionActions from '../actions/selectionActions'
import SVGInline from "react-svg-inline"

class CompoundView extends GenericView {

    constructor(props) {
        super(props);
        var base_url = window.location.protocol + "//" + window.location.host
        this.url = new URL(base_url + '/viewer/img_from_smiles/')
        var get_params = {"smiles": props.data["smiles"]}
        Object.keys(get_params).forEach(key => this.url.searchParams.append(key, get_params[key]))
        this.send_obj = props.data
        this.checkInList = this.checkInList.bind(this);
    }

    checkInList(){
        var isToggleOn = false;
        for(var item in this.props.to_buy_list){
            if( this.props.to_buy_list[item]["smiles"]==this.send_obj["smiles"]){
                isToggleOn=true
            }
        }
        this.setState(prevState => ({isToggleOn: isToggleOn}))
    }

    handleClick(e){
        var isToggleOn = this.state.isToggleOn
        this.setState(prevState => ({isToggleOn: !isToggleOn}))
        if(this.state.isToggleOn){
            this.props.removeFromToBuyList(this.send_obj);
        }
        else{
            this.props.appendToBuyList(this.send_obj);
        }
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        this.checkInList();
        setInterval(this.checkInList,150)
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
  }
}
const mapDispatchToProps = {
    removeFromToBuyList: selectionActions.removeFromToBuyList,
    appendToBuyList: selectionActions.appendToBuyList,
}

export default connect(mapStateToProps, mapDispatchToProps)(CompoundView);