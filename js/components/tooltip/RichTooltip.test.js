import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RichTooltip from './RichTooltip';

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
