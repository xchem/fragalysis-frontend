/**
 * Created by abradley on 14/03/2018.
 */
import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import { Typeahead } from 'react-typeahead';
import * as apiActions from '../actions/apiActions'
import { connect } from 'react-redux'


class Header extends React.Component {

    constructor(props){
        super(props)
        this.getTargetList = this.getTargetList.bind(this);
        this.selectTarget = this.selectTarget.bind(this);
    }

    getTargetList(){
        var newArray = new Array()
        for(var key in this.props.target_id_list){
        newArray.push(this.props.target_id_list[key].title)
        }
        return newArray;
    }
    selectTarget(option){
        for(var key in this.props.target_id_list){
            if(this.props.target_id_list[key].title==option){
                this.props.setTargetOn(this.props.target_id_list[key].id)
                break;
            }
        }
    }



  render() {
    return <Navbar>
                <Typeahead
                    labelKey="name"
                    onOptionSelected={this.selectTarget}
                    options={this.getTargetList()}
                    placeholder="Choose a target..."
                />
      </Navbar>
  }
}

function mapStateToProps(state) {
  return {
      target_id_list: state.apiReducers.target_id_list,
      target_on: state.apiReducers.target_on
  }
}
const mapDispatchToProps = {
    setTargetOn: apiActions.setTargetOn,
}
export default connect(mapStateToProps, mapDispatchToProps)(Header)