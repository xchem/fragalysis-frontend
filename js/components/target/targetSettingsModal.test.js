import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { ThemeProvider } from '../../ui/styles';
import { getTheme } from '../../theme';
import { api } from '../../utils/api';
import { TargetSettingsModal } from './targetSettingsModal';

jest.mock('../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../../utils/api', () => ({ api: jest.fn(), METHOD: { GET: 'GET', PATCH: 'PATCH', POST: 'POST' } }));

describe('landing graph settings', () => {
  it.each([true, false])(
    'loads and saves graph/blog fields alongside existing settings (active target: %s)',
    async isTargetOn => {
      expect.hasAssertions();
      jest.clearAllMocks();
      const target = {
        id: 1,
        title: 'Target',
        display_name: 'Target',
        short_name: '',
        long_name: '',
        organism: '',
        alias_order: [],
        project: { id: 10, alias: 'Alias' },
        settings: {
          preserved_setting: { value: 'keep' },
          electron_density_map_type: 'event',
          crystallographic_binding_events: 40,
          bound_compounds: 30,
          associated_affinity_measurements: 20,
          measured_compounds: 10,
          blog_url: 'https://example.org/blog'
        }
      };
      const state = {
        apiReducers: { target_on: 1, target_on_name: 'Target', target_on_aliases: [], target_id_list: [target] },
        selectionReducers: { targetToEdit: target }
      };
      const store = legacy_createStore((current = state) => current);
      api.mockImplementation(request =>
        Promise.resolve({
          data: request.url.includes('/target-blogs/')
            ? request.method === 'GET'
              ? { results: [{ id: 7, target: 1, title: 'Blog', url: 'https://example.org/api-blog' }] }
              : { id: 7, target: 1, ...request.data }
            : request.method === 'GET'
            ? { results: [] }
            : request.data
        })
      );
      const onClose = jest.fn();
      render(
        <Provider store={store}>
          <ThemeProvider theme={getTheme()}>
            <TargetSettingsModal openModal onModalClose={onClose} isTargetOn={isTargetOn} />
          </ThemeProvider>
        </Provider>
      );
      expect(await screen.findByText('https://example.org/api-blog')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled());
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByPlaceholderText('enter measured compounds')).toHaveValue('10');
      fireEvent.change(screen.getByPlaceholderText('enter blog URL'), {
        target: { value: 'https://example.org/new-blog' }
      });
      fireEvent.change(screen.getByPlaceholderText('enter measured compounds'), { target: { value: '15' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(api).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/api/targets/1/'),
          method: 'PATCH',
          data: expect.objectContaining({
            settings: expect.objectContaining({
              preserved_setting: { value: 'keep' },
              electron_density_map_type: 'event',
              crystallographic_binding_events: 40,
              bound_compounds: 30,
              associated_affinity_measurements: 20,
              measured_compounds: '15',
              blog_url: 'https://example.org/blog'
            })
          })
        })
      );
      expect(api).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/api/target-blogs/7/'),
          method: 'PATCH',
          data: expect.objectContaining({ url: 'https://example.org/new-blog' })
        })
      );
      expect(api).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/api/projects/10/'),
          method: 'PATCH',
          data: { alias: 'Alias' }
        })
      );
    }
  );
});
