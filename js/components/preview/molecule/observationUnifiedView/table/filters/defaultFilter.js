import React, { memo } from "react";
import { makeStyles } from "@material-ui/core"
import { FilterWrapper } from "./filterWrapper";

const useStyles = makeStyles(theme => ({
    leftSide: {
        textAlign: "right",
        paddingRight: 9,
        "& > *": {
            fontWeight: "bold"
        }
    },
    row: {
        padding: 2
    },
    deleteButton: {
        marginRight: 10
    }
}));

export const DefaultFilter = memo(() => {

    return <FilterWrapper title="Default Filter">
        Default Filter
    </FilterWrapper>;
});
