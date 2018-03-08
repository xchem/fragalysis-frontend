/**
 * Created by abradley on 01/03/2018.
 */
import $ from 'jquery';
import SVGInline from "react-svg-inline"
import React from 'react';
import { ListGroup, Col } from 'react-bootstrap';
import Draggable from 'react-draggable'; // The default
import * as nglActions from '../actions/nglActions/nglLoadActions'

function FillMe(props) {
    return <h1>FILL ME UP PLEASE</h1>;
}

// Generic Classes
export class GenericList extends React.Component {

    constructor(props) {
    super(props);
        this.url = ''
        this.interval = 10000
        this.state = {data:[]}
        this.loadFromServer = this.loadFromServer.bind(this);
  }

  loadFromServer() {
        $.ajax({
            url: this.url,
            datatype: 'json',
            data: this.props.get_params,
            cache: false,
            success: function (data) {
                this.setState({data: data["results"]})
            }.bind(this)
        })
    }

    componentDidMount() {
        this.setState(prevState => (
        {targetOn: "",
            data: []}
        ));
        this.loadFromServer();
        setInterval(this.loadFromServer,
            this.interval)
    }


    render() {
        if (this.state.data) {
            console.log(this.props.message)
            //
            return <ListGroup>
                {
                this.state.data.map((data, index) => (this.render_method(data,index)))
                 }
            </ListGroup>;
        }
        else {
            return (<FillMe />)
        }
    }

}

export class GenericView extends React.Component{


    constructor(props) {
    super(props);
        this.loadFromServer = this.loadFromServer.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.selected_style = {backgroundColor: "#faebcc"}
        this.not_selected_style = {}
        this.state = {isToggleOn: false,
            data: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="110px" height="110px"><g>' +
        '<circle cx="50" cy="0" r="5" transform="translate(5 5)"/>' +
        '<circle cx="75" cy="6.6987298" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="93.3012702" cy="25" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="100" cy="50" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="93.3012702" cy="75" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="75" cy="93.3012702" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="50" cy="100" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="25" cy="93.3012702" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="6.6987298" cy="75" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="0" cy="50" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="6.6987298" cy="25" r="5" transform="translate(5 5)"/> ' +
        '<circle cx="25" cy="6.6987298" r="5" transform="translate(5 5)"/> ' +
        '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 55 55" to="360 55 55" dur="3s" repeatCount="indefinite" /> </g> ' +
        '</svg>'};
  }

    loadFromServer() {
        $.ajax({
            url: this.url,
            datatype: 'json',
            cache: false,
            data: this.props.get_params,
            success: function (data) {
                this.setState({data: data})
            }.bind(this)
        })
    }


    componentDidMount() {
        this.loadFromServer();
    }

    handleClick() {
        var new_toggle = !this.state.isToggleOn;
        this.setState(prevState => ({
          isToggleOn: !prevState.isToggleOn
        }));
        this.props.dispatch(nglActions.loadMol())
    }

    render() {
        const svg_image = <SVGInline svg={this.state.data}/>;
        this.current_style = this.state.isToggleOn ? this.selected_style : this.selected_style;
        return <Draggable>
                <Col xs={3} onClick={this.handleClick} style={this.current_style}>{svg_image}</Col>
                </Draggable>

    }
}