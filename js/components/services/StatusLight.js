import React, { memo } from "react";
import { SERVICE_STATUSES, SERVICE_STATUS_COLORS } from "./constants";
import { LightCircle } from "./LightCircle";

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
    return <LightCircle color={getColor(service.state)} />;
});