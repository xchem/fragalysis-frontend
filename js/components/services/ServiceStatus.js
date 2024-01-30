import { Grid } from "@material-ui/core";
import React, { memo } from "react";
import { StatusLight } from "./StatusLight";

export const ServiceStatus = memo(({ service }) => {
    return <Grid item>
        <StatusLight service={service} />
    </Grid>;
});