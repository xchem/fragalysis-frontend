/**
 * Created by abradley on 01/03/2018.
 */

import SVGInline from 'react-svg-inline';
import React from 'react';
import { Pager, Well } from 'react-bootstrap';
import fetch from 'cross-fetch';
import * as R from 'ramda';
export function FillMe(props) {
  return <h1>FILL ME UP PLEASE</h1>;
}

const fetchWithMemoize = R.memoizeWith(R.identity, url => {
  return fetch(url).then(response => response.json(), error => console.log('An error occurred.', error));
});
exports.fetchWithMemoize = fetchWithMemoize;

// Generic Classes

export class GenericView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.loadFromServer = this.loadFromServer.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.not_selected_style = {
      width: (props.width + 5).toString() + 'px',
      height: (props.height + 5).toString() + 'px',
      display: 'inline-block'
    };
    this.old_url = '';
    this.state = {
      isToggleOn: false,
      img_data:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="50px" height="50px"><g>' +
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
        '</svg>',
      value: [],
      vectorOn: false,
      complexOn: false
    };
    this.selected_style = {
      width: (props.width + 5).toString() + 'px',
      height: (props.height + 5).toString() + 'px',
      display: 'inline-block',
      backgroundColor: '#B7C185'
    };
    this.conf_on_style = { borderStyle: 'solid' };
    this.comp_on_style = { backgroundColor: '#B7C185' };
  }

  loadFromServer(width, height) {
    var url = this.url;
    var get_params = {
      width: width,
      height: height
    };
    Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]));
    if (this.key == undefined) {
      if (url.toString() != this.old_url) {
        fetchWithMemoize(url).then(text => this.setState(prevState => ({ img_data: text })));
      }
    } else {
      if (url.toString() != this.old_url) {
        fetchWithMemoize(url).then(text => this.setState(prevState => ({ img_data: text[this.key] })));
      }
    }
    this.old_url = url.toString();
  }

  componentDidMount() {
    this.loadFromServer(this.props.width, this.props.height);
  }

  clickHandle() {}

  handleStop(e, data) {
    // Move this element from list A to list B if it moves to that zone
    const fromElement = e.fromElement;
    const toElement = e.toElement;
    const eleMove = data.node;
  }

  handleClick() {
    this.setState(prevState => ({ isToggleOn: !prevState.isToggleOn }));
  }

  render() {
    const svg_image = <SVGInline svg={this.state.img_data} />;
    this.current_style = this.state.isToggleOn ? this.selected_style : this.not_selected_style;
    return (
      <div onClick={this.handleClick} style={this.current_style}>
        {svg_image}
      </div>
    );
  }
}

export class Slider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleForward = this.handleForward.bind(this);
    this.handleBackward = this.handleBackward.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.checkForUpdate = this.checkForUpdate.bind(this);
    this.newOption = this.newOption.bind(this);
    this.state = { currentlySelected: -1, progress: 0, progress_string: '' };
    this.slider_name = 'DEFAULT';
  }

  render() {
    this.progress = this.state.progress;
    const pager = (
      <Pager>
        <Pager.Item onClick={this.handleBackward}>Previous</Pager.Item>{' '}
        <Pager.Item onClick={this.handleForward}>Next</Pager.Item>
      </Pager>
    );
    const error_text = 'No ' + this.slider_name + ' available';
    var meat_of_div;
    if (this.props.object_list == undefined || this.props.object_list.length == 0) {
      meat_of_div = error_text;
    } else {
      meat_of_div = pager;
    }

    return (
      <Well bsSize="small">
        <h3>{this.slider_name} Selector</h3> {this.state.progress_string}
        {meat_of_div}
      </Well>
    );
  }

  newOption(new_value) {}

  handleForward() {
    var selected = this.state.currentlySelected;
    if (selected < this.props.object_list.length - 1) {
      selected += 1;
      this.handleChange(selected);
    } else {
      selected = 0;
      this.handleChange(selected);
    }
  }

  handleBackward() {
    var selected = this.state.currentlySelected;
    if (selected > 0) {
      selected -= 1;
      this.handleChange(selected);
    } else {
      selected = this.props.object_list.length - 1;
      this.handleChange(selected);
    }
  }

  handleChange(selected) {
    var progress = (100 * selected) / (this.props.object_list.length - 1);
    var prog_string = 'On ' + (selected + 1).toString() + ' of a total of ' + this.props.object_list.length.toString();
    this.setState(prevState => ({
      currentlySelected: selected,
      progress: progress,
      progress_string: prog_string
    }));
    this.props.setObjectOn(this.props.object_list[selected].id);
    this.newOption(this.props.object_list[selected].id);
  }

  checkForUpdate() {
    if (this.props.object_list != []) {
      var selected;
      var counter = 0;
      for (var index in this.props.object_list) {
        if (this.props.object_list[index].id == this.props.object_on) {
          selected = counter;
        }
        counter += 1;
      }
      if (selected != undefined && selected != this.state.currentlySelected) {
        this.handleChange(selected);
      }
    }
  }

  componentDidMount() {
    //setInterval(this.checkForUpdate, 50);
    this.checkForUpdate();
  }
}
