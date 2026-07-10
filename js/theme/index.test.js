import fs from 'fs';
import path from 'path';
import { getTheme } from './index';

const listSourceFiles = directory =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listSourceFiles(entryPath);
    return /\.jsx?$/.test(entry.name) ? [entryPath] : [];
  });

describe('application theme', () => {
  it('preserves the Material UI v4 defaults used by the application', () => {
    const theme = getTheme();

    expect(theme.components.MuiButton.defaultProps.color).toBe('inherit');
    expect(theme.components.MuiCheckbox.defaultProps.color).toBe('secondary');
    expect(theme.components.MuiIconButton.defaultProps.size).toBe('large');
    expect(theme.components.MuiLink.defaultProps.underline).toBe('hover');
    expect(theme.components.MuiTabs.defaultProps).toEqual({
      indicatorColor: 'secondary',
      textColor: 'inherit'
    });
    expect(theme.components.MuiTextField.defaultProps.variant).toBe('standard');
    expect(theme.components.MuiTooltip.defaultProps.enterDelay).toBe(1000);
    expect(theme.spacing(1)).toBe('8px');
    expect(theme.typography.fontSize).toBe(12);
    expect(theme.zIndex.drawer).toBeGreaterThan(theme.zIndex.appBar);
  });

  it('does not treat the MUI v5 spacing result as a number', () => {
    const sourceFiles = listSourceFiles(path.resolve(__dirname, '..'));
    const unsafeSpacing = [
      /-theme\.spacing/,
      /theme\.spacing\([^)]*\)[ \t]*[+*/-]/,
      /[0-9)][ \t]*\*[ \t]*theme\.spacing/,
      /\$\{theme\.spacing\([^)]*\)\}px/
    ];
    const matches = sourceFiles
      .filter(filename => unsafeSpacing.some(pattern => pattern.test(fs.readFileSync(filename, 'utf8'))))
      .map(filename => path.relative(path.resolve(__dirname, '..'), filename));

    expect(matches).toEqual([]);
  });
});
