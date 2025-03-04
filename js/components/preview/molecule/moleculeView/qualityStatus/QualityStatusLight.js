import React, { memo } from "react";
import { QUALITY_STATUSES, QUALITY_STATUS_COLORS } from "./constants";
import { LightCircle } from "../../../../services";

export const QualityStatusLight = memo(({ status, size = 15, className }) => {
    const getColor = (status) => {
        switch (status) {
            case QUALITY_STATUSES.GOOD:
                return QUALITY_STATUS_COLORS.GOOD;
            case QUALITY_STATUSES.MEDIOCRE:
                return QUALITY_STATUS_COLORS.MEDIOCRE;
            case QUALITY_STATUSES.BAD:
                return QUALITY_STATUS_COLORS.BAD;
            default:
                return QUALITY_STATUS_COLORS.NONE;
        }
    }
    return <LightCircle color={getColor(status)} size={size} className={className} />;
});