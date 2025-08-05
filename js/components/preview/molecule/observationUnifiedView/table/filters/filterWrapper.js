import React, { memo, useRef, useState } from "react";
import { IconButton, Popper, Tooltip, makeStyles } from "@material-ui/core"
import { Panel } from "../../../../../common";
import { Close } from "@material-ui/icons";
import { Circle, FilterAlt, RestartAlt } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
    filterButton: {
        padding: 0,
        color: theme.palette.grey[500],
        // marginRight: 2,
        position: 'absolute',
        right: 3
    },
    filterActiveDot: {
        padding: 0,
        color: theme.palette.error.main,
        // marginRight: 2,
        position: 'absolute',
        right: 6,
        top: 1
    },
    filterWrapper: {
        '& *': {
            fontSize: 13
        },
        '& .filter-header': {
            textDecoration: 'underline'
        }
    }
}));

export const FilterWrapper = memo(({ title, children, isActive = false, handleReset = null }) => {

    const ref = useRef(null);
    const classes = useStyles();

    const [showEditTagsModal, setShowEditTagsModal] = useState(false);

    const id = showEditTagsModal ? `simple-popover-filter-editor-${title}` : undefined;

    const handleCloseModal = () => {
        if (showEditTagsModal) {
            setShowEditTagsModal(false);
            // reset
        }
    };

    const handleEditTagsButton = () => {
        setShowEditTagsModal(!showEditTagsModal);
    };

    return (<>
        <IconButton
            size="small"
            className={classes.filterButton}
            onClick={() => handleEditTagsButton()}
            ref={ref}
        >
            <FilterAlt sx={{ fontSize: 20 }} />
        </IconButton>
        {!!isActive && <IconButton
            size="small"
            className={classes.filterActiveDot}
            onClick={() => handleEditTagsButton()}
        >
            <Circle sx={{ fontSize: 5 }} />
        </IconButton>}
        <Popper id={id} open={showEditTagsModal} anchorEl={ref?.current} placement={"right-end"} className={classes.filterWrapper} >
            <Panel
                title={title}
                hasHeader
                secondaryBackground
                headerActions={[
                    handleReset && <Tooltip title="Reset filter">
                        <IconButton
                            color="inherit"
                            // className={classes.headerButton}
                            onClick={handleReset}
                        >
                            <RestartAlt />
                        </IconButton>
                    </Tooltip>,
                    <Tooltip title="Close filter">
                        <IconButton
                            color="inherit"
                            // className={classes.headerButton}
                            onClick={handleCloseModal}
                        >
                            <Close />
                        </IconButton>
                    </Tooltip>
                ]}
            >
                {children}
            </Panel>
        </Popper></>);
});
