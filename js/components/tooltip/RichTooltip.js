// js/components/tooltip/RichTooltip.js

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip, makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { getTooltip, interpolate } from './resolver';
import { useTooltipPath } from './TooltipPathContext';
import { useTootlipProvider } from './TooltipContext';

const DEFAULT_LEAVE_DELAY = 40;
const DEFAULT_TRANSITION_TIMEOUT = { enter: 160, exit: 60 };
const ALT_INTERACTION_HINT = 'Hold Alt while moving into this tooltip to interact with links or copy text.';

const useStyles = makeStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.white || '#fff',
    color: theme.palette.text?.primary || '#000',
    border: `1px solid ${theme.palette.background?.divider || '#ddd'}`,
    borderRadius: 6,
    padding: theme.spacing(1),
    maxWidth: 380,
    fontSize: 12,
    lineHeight: 1.35,
    whiteSpace: 'normal'
  },
  arrow: {
    color: theme.palette.white || '#fff',
    '&:before': {
      border: `1px solid ${theme.palette.background?.divider || '#ddd'}`
    }
  },

  // Wrapper used ONLY when we must wrap (disabled anchor or non-single-element children)
  childWrapper: {
    display: 'inline-flex'
  },

  mdRoot: {
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  },
  footer: {
    marginTop: theme.spacing(0.75),
    paddingTop: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.background?.divider || 'rgba(0,0,0,0.12)'}`,
    color: theme.palette.text?.secondary || 'rgba(0,0,0,0.56)',
    fontSize: 11,
    lineHeight: 1.3
  },
  debugPath: {
    marginTop: theme.spacing(0.5),
    color: theme.palette.text?.secondary || 'rgba(0,0,0,0.56)',
    fontSize: 10,
    lineHeight: 1.2,
    wordBreak: 'break-all'
  },
  p: { margin: 0 },
  h1: { margin: '0 0 6px 0', fontSize: 14, fontWeight: 700 },
  h2: { margin: '0 0 6px 0', fontSize: 13, fontWeight: 700 },
  h3: { margin: '0 0 6px 0', fontSize: 13, fontWeight: 700 },
  ul: { margin: '6px 0', paddingLeft: 18 },
  ol: { margin: '6px 0', paddingLeft: 18 },
  li: { margin: '2px 0' },
  a: { color: 'inherit', textDecoration: 'underline' },
  codeInline: {
    fontFamily: 'monospace',
    fontSize: '0.85em',
    padding: '0 4px',
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.06)'
  },
  pre: {
    fontFamily: 'monospace',
    fontSize: '0.85em',
    padding: theme.spacing(0.75),
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflowX: 'auto',
    whiteSpace: 'pre',
    margin: '6px 0 0 0'
  }
}));

function isDisabledElement(el) {
  if (!React.isValidElement(el)) return false;
  const p = el.props || {};
  return Boolean(p.disabled || p['aria-disabled']);
}

function mergeClassName(existing, extra) {
  if (!extra) return existing || undefined;
  if (!existing) return extra;
  return `${existing} ${extra}`;
}

const RichTooltip = memo(function RichTooltip({
  tooltipProvider,
  path,
  absolutePath = false,
  values,
  fallback = '',
  children,
  className,
  arrow = true,
  placement = 'top',
  enterDelay = 300,
  leaveDelay = DEFAULT_LEAVE_DELAY,
  interactive = true,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  PopperProps: popperPropsProp,
  TransitionProps: transitionPropsProp,
  ...tooltipProps
}) {
  const classes = useStyles();

  const { resolve } = useTooltipPath();
  const { provider } = useTootlipProvider();

  const [isOpen, setIsOpen] = useState(false);
  const [shiftDown, setShiftDown] = useState(false);
  const isOpenRef = useRef(false);
  const anchorHoveredRef = useRef(false);
  const anchorFocusedRef = useRef(false);
  const tooltipHoveredRef = useRef(false);
  const tooltipInteractiveRef = useRef(false);
  const popperLeaveTimerRef = useRef(null);

  const tooltips = useMemo(() => {
    if (tooltipProvider) return tooltipProvider();
    if (provider) return provider();
    return {};
  }, [provider, tooltipProvider]);

  const fullPath = useMemo(() => resolve(path, { absolute: absolutePath }), [resolve, path, absolutePath]);
  // console.log(`FullPath: ${fullPath}`);
  const tooltipEntry = useMemo(() => getTooltip(tooltips, fullPath, fallback), [tooltips, fullPath, fallback]);
  let resolvedTooltipEntry = useMemo(() => interpolate(tooltipEntry, values), [tooltipEntry, values]);
  const mergedTransitionProps = useMemo(() => {
    return {
      timeout:
        transitionPropsProp && transitionPropsProp.timeout !== undefined
          ? transitionPropsProp.timeout
          : DEFAULT_TRANSITION_TIMEOUT,
      ...transitionPropsProp
    };
  }, [transitionPropsProp]);

  const openTooltip = event => {
    clearTimeout(popperLeaveTimerRef.current);
    popperLeaveTimerRef.current = null;

    if (isOpenRef.current) return;
    isOpenRef.current = true;
    setIsOpen(true);
    if (onOpenProp) onOpenProp(event);
  };

  const closeTooltip = event => {
    clearTimeout(popperLeaveTimerRef.current);
    popperLeaveTimerRef.current = null;

    tooltipHoveredRef.current = false;
    tooltipInteractiveRef.current = false;

    if (!isOpenRef.current) return;

    isOpenRef.current = false;
    setIsOpen(false);
    if (onCloseProp) onCloseProp(event);
  };
  const mergedPopperProps = {
    ...popperPropsProp,
    onMouseOver: event => {
      clearTimeout(popperLeaveTimerRef.current);
      popperLeaveTimerRef.current = null;
      tooltipHoveredRef.current = true;

      if (popperPropsProp && popperPropsProp.onMouseOver) {
        popperPropsProp.onMouseOver(event);
      }

      if (!interactive) {
        closeTooltip(event);
        return;
      }

      if (event.altKey || tooltipInteractiveRef.current) {
        tooltipInteractiveRef.current = true;
        openTooltip(event);
        return;
      }

      closeTooltip(event);
    },
    onMouseLeave: event => {
      tooltipHoveredRef.current = false;

      if (popperPropsProp && popperPropsProp.onMouseLeave) {
        popperPropsProp.onMouseLeave(event);
      }

      if (anchorHoveredRef.current || anchorFocusedRef.current) return;

      event.persist?.();
      popperLeaveTimerRef.current = setTimeout(() => {
        if (anchorHoveredRef.current || anchorFocusedRef.current) return;
        closeTooltip(event);
      }, leaveDelay);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Ensure it clears when tooltip closes
      setShiftDown(false);
      return;
    }

    const onKeyDown = e => {
      if (e.key === 'Shift') setShiftDown(true);
    };

    const onKeyUp = e => {
      if (e.key === 'Shift') setShiftDown(false);
    };

    window.addEventListener('keydown', onKeyDown, { passive: true });
    window.addEventListener('keyup', onKeyUp, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      clearTimeout(popperLeaveTimerRef.current);
      popperLeaveTimerRef.current = null;
      anchorHoveredRef.current = false;
      anchorFocusedRef.current = false;
      tooltipHoveredRef.current = false;
      tooltipInteractiveRef.current = false;
      isOpenRef.current = false;
    };
  }, []);

  if (!resolvedTooltipEntry || !resolvedTooltipEntry.text) {
    resolvedTooltipEntry = {
      text: fullPath,
      showHelp: false
    };
  }
  // if (!interpolatedMarkdown) return children;

  const childIsElement = React.isValidElement(children);
  const childIsDisabled = childIsElement && isDisabledElement(children);

  const mustWrap = !childIsElement || childIsDisabled;

  let anchorChild;

  if (mustWrap) {
    anchorChild = (
      <span
        className={classNames(classes.childWrapper, className)}
        onMouseOver={() => {
          anchorHoveredRef.current = true;
          clearTimeout(popperLeaveTimerRef.current);
          popperLeaveTimerRef.current = null;
        }}
        onMouseLeave={() => {
          anchorHoveredRef.current = false;
        }}
        onFocus={() => {
          anchorFocusedRef.current = true;
          clearTimeout(popperLeaveTimerRef.current);
          popperLeaveTimerRef.current = null;
        }}
        onBlur={() => {
          anchorFocusedRef.current = false;
        }}
      >
        {children}
      </span>
    );
  } else {
    anchorChild = React.cloneElement(children, {
      className: mergeClassName(children.props && children.props.className, className),
      onMouseOver: event => {
        anchorHoveredRef.current = true;
        clearTimeout(popperLeaveTimerRef.current);
        popperLeaveTimerRef.current = null;
        if (children.props && children.props.onMouseOver) children.props.onMouseOver(event);
      },
      onMouseLeave: event => {
        anchorHoveredRef.current = false;
        if (children.props && children.props.onMouseLeave) children.props.onMouseLeave(event);
      },
      onFocus: event => {
        anchorFocusedRef.current = true;
        clearTimeout(popperLeaveTimerRef.current);
        popperLeaveTimerRef.current = null;
        if (children.props && children.props.onFocus) children.props.onFocus(event);
      },
      onBlur: event => {
        anchorFocusedRef.current = false;
        if (children.props && children.props.onBlur) children.props.onBlur(event);
      }
    });
  }

  return (
    <Tooltip
      arrow={arrow}
      placement={placement}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      interactive={interactive}
      open={isOpen}
      PopperProps={mergedPopperProps}
      TransitionProps={mergedTransitionProps}
      classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
      onOpen={openTooltip}
      onClose={e => {
        if (tooltipHoveredRef.current && tooltipInteractiveRef.current) return;
        closeTooltip(e);
      }}
      title={
        <div
          className={classes.mdRoot}
          onMouseLeave={() => {
            tooltipHoveredRef.current = false;
          }}
        >
          <Markdown
            options={{
              forceBlock: true,
              overrides: {
                p: { props: { className: classes.p } },
                h1: { props: { className: classes.h1 } },
                h2: { props: { className: classes.h2 } },
                h3: { props: { className: classes.h3 } },
                ul: { props: { className: classes.ul } },
                ol: { props: { className: classes.ol } },
                li: { props: { className: classes.li } },
                a: { props: { className: classes.a, target: '_blank', rel: 'noopener noreferrer' } },
                pre: { props: { className: classes.pre } },
                code: { props: { className: classes.codeInline } }
              }
            }}
          >
            {resolvedTooltipEntry.text}
          </Markdown>
          {resolvedTooltipEntry.showHelp && <div className={classes.footer}>{ALT_INTERACTION_HINT}</div>}
          {isOpen && shiftDown && <div className={classes.debugPath}>{fullPath}</div>}
        </div>
      }
      {...tooltipProps}
    >
      {anchorChild}
    </Tooltip>
  );
});

export default RichTooltip;
