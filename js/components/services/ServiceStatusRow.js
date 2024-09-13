import { TableCell, TableRow, makeStyles, styled } from "@material-ui/core";
import React, { memo, useEffect, useRef, useState } from "react";
import { StatusLight } from "./StatusLight";

const useStyles = makeStyles(theme => ({
    cell: {
        color: theme.palette.primary.contrastText
    }
}));

export const ServiceStatusRow = memo(({ service }) => {

    const classes = useStyles();
    const interval = useRef(null);
    const [uptime, setUptime] = useState(0);

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0
        }
    }));

    useEffect(() => {
        if (service.timestamp) {
            interval.current = setInterval(() => {
                setUptime(Date.now() - service.timestamp);
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval.current);
            }
        }
    }, [service, interval]);

    const getServiceDowntime = () => {
        if (uptime) {
            let minutes = Math.floor(uptime / (1000 * 60));
            let seconds = Math.floor(uptime / (1000) % 60);
            if (minutes) {
                return `${minutes} m ${seconds} s`;
            } else {
                return `${seconds} s`;
            }
        } else {
            return '';
        }
    }

    return <StyledTableRow>
        <TableCell className={classes.cell}><StatusLight service={service} /></TableCell>
        <TableCell className={classes.cell}>{service.state}</TableCell>
        <TableCell className={classes.cell}>{service.name}</TableCell>
        <TableCell className={classes.cell}>{getServiceDowntime()}</TableCell>
    </StyledTableRow>;
});