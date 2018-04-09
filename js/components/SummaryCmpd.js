/**
 * Created by abradley on 28/03/2018.
 */

import { ListGroupItem, ListGroup, Col, Row} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import { GenericView } from './generalComponents'
import * as selectionActions from '../actions/selectionActions'
import SVGInline from "react-svg-inline"

class SummaryCmpd extends GenericView {

    constructor(props) {
        super(props);
        this.base_url = window.location.protocol + "//" + window.location.host
        this.update = this.update.bind(this);
        this.smiles = ""
    }



    update(){
        if(this.smiles!=this.props.to_query) {
            this.url = new URL(this.base_url + '/viewer/img_from_smiles/')
            var get_params = {"smiles": this.props.to_query}
            Object.keys(get_params).forEach(key => this.url.searchParams.append(key, get_params[key]))
            this.loadFromServer(this.props.width, this.props.height);
            this.smiles = this.props.to_query
        }
    }

    componentDidMount() {
        setInterval(this.update,50);
    }
    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        return <div onClick={this.handleClick} >{svg_image}</div>
    }

}

function mapStateToProps(state) {
  return {
      to_query: state.selectionReducers.to_query
  }
}
const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryCmpd);