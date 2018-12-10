/**
 * Created by ricgillams on 8/10/2018.
 */

import keydown from "react-keydown";
import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import * as selectionActions from "../actions/selectionActions";
import Switches from "./switches";

const KEYS = [ 'left', 'right', '0', '1', '2', '3', '4', '5' ];
@keydown( KEYS )
class UserInputCapture extends Component {

    constructor(props) {
        super(props)
        this.handleCursor = this.handleCursor.bind(this);
        this.highlightFirstCompound = this.highlightFirstCompound.bind(this);
    }

    handleCursor(keyCode) {
        if (JSON.stringify(this.props.this_vector_list) == JSON.stringify({})) {
            return;
        }
        var defaultSet = {
            index: 0,
            smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)].addition[0].end
        };
        if (keyCode === 37) {
            console.log('left cursor');
            if (Object.keys(this.props.highlightedCompound).length == 0) {
                this.props.setHighlighted(defaultSet)
            }
            else {
                var indexToSet = Math.max(this.props.highlightedCompound["index"] - 1, 0)
                this.props.setHighlighted({
                    index: indexToSet,
                    smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)].addition[indexToSet].end
                })
            }
        } else if (keyCode === 39) {
            console.log('right cursor');
            if (Object.keys(this.props.highlightedCompound).length == 0) {
                this.props.setHighlighted(defaultSet)
            }
            else {
                var indexToSet = Math.min(parseInt(this.props.highlightedCompound["index"]) + 1, this.props.this_vector_list[Object.keys(this.props.this_vector_list)].addition.length - 1)
                this.props.setHighlighted({
                    index: indexToSet,
                    smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)].addition[indexToSet].end
                })
            }
        }

        this.highlightFirstCompound()
        var classDict = {48: 0, 49: 1, 50: 2, 51: 3, 52: 4, 53: 5}
        if (keyCode in classDict) {
            var toBuyObj = {
                mol: this.props.to_query,
                smiles: this.props.highlightedCompound.smiles,
                vector: this.props.currentVector,
                class: classDict[keyCode]
            }
            if (keyCode === 48) {
                this.props.removeFromToBuyList(toBuyObj)
            } else {
                this.props.appendToBuyList(toBuyObj)
            }
        }
    }

    highlightFirstCompound() {
        if (Object.keys(this.props.highlightedCompound).length === 0 && this.props.this_vector_list != undefined) {
            if (Object.keys(this.props.this_vector_list).length > 0) {
                this.props.setHighlighted({
                    index: 0,
                    smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][0]
                })
            }
        }
    }

    componentWillReceiveProps({keydown}) {
        if (keydown.event) {
            this.handleCursor(keydown.event.which);
        }
    }

    render() {
        return (
            <Switches></Switches>
        );
    }
}

function mapStateToProps(state) {
  return {
      this_vector_list: state.selectionReducers.present.this_vector_list,
      to_query: state.selectionReducers.present.to_query,
      highlightedCompound: state.selectionReducers.present.highlightedCompound,
      currentVector: state.selectionReducers.present.currentVector,
  }
}
const mapDispatchToProps = {
    setHighlighted: selectionActions.setHighlighted,
    appendToBuyList: selectionActions.appendToBuyList,
    removeFromToBuyList: selectionActions.removeFromToBuyList,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserInputCapture))