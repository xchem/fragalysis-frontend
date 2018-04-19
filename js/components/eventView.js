/**
 * Created by abradley on 19/04/2018.
 */
import React from 'react';


class EventView extends React.Component {

    constructor(props) {
        super(props);
        this.data = props.data;
    }

    render(){
        return this.data.xtal;
    }
}

function mapStateToProps(state) {
  return {

  }
}
const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(EventView);