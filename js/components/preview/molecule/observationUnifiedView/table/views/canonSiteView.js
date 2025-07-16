import { Grid, makeStyles, Tooltip } from "@material-ui/core";
import classNames from "classnames";
import React, { memo } from "react";

const useStyles = makeStyles(theme => ({
    contColMenu: {
        // ...theme.typography.button,
        border: '1px solid',
        borderLeft: 0,
        alignContent: 'center',
        textAlign: 'center'
    },
    contColButtonMenu: {
        height: '100%',
        // width: '100%',
        minWidth: 20,
        width: 22,
        paddingLeft: theme.spacing(1) / 4,
        paddingRight: theme.spacing(1) / 4,
        paddingBottom: 0,
        paddingTop: 0,
        fontWeight: 'bold',
        fontSize: 14,
        borderRadius: 0,
        borderColor: theme.palette.background.divider,
        // backgroundColor: 'orange',
        '&:hover': {
            // backgroundColor: 'orange'
            // color: theme.palette.primary.contrastText
        },
        '&:disabled': {
            borderRadius: 0,
            borderColor: 'darkorange'
        }
    }
}));

export const CanonSiteView = memo(({ resolveTagBackgroundColor, resolveTagForegroundColor, canonSitesTag }) => {
    const classes = useStyles();
    return <Grid container direction="column" justifyContent="center" alignItems="stretch" wrap="nowrap">
        <Tooltip title={<div style={{ whiteSpace: 'pre-line' }}>CanonSite - {canonSitesTag.tag}</div>}>
            <Grid
                item
                xs
                className={classNames(classes.contColMenu, classes.contColButtonMenu)}
                style={{
                    backgroundColor: resolveTagBackgroundColor(canonSitesTag),
                    color: resolveTagForegroundColor(canonSitesTag)
                }}
            >
                {canonSitesTag.tag_prefix}
            </Grid>
        </Tooltip>
    </Grid>;
});