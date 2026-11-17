import React, { Profiler } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import RichTooltip from './RichTooltip';
import { TooltipPathProvider } from './TooltipPathContext';

describe('tooltip Markdown compatibility', () => {
  it('renders Markdown and preserves safe link overrides after the parser upgrade', async () => {
    expect.hasAssertions();
    render(
      <RichTooltip
        path="compatibility"
        tooltipProvider={() => ({
          compatibility: { text: '**Help** with `ligands` and [docs](https://example.test/)' }
        })}
        enterDelay={0}
      >
        <button>Tooltip trigger</button>
      </RichTooltip>
    );

    fireEvent.mouseOver(screen.getByRole('button', { name: 'Tooltip trigger' }));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.querySelector('strong')).toHaveTextContent('Help');
    expect(tooltip.querySelector('code')).toHaveTextContent('ligands');
    const link = screen.getByRole('link', { name: 'docs' });
    expect(link).toHaveAttribute('href', 'https://example.test/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('tooltip initialization work', () => {
  it('defers Markdown style generation until the tooltip opens', async () => {
    expect.hasAssertions();
    const cache = createCache({ key: 'tooltip-startup' });
    const css = () => cache.sheet.tags.flatMap(tag => Array.from(tag.sheet.cssRules, rule => rule.cssText)).join('\n');
    render(
      <CacheProvider value={cache}>
        <RichTooltip path="help" tooltipProvider={() => ({ help: { text: 'Some `code`' } })} enterDelay={0}>
          <button>Help</button>
        </RichTooltip>
      </CacheProvider>
    );
    expect(css()).not.toContain('monospace');
    fireEvent.mouseOver(screen.getByRole('button', { name: 'Help' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Some code');
    expect(css()).toContain('monospace');
  });

  it('shares window Shift listeners and removes them when the last tooltip unmounts', () => {
    expect.hasAssertions();
    const add = jest.spyOn(window, 'addEventListener');
    const remove = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <div>
        {Array.from({ length: 30 }, (_, id) => (
          <RichTooltip key={id} path={`item${id}`}>
            <button>{id}</button>
          </RichTooltip>
        ))}
      </div>
    );
    expect(add.mock.calls.filter(([name]) => name === 'keydown')).toHaveLength(1);
    expect(add.mock.calls.filter(([name]) => name === 'keyup')).toHaveLength(1);
    unmount();
    expect(remove.mock.calls.filter(([name]) => name === 'keydown')).toHaveLength(1);
    expect(remove.mock.calls.filter(([name]) => name === 'keyup')).toHaveLength(1);
    add.mockRestore();
    remove.mockRestore();
  });

  it('updates Shift paths only for engaged tooltips and supports Shift held before hovering', async () => {
    expect.hasAssertions();
    const commits = [jest.fn(), jest.fn()];
    render(
      <TooltipPathProvider path="preview">
        {commits.map((commit, id) => (
          <Profiler key={id} id={String(id)} onRender={commit}>
            <RichTooltip path={`item${id}`} enterDelay={0}>
              <button>Help {id}</button>
            </RichTooltip>
          </Profiler>
        ))}
      </TooltipPathProvider>
    );
    commits.forEach(commit => commit.mockClear());
    fireEvent.keyDown(window, { key: 'Shift', shiftKey: true });
    expect(commits[0]).not.toHaveBeenCalled();
    expect(commits[1]).not.toHaveBeenCalled();
    fireEvent.mouseOver(screen.getByRole('button', { name: 'Help 0' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('preview.item0');
    expect(commits[1]).not.toHaveBeenCalled();
    fireEvent.keyUp(window, { key: 'Shift' });
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('retains help, Shift path hints and Alt interaction through content entry and exit', async () => {
    expect.hasAssertions();
    jest.useFakeTimers();
    const { unmount } = render(
      <TooltipPathProvider path="preview">
        <RichTooltip
          path="help"
          tooltipProvider={() => ({ preview: { help: { text: '[Docs](https://example.test/)', showHelp: true } } })}
          enterDelay={0}
        >
          <button>Help</button>
        </RichTooltip>
      </TooltipPathProvider>
    );
    const anchor = screen.getByRole('button', { name: 'Help' });
    fireEvent.mouseOver(anchor);
    act(() => jest.advanceTimersByTime(200));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Hold Alt');
    fireEvent.keyDown(window, { key: 'Shift', shiftKey: true });
    expect(tooltip).toHaveTextContent('preview.help');
    fireEvent.keyUp(window, { key: 'Shift' });
    expect(tooltip).not.toHaveTextContent('preview.help');
    fireEvent.mouseLeave(anchor);
    fireEvent.mouseOver(tooltip, { altKey: true });
    act(() => jest.advanceTimersByTime(200));
    expect(screen.getByRole('link', { name: 'Docs' })).toBeVisible();
    fireEvent.mouseLeave(tooltip);
    act(() => jest.advanceTimersByTime(200));
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    unmount();
    jest.useRealTimers();
  });
});
