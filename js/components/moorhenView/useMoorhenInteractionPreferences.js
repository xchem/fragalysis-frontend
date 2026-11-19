import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SettingsSuggestOutlined } from '@mui/icons-material';
import { USE_NGL_STYLE_INTERACTIONS } from '../../config/viewer';

const PreferencesTogglePlacement = ({ children }) => {
  const markerRef = useRef(null);
  const [slot, setSlot] = useState(null);

  useLayoutEffect(() => {
    // The native menu has no insertion slot. Add our own portal container after
    // Developer mode without moving any of Moorhen's React-owned elements.
    const nativeMenu = markerRef.current?.previousElementSibling;
    const developerMode = Array.from(nativeMenu?.querySelectorAll('.moorhen-input-group-check') || []).find(
      group => group.querySelector('label')?.textContent === 'Developer mode'
    );
    if (!developerMode) return;
    const container = document.createElement('div');
    developerMode.after(container);
    setSlot(container);
    return () => container.remove();
  }, []);

  return (
    <>
      <span ref={markerRef} hidden />
      {slot ? createPortal(children, slot) : children}
    </>
  );
};

export const useMoorhenInteractionPreferences = (getViewerAdapter, viewId, ready) => {
  const [enabled, setEnabled] = useState(USE_NGL_STYLE_INTERACTIONS);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const preferencesRef = useRef(null);
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  const inputId = useId();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onChange = useCallback(
    async event => {
      if (!ready || pendingRef.current) return;
      const next = event.target.checked;
      const previous = enabled;
      pendingRef.current = true;
      setEnabled(next);
      setUpdating(true);
      setError('');
      try {
        const adapter = getViewerAdapter(viewId);
        if (!adapter) throw new Error('The viewer is not ready');
        await adapter.setNglStyleInteractions(next);
      } catch (changeError) {
        if (mountedRef.current) {
          setEnabled(previous);
          setError(`Unable to update interactions: ${changeError.message || changeError}`);
        }
      } finally {
        pendingRef.current = false;
        if (mountedRef.current) setUpdating(false);
      }
    },
    [enabled, getViewerAdapter, ready, viewId]
  );

  // Moorhen 0.22.7 appends an extra menu's JSX after the built-in content with
  // the same name. Keep a stable ref and the native Preferences icon/position.
  return useMemo(
    () => [
      {
        name: 'Preferences',
        ref: preferencesRef,
        icon: <SettingsSuggestOutlined />,
        JSXElement: (
          <PreferencesTogglePlacement>
            <div className="moorhen-input-group-check" style={{ maxWidth: '100%' }}>
              <div className="form-check form-switch">
                <input
                  id={inputId}
                  type="checkbox"
                  role="switch"
                  className="form-check-input"
                  checked={enabled}
                  disabled={!ready || updating}
                  onChange={onChange}
                />
                <label className="form-check-label" htmlFor={inputId}>
                  NGL style interactions
                </label>
              </div>
              {updating && <div role="status">Updating interactions...</div>}
              {error && <div role="alert">{error}</div>}
            </div>
          </PreferencesTogglePlacement>
        )
      }
    ],
    [enabled, error, inputId, onChange, ready, updating]
  );
};
