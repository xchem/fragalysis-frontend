import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormikTextField } from './index';

describe('FormikTextField', () => {
  it('maps Formik errors and submitting state to the MUI field', () => {
    render(
      <FormikTextField
        id="title"
        label="Title"
        field={{ name: 'title', value: '', onBlur: jest.fn(), onChange: jest.fn() }}
        form={{ errors: { title: 'Required' }, touched: { title: true }, isSubmitting: true }}
      />
    );

    const input = screen.getByRole('textbox', { name: 'Title' });
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
