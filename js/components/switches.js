/**
 * Created by ricgillams on 8/10/2018.
 */

import React, {Component} from "react";
import Header from "./header";
import {ErrorView} from "./errorComponent";
import TargetManagement from "../containers/targetManagementHolder";
import Fragspect from "../containers/fragspectHolder";
import Landing from "../containers/landingHolder";
import Preview from "../containers/previewHolder";
import Sessions from "../containers/sessionHolder";
import FraggleBox from "../containers/fraggleBoxHolder";
import Funders from "../containers/fundersHolder";
import {Route, Switch} from "react-router-dom";

class Switches extends Component {
    render() {
        return <div>
            <Header></Header>
            <ErrorView></ErrorView>
            <Switch>
                <Route exact path="/viewer/react/targetmanagement" component={TargetManagement}/>
                <Route exact path="/viewer/react/fragspect" component={Fragspect}/>
                <Route exact path="/viewer/react/fragspect/target/:target" component={Fragspect}/>
                <Route exact path="/viewer/react/landing" component={Landing}/>
                <Route exact path="/viewer/react/preview" component={Preview}/>
                <Route exact path="/viewer/react/preview/target/:target" component={Preview}/>
                <Route exact path="/viewer/react/sessions" component={Sessions}/>
                <Route path="/viewer/react/fragglebox/:uuid" component={FraggleBox}/>
                <Route path="/viewer/react/snapshot/:snapshotUuid" component={FraggleBox}/>
                <Route exact path="/viewer/react/funders" component={Funders}/>
            </Switch>
        </div>
    }
}

export default Switches