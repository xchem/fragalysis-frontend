import React, { memo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getQualityStatuses } from "./api/api";
import { setQualityStatusesAction } from "./api/apiActions";

export const QualityStatusService = memo(() => {

    const dispatch = useDispatch();

    const fetchServicesStatus = useCallback(async () => {
        const temp = await getQualityStatuses();
        if (!!!temp || temp.length === 0) {
            dispatch(setQualityStatusesAction([]));
        } else {
            dispatch(setQualityStatusesAction(temp));
        }
    }, [dispatch]);

    useEffect(() => {
        fetchServicesStatus();
        // fetch status of services every 60 seconds
        const interval = setInterval(fetchServicesStatus, 60000);
        return () => {
            clearInterval(interval);
        }
    }, [fetchServicesStatus]);

    return <></>;
});