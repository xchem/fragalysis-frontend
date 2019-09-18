/**
 * Created by abradley on 14/03/2018.
 */

import { Grid, withStyles } from "@material-ui/core";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import * as nglLoadActions from "../actions/nglLoadActions";
import MoleculeView from "./moleculeView";
import BorderedView from "./borderedView";
import classNames from "classnames";

const styles = () => ({
    container: {
        height: '100%',
        width: '100%',
        color: 'black'
    },
    gridItemHeader: {
        height: '32px',
        fontSize: '8px',
        color: '#7B7B7B'
    },
    gridItemHeaderVert: {
        width: '24px',
        transform: 'rotate(-90deg)'
    },
    gridItemHeaderHoriz: {
        width: 'calc((100% - 48px) * 0.3)',
    },
    gridItemHeaderHorizWider: {
        width: 'calc((100% - 48px) * 0.4)',
    },
    gridItemList: {
        overflow: 'auto',
        // - 72px for title and header items
        height: 'calc(100% - 72px)'
    },
    centered: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

class MoleculeList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLECULE;
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }
    render() {
        const { classes, object_list, height } = this.props;
        var imgSize = 100;
        if (object_list) {
            console.log(this.props.message)
            return (
                <BorderedView title="hit navigator">
                    <Grid container direction="column" className={classes.container} style={{ height: height }}>
                        <Grid item container className={classes.gridItemHeader}>
                            <Grid item className={classNames(classes.gridItemHeaderVert, classes.centered)}>
                                site
                        </Grid>
                            <Grid item className={classNames(classes.gridItemHeaderVert, classes.centered)}>
                                cont.
                        </Grid>
                            <Grid item container direction="column" justify="center" alignItems="center" className={classes.gridItemHeaderHoriz}>
                                <Grid item>code</Grid>
                                <Grid item>status</Grid>
                            </Grid>
                            <Grid item className={classNames(classes.gridItemHeaderHoriz, classes.centered)}>
                                image
                        </Grid>
                            <Grid item className={classNames(classes.gridItemHeaderHorizWider, classes.centered)}>
                                properties
                        </Grid>
                        </Grid>
                        <Grid item container direction="column" wrap="nowrap" className={classes.gridItemList}>
                            {
                                object_list.map(data => (
                                    <Grid item key={data.id}>
                                        <MoleculeView height={imgSize} width={imgSize} data={data} />
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </Grid>
                </BorderedView>
            )
        }
        else {
            return null;
        }
    }
}
function mapStateToProps(state) {
  return {
      group_type: state.apiReducers.present.group_type,
      target_on: state.apiReducers.present.target_on,
      mol_group_on: state.apiReducers.present.mol_group_on,
      object_selection: state.apiReducers.present.mol_group_selection,
      object_list: state.apiReducers.present.molecule_list,
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setMoleculeList,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,

}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MoleculeList));
