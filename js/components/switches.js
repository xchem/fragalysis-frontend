/**
 * Created by ricgillams on 8/10/2018.
 */

import React, {Component} from "react";
import Header from "./header";
import {ErrorView} from "./errorComponent";
import Tindspect from "../containers/tindspectHolder";
import FraggleBox from "../containers/fraggleBoxHolder";
import Preview from "../containers/previewHolder";
import Landing from "../containers/landingHolder";
import {Route, Switch} from "react-router-dom";

class Switches extends Component {
    render() {
        return <div>
            <Header></Header>
            <ErrorView></ErrorView>
            <Switch>
                <Route exact path="/viewer/react/landing" component={Landing}/>
                <Route exact path="/viewer/react/preview" component={Preview}/>
                <Route exact path="/viewer/react/preview/target/:target" component={Preview}/>
                <Route exact path="/viewer/react/tindspect" component={Tindspect}/>
                <Route path="/viewer/react/fragglebox/:uuid" component={FraggleBox}/>
            </Switch>
        </div>
    }
}

export default Switches