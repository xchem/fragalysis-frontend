import { Grid, makeStyles, Tooltip } from "@material-ui/core";
import classNames from "classnames";
import React, { memo, useCallback } from "react";
import { getAllTagsForLHSCmp } from "../../../../tags/utils/tagUtils";

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
    },
    smallConformerSite: {
        height: 16,
        lineHeight: 1
    }
}));

export const ConformerSiteView = memo(({ tagList, observations, conformerSitesCategory, canonSitesTag, resolveTagBackgroundColor, resolveTagForegroundColor }) => {

    const classes = useStyles();

    /**
     * Get ConformerSites tags for render and modify for larger set
     */
    const getConformerSites = useCallback(() => {
        let conformerSites = conformerSitesCategory
            ? getAllTagsForLHSCmp(observations, tagList, []).filter(tag => tag.category === conformerSitesCategory.id)
            : [];

        if (conformerSites.length > 3) {
            conformerSites = conformerSites.slice(0, 2);
            conformerSites.push({ tag_prefix: '3+', color: 'orange' });
        }
        return conformerSites;
    }, [conformerSitesCategory, observations, tagList]);

    return <Grid container direction="column" justifyContent="flex-start" alignItems="stretch" wrap="nowrap">
        {getConformerSites().map((conformerSite, i, sites) => (
            <Tooltip
                key={conformerSite.id + i}
                title={<div style={{ whiteSpace: 'pre-line' }}>ConformerSite - {conformerSite.tag}</div>}
            >
                <Grid
                    item
                    xs
                    className={classNames(classes.contColMenu, classes.contColButtonMenu, {
                        [classes.smallConformerSite]: sites.length >= 3
                    })}
                    style={{
                        backgroundColor: resolveTagBackgroundColor(conformerSite),
                        color: resolveTagForegroundColor(conformerSite),
                        borderBottom: i === sites.length - 1 ? 1 : 0,
                        borderRight: 0
                    }}
                >
                    {conformerSite.tag_prefix.replace(canonSitesTag.tag_prefix, '')}
                </Grid>
            </Tooltip>
        ))}
    </Grid>;
});