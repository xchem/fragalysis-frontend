/**
 * Created by abradley on 14/03/2018.
 */

import React from "react";
import {Navbar, Nav, NavItem} from "react-bootstrap";
import {Typeahead} from "react-typeahead";
import * as apiActions from "../actions/apiActions";
import * as nglActions from "../actions/nglLoadActions";
import {connect} from "react-redux";
import * as nglObjectTypes from "../components/nglObjectTypes";
import {withRouter, Link} from "react-router-dom";
import TargetList from "./targetList";

class Header extends React.Component {

    constructor(props) {
        super(props)
        this.getTargetList = this.getTargetList.bind(this);
        this.selectTarget = this.selectTarget.bind(this);
        this.generateTargetObject = this.generateTargetObject.bind(this);
    }

    getViewUrl(pk, get_view) {
        var base_url = window.location.protocol + "//" + window.location.host
        base_url += "/viewer/"+get_view+"/"+pk.toString()+"/"
        return base_url
    }

    generateTargetObject(targetData) {
        // Now deal with this target
        var prot_to_load = targetData.protein_set[0]
        if(prot_to_load!=undefined) {
            var out_object = {
                "name": "PROTEIN_" + prot_to_load.toString(),
                "prot_url": this.getViewUrl(prot_to_load, "prot_from_pk"),
                "OBJECT_TYPE": nglObjectTypes.PROTEIN
            }
            return out_object
        }
        return undefined;
    }

    getTargetList() {
        var newArray = []
        for(var key in this.props.target_id_list){
        newArray.push(this.props.target_id_list[key].title)
        }
        return newArray;
    }


    selectTarget(option) {
        this.props.history.push("/viewer/react/preview/target/" + option)
    }

  render() {
      var landing = "/viewer/react/landing";
      var login = "/accounts/login"
      var logout = "/accounts/logout"
      var new_ele;
      var username = DJANGO_CONTEXT["username"];
      if (username=="NOT_LOGGED_IN"){
          new_ele = <a href={login}>Login</a>
      }
      else{
          new_ele = <a>
              <b>Hello {username}!</b>
              <a href={logout}>Logout</a>
          </a>
      }

    return <Navbar>
        <Navbar.Header>
            <Navbar.Brand>
                <Link to={landing}>Home</Link>
            </Navbar.Brand>
        </Navbar.Header>
        {new_ele}
        <Typeahead
            labelKey="name"
            onOptionSelected={this.selectTarget}
            options={this.getTargetList()}
            placeholder="Choose a target..."
        />
        <Nav pullRight>
            <NavItem eventKey={1} href="#">
                Save Page
            </NavItem>
        </Nav>
        <TargetList key="TARGLIST" render={false}/>
      </Navbar>
  }
}

function mapStateToProps(state) {
  return {
      appOn: state.apiReducers.present.appOn,
      target_id_list: state.apiReducers.present.target_id_list,
      target_on: state.apiReducers.present.target_on
  }
}
const mapDispatchToProps = {
    setMoleculeList: apiActions.setMoleculeList,
    deleteObject: nglActions.deleteObject,
    setAppOn: apiActions.setAppOn,
    loadObject: nglActions.loadObject,
    setTargetOn: apiActions.setTargetOn,
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header))