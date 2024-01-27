import { makeStyles } from "@material-ui/core";
import React, { memo } from "react";

const useStyles = makeStyles(theme => ({
    circle: {
        display: 'flex',
        flex: 1
    }
}));

export const SERVICE_STATUSES = {
    OK: 'OK',
    DEGRADED: 'DEGRADED'
}

export const SERVICE_STATUS_COLORS = {
    OK: 'green',
    DEGRADED: 'orange',
    OTHER: 'red'
}

export const StatusLight = memo(({ service }) => {
    const getColor = (status) => {
        switch (status) {
            case SERVICE_STATUSES.OK:
                return SERVICE_STATUS_COLORS.OK;
            case SERVICE_STATUSES.DEGRADED:
                return SERVICE_STATUS_COLORS.DEGRADED;
            default:
                return SERVICE_STATUS_COLORS.OTHER;
        }
    }
    return <svg height="20" width="20" className={useStyles().circle}>
        <defs>
            <linearGradient id="darkGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="rgba(0,0,0,0.4289916650253851)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
        </defs>
        {/* TODO do not use two circles but use gradient as overlay? */}
        <circle cx="10" cy="10" r="9" fill={getColor(service.state)} />
        <circle cx="10" cy="10" r="9" stroke="#ccc" strokeWidth="1" fill="url('#darkGradient')" />
    </svg>;
});