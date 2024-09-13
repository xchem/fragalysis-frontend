import { Grid } from "@material-ui/core";
import React, { memo, useCallback, useContext, useEffect, useState } from "react";
import { ServicesStatus } from "./ServicesStatus";
import { getServicesStatus } from "./api/api";
import { ToastContext } from "../toast";
import { SERVICE_STATUSES } from "./constants";

export const ServicesStatusWrapper = memo(() => {
    const [services, setServices] = useState([]);
    const { toastError } = useContext(ToastContext);

    const checkServices = useCallback((previous, current) => {
        if (previous.length > 0) {
            // update timestamps for services
            current.forEach(newService => {
                const currentService = previous.find(previousService => previousService.id === newService.id);
                // remember previous value
                newService.timestamp = currentService?.timestamp;
                if (currentService && currentService.state !== newService.state) {
                    if (![SERVICE_STATUSES.OK, SERVICE_STATUSES.DEGRADED].includes(newService.state)) {
                        newService.timestamp = Date.now();
                    } else {
                        // clear timestamp
                        newService.timestamp = null;
                    }
                }
            });
        } else {
            // initial set
            current.forEach(service => {
                if (![SERVICE_STATUSES.OK, SERVICE_STATUSES.DEGRADED].includes(service.state)) {
                    service.timestamp = Date.now();
                } else {
                    service.timestamp = null;
                }
            });
        }
    }, []);

    const fetchServicesStatus = useCallback(async () => {
        const temp = await getServicesStatus();
        if (!!!temp || temp.length === 0) {
            setServices((prevState) => {
                // do not spam same message
                if (!(prevState.length === 1 && prevState[0]?.id === 'services')) {
                    toastError('Status of services is not available');
                }
                const newTemp = [{ id: 'services', name: 'Status of services', state: 'NOT_AVAILABLE', timestamp: Date.now() }];
                checkServices(prevState, newTemp);
                return newTemp;
            });
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