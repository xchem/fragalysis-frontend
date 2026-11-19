import React, { useRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import fs from 'fs';
import { runInNewContext } from 'vm';
import ts from 'typescript';
import { useMoorhenInteractionPreferences } from './useMoorhenInteractionPreferences';

// Use the installed navbar and Preferences structure, including their ordering.
// Replace positioning/animation and unrelated menus, which need the WASM host.
const installedNavBar = () => {
  const bundle = fs.readFileSync(require.resolve('moorhen'), 'utf8');
  const marker = bundle.lastIndexOf('sourceMappingURL=data:');
  const sourceMap = JSON.parse(Buffer.from(bundle.slice(bundle.indexOf('base64,', marker) + 7), 'base64'));
  const Container = ({ children }) => <div>{children}</div>;
  const state = {
    hoveringStates: { hoveredAtom: {} },
    generalStates: { cootInitialized: true, devMode: false, showHoverInfo: false },
    glRef: {},
    backupSettings: {},
    shortcutSettings: {},
    labelSettings: {},
    sceneSettings: { width: 1200, height: 800, isDark: true }
  };
  const dependencies = {
    react: React,
    '@mui/icons-material': require('@mui/icons-material'),
    '@mui/material': {
      ...require('@mui/material'),
      Popper: ({ open, children }) => (open ? children : null),
      Grow: ({ children }) => children,
      ClickAwayListener: ({ children }) => children
    },
    'react-bootstrap': {
      Form: require('react-bootstrap').Form,
      InputGroup: require('react-bootstrap').InputGroup,
      Stack: Container,
      Overlay: ({ show, children }) => (show ? children : null),
      Popover: Object.assign(Container, { Body: Container })
    },
    'react-redux': { useSelector: selector => selector(state), useDispatch: () => jest.fn() },
    '../../utils/utils': {
      convertRemToPx: value => value * 16,
      convertViewtoPx: (value, size) => (value * size) / 100
    },
    '../modal/MoorhenShortcutConfigModal': { MoorhenShortcutConfigModal: () => null }
  };
  [
    'MoorhenGLFontMenuItem',
    'MoorhenScoresToastPreferencesMenuItem',
    'MoorhenBackupPreferencesMenuItem',
    'MoorhenDefaultBondSmoothnessPreferencesMenuItem',
    'MoorhenViewLayoutPreferencesMenuItem',
    'MoorhenRefinementSettingsMenuItem',
    'MoorhenMouseSensitivitySettingsMenuItem'
  ].forEach(name => {
    dependencies[`../menu-item/${name}`] = { [name]: () => <div>{name}</div> };
  });
  dependencies['../menu-item/MoorhenMapContourSettingsMenuItem'] = { MapContourSettingsMenuItem: () => null };
  const load = name => {
    const source =
      sourceMap.sourcesContent[
        sourceMap.sources.findIndex(path => path.endsWith(`/src/components/navbar-menus/${name}.tsx`))
      ];
    const compiled = ts.transpileModule(source, {
      fileName: `${name}.tsx`,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, jsx: ts.JsxEmit.React }
    });
    const exports = {};
    runInNewContext(compiled.outputText, { exports, document, React, require: name => dependencies[name] || {} });
    return exports;
  };
  dependencies['./MoorhenPreferencesMenu'] = load('MoorhenPreferencesMenu');
  return load('MoorhenNavBar').MoorhenNavBar;
};

const NativeNavBar = installedNavBar();

const Harness = ({ getViewerAdapter, ready = true }) => {
  const commandCentre = useRef(null);
  const timeCapsuleRef = useRef(null);
  const extraNavBarMenus = useMoorhenInteractionPreferences(getViewerAdapter, 'major_view', ready);
  return (
    <NativeNavBar
      commandCentre={commandCentre}
      timeCapsuleRef={timeCapsuleRef}
      extraNavBarMenus={extraNavBarMenus}
      extraNavBarModals={[]}
      includeNavBarMenuNames={[]}
      urlPrefix="/moorhen"
    />
  );
};

const openPreferences = view => {
  fireEvent.click(view.getByRole('button', { name: 'Moorhen' }));
  fireEvent.click(view.getByRole('menuitem', { name: 'Preferences' }));
};

describe('moorhen interaction preferences', () => {
  it('adds one switch to native Preferences, defaults off and updates contacts in both directions', async () => {
    expect.hasAssertions();
    let finish;
    const adapter = {
      setNglStyleInteractions: jest.fn(
        () =>
          new Promise(resolve => {
            finish = resolve;
          })
      )
    };
    const getViewerAdapter = jest.fn(() => adapter);
    const view = render(
      <React.StrictMode>
        <Harness getViewerAdapter={getViewerAdapter} />
      </React.StrictMode>
    );
    openPreferences(view);
    expect(view.getAllByRole('menuitem', { name: 'Preferences' })).toHaveLength(1);
    const developerMode = view.getByText('Developer mode').closest('.moorhen-input-group-check');
    const control = view.getByRole('switch', { name: 'NGL style interactions' });
    const slot = control.closest('.moorhen-input-group-check').parentElement;
    expect(developerMode.nextElementSibling).toBe(slot);
    expect(slot.nextElementSibling.tagName).toBe('HR');
    expect(control).not.toBeChecked();
    fireEvent.click(control);
    expect(control).toBeChecked();
    expect(control).toBeDisabled();
    expect(view.getByRole('status')).toHaveTextContent('Updating interactions...');
    expect(getViewerAdapter).toHaveBeenCalledWith('major_view');
    expect(adapter.setNglStyleInteractions).toHaveBeenLastCalledWith(true);
    await act(async () => finish());
    expect(control).toBeEnabled();
    fireEvent.click(view.getByRole('menuitem', { name: 'Preferences' }));
    expect(view.queryByRole('switch')).not.toBeInTheDocument();
    fireEvent.click(view.getByRole('menuitem', { name: 'Preferences' }));
    const reopened = view.getByRole('switch', { name: 'NGL style interactions' });
    expect(view.getByText('Developer mode').closest('.moorhen-input-group-check').nextElementSibling).toContainElement(
      reopened
    );
    expect(reopened).toBeChecked();
    fireEvent.click(reopened);
    expect(adapter.setNglStyleInteractions).toHaveBeenLastCalledWith(false);
    await act(async () => finish());
    expect(reopened).not.toBeChecked();
    expect(adapter.setNglStyleInteractions).toHaveBeenCalledTimes(2);
  });

  it('restores the switch and reports rendering failures without closing native Preferences', async () => {
    expect.hasAssertions();
    const adapter = {
      setNglStyleInteractions: jest.fn(async () => {
        throw new Error('Worker unavailable');
      })
    };
    const view = render(<Harness getViewerAdapter={() => adapter} />);
    openPreferences(view);
    const control = view.getByRole('switch', { name: 'NGL style interactions' });
    await act(async () => fireEvent.click(control));
    expect(control).not.toBeChecked();
    expect(control).toBeEnabled();
    expect(view.getByRole('alert')).toHaveTextContent('Worker unavailable');
    expect(view.getByText('Developer mode')).toBeInTheDocument();
  });

  it('disables the switch until the adapter is ready', () => {
    expect.hasAssertions();
    const getViewerAdapter = jest.fn();
    const view = render(<Harness getViewerAdapter={getViewerAdapter} ready={false} />);
    openPreferences(view);
    const control = view.getByRole('switch', { name: 'NGL style interactions' });
    expect(control).toBeDisabled();
    fireEvent.click(control);
    expect(getViewerAdapter).not.toHaveBeenCalled();
  });
});
