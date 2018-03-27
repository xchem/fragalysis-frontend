/**
 * Created by abradley on 22/03/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import {Slider} from './generalComponents'


class MolGroupSlider extends Slider{

    constructor(props) {
        super(props);
        this.slider_name = "Molecule Cluster"
    }
}

function mapStateToProps(state) {
  return {
      object_list: state.apiReducers.mol_group_list,
      object_on: state.apiReducers.mol_group_on
  }
}
const mapDispatchToProps = {
    setObjectOn: apiActions.setMolGroupOn,
    setObjectList: apiActions.setMolGroupList
}
export default connect(mapStateToProps, mapDispatchToProps)(MolGroupSlider);
