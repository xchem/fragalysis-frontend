/**
 * Created by abradley on 19/04/2018.
 */
import React from 'react';
import * as nglLoadActions from '../actions/nglLoadActions';
import { connect } from 'react-redux'
import '../../css/toggle.css';
import Toggle from 'react-bootstrap-toggle';
import SVGInline from "react-svg-inline"


class EventView extends React.Component {

    constructor(props) {
        super(props);
        this.data = props.data;
    }

    render(){
        const selected_style = {width: this.props.width.toString+'px',
            height: this.props.height.toString()+'px', backgroundColor: this.colourToggle}
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
                active={this.props.to_query==this.props.data.smiles}/>
            </div>
    }
}

function mapStateToProps(state) {
  return {

  }
}
const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(EventView);