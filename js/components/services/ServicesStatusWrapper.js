import { Grid } from "@material-ui/core";
import React, { memo, useEffect, useState } from "react";
import { ServicesStatus } from "./ServicesStatus";
import { getServicesStatus } from "./api/api";

export const ServicesStatusWrapper = memo(() => {
    const [services, setServices] = useState([]);

    const fetchServicesStatus = async () => {
        const temp = await getServicesStatus();
        if (!!!temp || temp.length === 0) {
            setServices([{ id: 'services', name: 'Status of services', state: 'NOT_AVAILABLE' }]);
        } else {
            setServices(temp);
        }
    }

    useEffect(() => {
        fetchServicesStatus();
        // fetch status of services every 30 seconds
        const interval = setInterval(fetchServicesStatus, 30000);
        return () => {
            clearInterval(interval);
        }
    }, []);

    return <Grid item>
        <ServicesStatus services={services} />
    </Grid>;
});