/**
 * Created by abradley on 11/10/2018.
 */
import React from "react";
import fetch from "cross-fetch";
import {connect} from "react-redux";


class RefinementOutcome extends React.Component{

    constructor(props) {
        super(props);
        var base_url = window.location.protocol + "//" + window.location.host
        this.base_url = base_url;
        this.getUrl = this.getUrl.bind(this);
        this.state = {refinementOutcome: undefined}
    }

    getUrl() {
        var get_view = "/api/molannotation/?mol_id=" + this.props.data.id.toString()
        return new URL(this.base_url + get_view)
    }

    convertJson(input_json){
        var results = input_json["result"]
        for (var index in results){
            var result = results[index];
            if (result["annotation_type"]=="ligand_confidence"){
                var result_text = result["annotation_text"]
                var int_conf = parseInt(result_text);
            }
        }
        if (int_conf){
            this.setState(prevState => ({refinementOutcome: int_conf}))
        }
        else{
            this.setState(prevState => ({refinementOutcome: undefined}))

        }
    }

    componentDidMount() {
        const url = this.getUrl();
        fetch(url).then(
            response => response.json(),
            error => console.log('An error occurred.', error)
        )
            .then(
                json => this.convertJson(json)
            )
    }

    render() {
        if(this.state.refinementOutcome==undefined){
            return <Label bsStyle="default">{"Undefined"}</Label>;
        }
        else if (this.state.refinementOutcome==6){
            return <Label bsStyle="success">{"Refined"}</Label>;
        }
    }


}
function mapStateToProps(state) {
  return {
  }
}
const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(RefinementOutcome);