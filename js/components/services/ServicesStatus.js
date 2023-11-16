import { Grid } from "@material-ui/core";
import React, { memo } from "react";
import { ServiceStatus } from "./ServiceStatus";

export const ServicesStatus = memo(({ services }) => {
    return <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
        {services.map((service) =>
            <ServiceStatus key={`status-${service.id}`} service={service} />
        )}
    </Grid>
});