// js/components/tooltip/RichTooltip.js

import React, { memo, useEffect, useMemo, useState } from 'react';
import { Tooltip, makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { getTooltip, interpolate } from './resolver';
import { useTooltipPath } from './TooltipPathContext';
import { useTootlipProvider } from './TooltipContext';

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
  interactive = true,
  ...tooltipProps
}) {
  const classes = useStyles();

  const { resolve } = useTooltipPath();
  const { provider } = useTootlipProvider();

  const [isOpen, setIsOpen] = useState(false);
  const [shiftDown, setShiftDown] = useState(false);

  const tooltips = useMemo(() => {
    if (tooltipProvider) return tooltipProvider();
    if (provider) return provider();
    return {};
  }, [provider, tooltipProvider]);

  const fullPath = useMemo(() => resolve(path, { absolute: absolutePath }), [resolve, path, absolutePath]);
  // console.log(`FullPath: ${fullPath}`);
  const md = useMemo(() => getTooltip(tooltips, fullPath, fallback), [tooltips, fullPath, fallback]);
  let interpolatedMarkdown = useMemo(() => interpolate(md, values), [md, values]);

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

  if (!interpolatedMarkdown) {
    interpolatedMarkdown = fullPath;
  }
  // if (!interpolatedMarkdown) return children;

  const childIsElement = React.isValidElement(children);
  const childIsDisabled = childIsElement && isDisabledElement(children);

  const mustWrap = !childIsElement || childIsDisabled;

  let anchorChild;

  if (mustWrap) {
    anchorChild = <span className={classNames(classes.childWrapper, className)}>{children}</span>;
  } else {
    anchorChild = React.cloneElement(children, {
      className: mergeClassName(children.props && children.props.className, className)
    });
  }

  return (
    <Tooltip
      arrow={arrow}
      placement={placement}
      enterDelay={enterDelay}
      interactive={interactive}
      classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
      onOpen={e => {
        setIsOpen(true);
        if (tooltipProps.onOpen) tooltipProps.onOpen(e);
      }}
      onClose={e => {
        setIsOpen(false);
        if (tooltipProps.onClose) tooltipProps.onClose(e);
      }}
      title={
        <div className={classes.mdRoot}>
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
            {interpolatedMarkdown}
          </Markdown>
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
