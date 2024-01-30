import { Grid, Table, TableBody, TableCell, TableRow, Tooltip, makeStyles, styled } from "@material-ui/core";
import React, { memo } from "react";
import { ServiceStatus } from "./ServiceStatus";
import { StatusLight } from "./StatusLight";
import { tooltipClasses } from "@mui/material";

const useStyles = makeStyles(theme => ({
    cell: {
        color: theme.palette.primary.contrastText
    }
}));

export const ServicesStatus = memo(({ services }) => {

    const classes = useStyles();

    const NoMaxWidthTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))({
        [`& .${tooltipClasses.tooltip}`]: {
            maxWidth: 'none'
        }
    });

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0
        }
    }));

    return <NoMaxWidthTooltip title={<Table><TableBody>
        {services.map((service) => <StyledTableRow key={service.id}>
            <TableCell className={classes.cell}><StatusLight service={service} /></TableCell>
            <TableCell className={classes.cell}>{service.state}</TableCell>
            <TableCell className={classes.cell}>{service.name}</TableCell>
        </StyledTableRow>)}
    </TableBody></Table>}>
        <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
            {services.map((service) =>
                <ServiceStatus key={`status-${service.id}`} service={service} />
            )}
        </Grid>
    </NoMaxWidthTooltip>
});