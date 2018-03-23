/**
 * Created by abradley on 14/03/2018.
 */
import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import { Typeahead } from 'react-typeahead';

class Header extends React.Component {
  render() {
    return <Navbar>
                <Typeahead
                    labelKey="name"
                    options={this.props.target_id_list}
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