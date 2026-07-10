import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeaderContext, HeaderProvider } from './headerContext';

const HeaderConsumer = () => {
  const { headerNavbarTitle, setHeaderNavbarTitle } = useContext(HeaderContext);

  return (
    <>
      <h1>{headerNavbarTitle || 'Untitled'}</h1>
      <button type="button" onClick={() => setHeaderNavbarTitle('Fragalysis')}>
        Set title
      </button>
    </>
  );
};

describe('HeaderProvider', () => {
  it('shares header state with its consumers', async () => {
    const user = userEvent.setup();

    render(
      <HeaderProvider>
        <HeaderConsumer />
      </HeaderProvider>
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Untitled');

    await user.click(screen.getByRole('button', { name: 'Set title' }));

    expect(screen.getByRole('heading')).toHaveTextContent('Fragalysis');
  });
});
