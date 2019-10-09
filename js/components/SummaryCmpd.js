/**
 * Created by abradley on 28/03/2018.
 */

import React from "react";
import { connect } from "react-redux";
import { GenericView } from "./generalComponents";
import SVGInline from "react-svg-inline";

class SummaryCmpd extends GenericView {
  constructor(props) {
    super(props);
    this.base_url = window.location.protocol + "//" + window.location.host;
    this.update = this.update.bind(this);
    this.getAtomIndices = this.getAtomIndices.bind(this);
    this.smiles = "";
  }

  loadFromServer(width, height) {
    var url = this.url;
    var get_params = {
      width: width,
      height: height
    };
    Object.keys(get_params).forEach(key =>
      url.searchParams.append(key, get_params[key])
    );
    if (url.toString() != this.old_url) {
      fetch(url)
        .then(
          response => response.text(),
          error => console.log("An error occurred.", error)
        )
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
        if (optionList[index][newIndex] == "NA") {
          newList.push(101);
        } else {
          newList.push(optionList[index][newIndex]);
        }
      }

      var newStr = newList.join(",");
      outStrList.push(newStr);
    }
    return outStrList.join(",");
  }

  update(props) {
    var atomIndices = this.getAtomIndices(props);
    this.url = new URL(this.base_url + "/viewer/img_from_smiles/");
    var get_params;
    if (props.to_query == "") {
      this.smiles = props.to_query;
      return;
    } else if (atomIndices == undefined) {
      get_params = { smiles: props.to_query };
    } else {
      get_params = { smiles: props.to_query, atom_indices: atomIndices };
    }
    Object.keys(get_params).forEach(key =>
      this.url.searchParams.append(key, get_params[key])
    );
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
