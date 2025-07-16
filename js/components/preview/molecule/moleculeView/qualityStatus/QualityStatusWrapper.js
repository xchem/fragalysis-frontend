import { Grid, IconButton, makeStyles, Popover, Table, TableBody, TableCell, TableRow, Tooltip } from "@material-ui/core";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QualityStatusLight } from "./QualityStatusLight";
import { useSelector } from "react-redux";
import { QUALITY_STATUS_COLORS, QUALITY_STATUSES } from "./constants";
import { MoreHoriz } from "@material-ui/icons";
import { QualityStatusModal } from "./QualityStatusModal";

const useStyles = makeStyles(theme => ({
    posePropertiesTable: {
        pointerEvents: 'auto'
    },
    posePropertiesTableCell: {
        padding: 4
    },
    wrapper: {
        position: 'relative',
        height: '100%',
        width: '100%',
        '&:hover': {
            cursor: 'pointer'
        }
    },
    pizza: {
        height: 17,
        width: 17,
        borderRadius: '50%',
        position: 'absolute',
        // top: -9,
        left: 2
    },
    pizzaLight: {
        position: 'absolute',
        top: 1,
        left: 3
    }
}));

export const QualityStatusWrapper = memo(({ data }) => {

    const allStatuses = useSelector(state => state.apiReducers.quality_statuses);
    const [qualityStatuses, setQualityStatuses] = useState([]);
    const [latestPeerReviews, setLatestPeerReviews] = useState([]);
    const classes = useStyles();

    useEffect(() => {
        // filter out default statuses created on load
        const statuses = allStatuses.filter(status => status.site_observation === data.main_site_observation && status.comment !== 'Created on load');
        if (statuses) {
            setQualityStatuses(statuses);
        }
    }, [allStatuses, data]);

    useEffect(() => {
        if (qualityStatuses) {
            const userMap = {};
            qualityStatuses.forEach(status => {
                if (!(status.user in userMap) && status.main_status === false) {
                    userMap[status.user] = status;
                }
            });
            setLatestPeerReviews(Object.values(userMap));
        }
    }, [qualityStatuses]);

    const getMainQualityStatusObject = useCallback(() => {
        return qualityStatuses?.find(status => status.main_status === true);
    }, [qualityStatuses]);

    const mainQualityStatus = useMemo(() => {
        const status = getMainQualityStatusObject() ? getMainQualityStatusObject().status : QUALITY_STATUSES.OTHER;
        return status;
    }, [getMainQualityStatusObject]);

    const getStatusCount = useCallback((type) => {
        let count = 0;
        latestPeerReviews.forEach(status => {
            if (status.status === type) count++;
        });
        return count;
    }, [latestPeerReviews]);

    const pizzaGradient = useMemo(() => {
        let gradient = '';
        let latest = 0;
        const totalReviews = latestPeerReviews.length;
        Object.values(QUALITY_STATUSES).map(status => {
            const count = getStatusCount(status);
            if (count > 0) {
                const current = latest + (count / totalReviews * 100);
                gradient += `${QUALITY_STATUS_COLORS[status]} ${latest}% ${(current)}%, `;
                latest = current;
            }
        });
        // remove trailing comma and space
        gradient = gradient.slice(0, -2);
        return gradient;
    }, [getStatusCount, latestPeerReviews.length]);

    const peerReviewsButtonRef = useRef(null);
    const statusLightDivRef = useRef(null);
    const [anchorElModal, setAnchorElModal] = useState(null);
    const [anchorElQualityStatus, setAnchorElQualityStatus] = useState(null);
    const [tableIsOpen, setTableIsOpen] = useState(false);

    const handleEditDialogOpen = useCallback(event => {
        setAnchorElQualityStatus(event.currentTarget);
    }, []);

    const handleEditDialogOpenFromLight = useCallback(event => {
        peerReviewsButtonRef.current?.click()
    }, []);

    const isValidMouseEvent = (event) => {
        // allow only pizza lights and its circle children gradient
        return event.target?.classList.contains(classes.pizzaLight) || event.target?.classList.contains(classes.pizza) || event.target?.tagName === 'circle';
    };
    const handleStatusMouseEnter = (event) => {
        // chrome & edge fire mouseleave event after closing the modal so we need to check the target
        if (isValidMouseEvent(event)) {
            setAnchorElModal(statusLightDivRef?.current);
        }
    };
    const handleStatusMouseLeave = (event) => {
        if (!tableIsOpen && isValidMouseEvent(event)) {
            setAnchorElModal(null);
        }
    };

    const handleQualityStatusSummaryTooltipLeave = useCallback(() => {
        setTableIsOpen(false);
        if (!Boolean(anchorElQualityStatus)) {
            setAnchorElModal(null);
        }
    }, [anchorElQualityStatus]);

    const handleModalPopoverClose = () => {
        setAnchorElModal(null);
        setTableIsOpen(false);
    };
    const handleModalClose = () => {
        handleModalPopoverClose();
        setAnchorElQualityStatus(null);
    };

    const popoverOpen = Boolean(anchorElQualityStatus) || Boolean(anchorElModal) || tableIsOpen;

    const getQualityStatusSummaryTooltip = useCallback(() => {
        return <Table className={classes.posePropertiesTable}
            onMouseLeave={handleQualityStatusSummaryTooltipLeave}
            onMouseEnter={() => setTableIsOpen(true)}>
            <TableBody>
                <TableRow>
                    <Tooltip title={getMainQualityStatusObject()?.user ? `${getMainQualityStatusObject().first_name} ${getMainQualityStatusObject().last_name}` : 'no user'}>
                        <TableCell className={classes.posePropertiesTableCell}>
                            <QualityStatusLight status={mainQualityStatus} />
                        </TableCell>
                    </Tooltip>
                    <TableCell className={classes.posePropertiesTableCell}>:</TableCell>
                    {latestPeerReviews.map((status, index) => {
                        return <Tooltip key={index} title={status.user ? `${status.first_name} ${status.last_name}` : 'no user'}>
                            <TableCell className={classes.posePropertiesTableCell}>
                                <QualityStatusLight status={status.status} />
                            </TableCell>
                        </Tooltip>
                    })}
                    <TableCell className={classes.posePropertiesTableCell}>
                        <Tooltip title={'Add reviews'}>
                            <IconButton size="small" onClick={handleEditDialogOpen} ref={peerReviewsButtonRef}>
                                <MoreHoriz />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>;
    }, [latestPeerReviews, handleEditDialogOpen, getMainQualityStatusObject, mainQualityStatus, classes.posePropertiesTable, classes.posePropertiesTableCell, handleQualityStatusSummaryTooltipLeave]);

    return <Grid item
        ref={statusLightDivRef}
        className={classes.wrapper}
        onMouseEnter={handleStatusMouseEnter}
        onMouseLeave={handleStatusMouseLeave}
    >
        <div style={{ background: `conic-gradient(${pizzaGradient})` }}
            className={classes.pizza}
        ></div>
        <QualityStatusLight status={mainQualityStatus} props={{
            className: classes.pizzaLight,
            onClick: handleEditDialogOpenFromLight
        }} />
        <Popover
            id="mouse-over-popover"
            style={{ pointerEvents: 'none' }}
            open={popoverOpen}
            anchorEl={anchorElModal}
            anchorOrigin={{
                vertical: 'center',
                horizontal: 'right'
            }}
            transformOrigin={{
                vertical: 'center',
                horizontal: 'left'
            }}
            onClose={handleModalPopoverClose}
            disableRestoreFocus
        >
            {getQualityStatusSummaryTooltip()}
        </Popover>
        <QualityStatusModal
            openModal={Boolean(anchorElQualityStatus)}
            onModalClose={handleModalClose}
            statuses={qualityStatuses}
            latestPeerReviews={latestPeerReviews}
            site_observation={data.main_site_observation}
            anchorElQualityStatus={anchorElQualityStatus}
        />
    </Grid>;
});