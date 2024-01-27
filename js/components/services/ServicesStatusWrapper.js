import { Grid } from "@material-ui/core";
import React, { memo, useCallback, useContext, useEffect, useState } from "react";
import { ServicesStatus } from "./ServicesStatus";
import { getServicesStatus } from "./api/api";
import { ToastContext } from "../toast";

export const ServicesStatusWrapper = memo(() => {
    const [services, setServices] = useState([]);
    const { toastError, toastInfo } = useContext(ToastContext);

    const checkServices = useCallback((previous, current) => {
        if (previous.length > 0) {
            const changedServices = current.filter(newService => {
                const currentService = previous.find(previousService => previousService.id === newService.id);
                if (currentService && currentService.state !== newService.state) {
                    return true;
                }
                return false;
            });
            changedServices.forEach(service => toastInfo(`Status of ${service.name} changed to ${service.state}`));
        }
    }, [toastInfo]);

    const fetchServicesStatus = useCallback(async () => {
        const temp = await getServicesStatus();
        if (!!!temp || temp.length === 0) {
            toastError('Status of services is not available');
            setServices([{ id: 'services', name: 'Status of services', state: 'NOT_AVAILABLE' }]);
        } else {
            setServices((prevState) => {
                checkServices(prevState, temp);
                return temp;
            });
        }
    }, [checkServices, toastError]);

    useEffect(() => {
        fetchServicesStatus();
        // fetch status of services every 30 seconds
        const interval = setInterval(fetchServicesStatus, 30000);
        return () => {
            clearInterval(interval);
        }
    }, [fetchServicesStatus]);

    return <Grid item>
        <ServicesStatus services={services} />
    </Grid>;
});