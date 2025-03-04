import { makeStyles } from "@material-ui/core";
import classNames from "classnames";
import React, { memo } from "react";

const useStyles = makeStyles(theme => ({
    circle: {
        display: 'flex',
        flex: 1
    }
}));

export const LightCircle = memo(({ color, size = 20, className }) => {

    const cX = size / 2;
    const cY = size / 2;
    const cR = size / 2 - 1;

    return <svg height={size} width={size} className={classNames(useStyles().circle, className)}>
        <defs>
            <linearGradient id="darkGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="rgba(0,0,0,0.4289916650253851)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
        </defs>
        {/* TODO do not use two circles but use gradient as overlay? */}
        <circle cx={cX} cy={cY} r={cR} fill={color} />
        <circle cx={cX} cy={cY} r={cR} stroke="#ccc" strokeWidth="1" fill="url('#darkGradient')" />
    </svg>;
});