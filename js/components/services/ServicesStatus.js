import { Grid, Table, TableBody, Tooltip, styled } from "@material-ui/core";
import React, { memo } from "react";
import { ServiceStatus } from "./ServiceStatus";
import { tooltipClasses } from "@mui/material";
import { ServiceStatusRow } from "./ServiceStatusRow";

export const ServicesStatus = memo(({ services }) => {

    const NoMaxWidthTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))({
        [`& .${tooltipClasses.tooltip}`]: {
            maxWidth: 'none'
        }
    });

    return <NoMaxWidthTooltip title={<Table><TableBody>
        {services.map((service, i) => <ServiceStatusRow key={`${service.id}-${i}`} service={service} />)}
    </TableBody></Table>}>
        <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
            {services.map((service, i) =>
                <ServiceStatus key={`status-${service.id}-${i}`} service={service} />
            )}
        </Grid>
    </NoMaxWidthTooltip>
});