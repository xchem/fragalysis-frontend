/**
 * Created by abradley on 22/03/2018.
 */

import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import {Slider} from './generalComponents'


class MoleculeSlider extends Slider{

    constructor(props) {
        super(props);
        this.slider_name = "MOLECULE"
    }
}

function mapStateToProps(state) {
  return {
      object_list: state.apiReducers.molecule_list,
      object_on: state.apiReducers.molecule_on
  }
}
const mapDispatchToProps = {
    setObjectOn: apiActions.setMoleculeOn
}
export default connect(mapStateToProps, mapDispatchToProps)(MoleculeSlider);
