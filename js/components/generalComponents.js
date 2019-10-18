/**
 * Created by abradley on 01/03/2018.
 */

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
