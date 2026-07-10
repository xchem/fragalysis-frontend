import fs from 'fs';
import path from 'path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button, Dialog, FormControl, Grid, IconButton, Popover, TextField, Tooltip } from './index';
import { Close, ExpandLess, ExpandMore, Search } from './icons';
import { createTheme, makeStyles, StyledEngineProvider, ThemeProvider, useTheme, withStyles } from './styles';
import { TextField as SharedTextField } from '../components/common/Inputs/TextField';
import { Paper as SharedPaper } from '../components/common/Surfaces/Paper';

const useCompatibilityStyles = makeStyles({
  root: {
    color: props => props.color
  },
  selected: {},
  selectable: {
    '&$selected': {
      backgroundColor: 'rgb(1, 2, 3)'
    }
  }
});

const CompatibilityButton = withStyles(theme => ({
  root: {
    marginTop: theme.spacing(1)
  }
}))(Button);

const CompatibilityStyleProbe = () => {
  const classes = useCompatibilityStyles({ color: 'rgb(4, 5, 6)' });

  return (
    <div>
      <div className={classes.root} data-testid="dynamic-style" />
      <div className={`${classes.selectable} ${classes.selected}`} data-testid="referenced-style" />
      <CompatibilityButton>Styled action</CompatibilityButton>
    </div>
  );
};

const getDocumentCss = () =>
  Array.from(document.styleSheets)
    .flatMap(styleSheet => Array.from(styleSheet.cssRules || []))
    .map(rule => rule.cssText)
    .join('\n');

const listSourceFiles = directory =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listSourceFiles(entryPath);
    return /\.jsx?$/.test(entry.name) ? [entryPath] : [];
  });

describe('MUI compatibility layer', () => {
  it.each([
    ['Button', Button],
    ['Dialog', Dialog],
    ['Popover', Popover],
    ['Tooltip', Tooltip],
    ['Grid', Grid],
    ['TextField', TextField],
    ['IconButton', IconButton],
    ['FormControl', FormControl],
    ['Close', Close],
    ['ExpandLess', ExpandLess],
    ['ExpandMore', ExpandMore],
    ['Search', Search],
    ['createTheme', createTheme],
    ['makeStyles', makeStyles],
    ['StyledEngineProvider', StyledEngineProvider],
    ['ThemeProvider', ThemeProvider],
    ['useTheme', useTheme],
    ['withStyles', withStyles]
  ])('exports %s through the local boundary', (name, exportedValue) => {
    expect(exportedValue).toBeDefined();
  });

  it('renders shared form and surface components through the boundary', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <SharedPaper>
          <SharedTextField id="compound" label="Compound" />
        </SharedPaper>
      </ThemeProvider>
    );

    expect(screen.getByRole('textbox', { name: 'Compound' })).toBeInTheDocument();
  });

  it('supports legacy dynamic values, referenced selectors and withStyles', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <CompatibilityStyleProbe />
      </ThemeProvider>
    );

    const css = getDocumentCss();

    expect(screen.getByTestId('dynamic-style').className).toContain('root');
    expect(screen.getByTestId('referenced-style').className).toContain('selected');
    expect(screen.getByRole('button', { name: 'Styled action' }).className).toContain('root');
    expect(css).toContain('color: rgb(4, 5, 6)');
    expect(css).toContain('background-color: rgb(1, 2, 3)');
    expect(css).toContain('margin-top: 8px');
  });

  it('keeps direct MUI imports out of shared components', () => {
    const commonRoot = path.resolve(__dirname, '..', 'components', 'common');
    const guardedFiles = [
      ...listSourceFiles(commonRoot),
      path.resolve(__dirname, '..', 'components', 'tooltip', 'RichTooltip.js')
    ];
    const directMuiImport = /from\s+['"]@(?:material-ui|mui)\//;
    const matches = guardedFiles
      .filter(filename => directMuiImport.test(fs.readFileSync(filename, 'utf8')))
      .map(filename => path.relative(path.resolve(__dirname, '..'), filename));

    expect(matches).toEqual([]);
  });

  it('keeps Material UI v4 imports and dependencies out of the project', () => {
    const projectRoot = path.resolve(__dirname, '..', '..');
    const sourceFiles = listSourceFiles(path.resolve(projectRoot, 'js'));
    const legacyImport = /(?:from\s+|require\()['"]@material-ui\//;
    const matches = sourceFiles
      .filter(filename => legacyImport.test(fs.readFileSync(filename, 'utf8')))
      .map(filename => path.relative(projectRoot, filename));
    const packageManifest = fs.readFileSync(path.resolve(projectRoot, 'package.json'), 'utf8');

    expect(matches).toEqual([]);
    expect(packageManifest).not.toContain('"@material-ui/');
    expect(packageManifest).not.toContain('"@mui/styles"');
  });

  it('keeps the Emotion cache, theme and error boundary in the required order', () => {
    const rootSource = fs.readFileSync(path.resolve(__dirname, '..', 'components', 'root.js'), 'utf8');
    const cacheProviderStart = rootSource.indexOf('<CacheProvider');
    const themeProviderStart = rootSource.indexOf('<ThemeProvider');
    const errorBoundaryStart = rootSource.indexOf('<ErrorBoundary>');
    const errorBoundaryEnd = rootSource.indexOf('</ErrorBoundary>');
    const themeProviderEnd = rootSource.indexOf('</ThemeProvider>');
    const cacheProviderEnd = rootSource.indexOf('</CacheProvider>');

    expect(cacheProviderStart).toBeGreaterThan(-1);
    expect(themeProviderStart).toBeGreaterThan(cacheProviderStart);
    expect(errorBoundaryStart).toBeGreaterThan(themeProviderStart);
    expect(errorBoundaryEnd).toBeGreaterThan(errorBoundaryStart);
    expect(themeProviderEnd).toBeGreaterThan(errorBoundaryEnd);
    expect(cacheProviderEnd).toBeGreaterThan(themeProviderEnd);
  });
});
