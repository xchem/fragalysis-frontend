/**
 * Created by abradley on 28/03/2018.
 */

import React from 'react';
import { connect } from 'react-redux';
import { GenericView } from './generalComponents';
import SVGInline from 'react-svg-inline';

class SummaryCmpd extends GenericView {
  constructor(props) {
    super(props);
    this.base_url = window.location.protocol + '//' + window.location.host;
    this.update = this.update.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.getAtomIndices = this.getAtomIndices.bind(this);
    this.smiles = '';
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
  }

  handleClick() {
    this.setState(prevState => ({ isToggleOn: !prevState.isToggleOn }));
  }

  // tu je vlastny loader
  loadFromServer(width, height) {
    var url = this.url;
    var get_params = {
      width: width,
      height: height
    };
    Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]));
    if (url.toString() != this.old_url) {
      fetch(url)
        .then(response => response.text(), error => console.log('An error occurred.', error))
        .then(text => this.setState(prevState => ({ img_data: text })));
    }
    this.old_url = url.toString();
  }

  getAtomIndices(props) {
    if (props.currentVector == undefined) {
      return undefined;
    }
    if (props.bondColorMap == undefined) {
      return undefined;
    }
    var optionList = props.bondColorMap[props.currentVector];
    var outStrList = [];
    for (var index in optionList) {
      var newList = [];
      for (var newIndex in optionList[index]) {
        if (optionList[index][newIndex] == 'NA') {
          newList.push(101);
        } else {
          newList.push(optionList[index][newIndex]);
        }
      }

      var newStr = newList.join(',');
      outStrList.push(newStr);
    }
    return outStrList.join(',');
  }

  update(props) {
    var atomIndices = this.getAtomIndices(props);
    this.url = new URL(this.base_url + '/viewer/img_from_smiles/');
    var get_params;
    if (props.to_query == '') {
      this.smiles = props.to_query;
      return;
    } else if (atomIndices == undefined) {
      get_params = { smiles: props.to_query };
    } else {
      get_params = { smiles: props.to_query, atom_indices: atomIndices };
    }
    Object.keys(get_params).forEach(key => this.url.searchParams.append(key, get_params[key]));
    this.loadFromServer(props.width, props.height);
    this.smiles = props.to_query;
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps);
  }

  componentDidMount() {
    this.update(this.props);
  }

  render() {
    const svg_image = <SVGInline svg={this.state.img_data} />;
    return <div onClick={this.handleClick}>{svg_image}</div>;
  }
}

function mapStateToProps(state) {
  return {
    to_query: state.selectionReducers.present.to_query,
    bondColorMap: state.selectionReducers.present.bondColorMap,
    currentVector: state.selectionReducers.present.currentVector,
    this_vector_list: state.selectionReducers.present.this_vector_list
  };
}
const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SummaryCmpd);
