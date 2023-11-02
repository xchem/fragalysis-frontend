import { Grid } from "@material-ui/core";
import React, { memo, useState } from "react";
import { ServicesStatus } from "./ServicesStatus";
import { getServiceStatus } from "./api/api";

export const ServicesStatusWrapper = memo(() => {
    const [services, setServices] = useState([]);

    /**
     * Fetch status of services every 30 seconds
     */
    const fetchServiceStatus = () => {
        setTimeout(() => new Promise(async () => {
            const temp = await getServiceStatus();
            setServices(temp);
        }), 30000);
    }

    fetchServiceStatus();

    if (services.length > 0) {
        return <Grid item>
            <ServicesStatus services={services} />
        </Grid>;
    } else {
        return null;
    }
});