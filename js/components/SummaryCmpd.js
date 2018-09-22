/**
 * Created by abradley on 28/03/2018.
 */

import React from "react";
import {connect} from "react-redux";
import {GenericView} from "./generalComponents";
import SVGInline from "react-svg-inline";

class SummaryCmpd extends GenericView {

    constructor(props) {
        super(props);
        this.base_url = window.location.protocol + "//" + window.location.host
        this.update = this.update.bind(this);
        this.smiles = ""
    }

    loadFromServer(width, height) {
        var url = this.url;
        var get_params = {
            "width": width,
            "height": height,
        }
        Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]))
        if(url.toString() != this.old_url) {
            fetch(url)
                .then(
                    response => response.text(),
                    error => console.log('An error occurred.', error)
                )
                .then(text =>  this.setState(prevState => ({img_data: text})))
        }
        this.old_url = url.toString();
    }

    getIsotopes(input_string){
        var res_array = input_string.split("Xe")
        var new_array = []
        res_array.pop()
        for(var index in res_array){
            var new_int = parseInt(res_array[index].slice(-3))
            new_array.push(new_int)
        }
        return new_array
    }

    update(props) {
        var isotopes = this.getIsotopes(nextProps.this_vector_list[Object.keys(nextProps.this_vector_list)]["vector"])
        this.url = new URL(this.base_url + '/viewer/img_from_smiles/')
        var get_params = {"smiles": props.to_query, "isotopes": Array.join(isotopes)}
        Object.keys(get_params).forEach(key => this.url.searchParams.append(key, get_params[key]))
        this.loadFromServer(props.width, props.height);
        this.smiles = props.to_query
    }


    componentWillReceiveProps(nextProps){
        this.update(nextProps);
    }


    componentDidMount() {

    }
    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        return <div onClick={this.handleClick} >{svg_image}</div>
    }

}

function mapStateToProps(state) {
  return {
      to_query: state.selectionReducers.present.to_query
      this_vector_list: state.selectionReducers.present.this_vector_list,
  }
}
const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryCmpd);