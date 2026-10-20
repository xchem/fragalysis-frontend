import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { api, METHOD } from '../../utils/api';
import { base_url } from '../routes/constants';

// These checks apply only to the access inspection controls, not existing authentication flows.
export const canInspectAccess = () =>
  Boolean(DJANGO_CONTEXT?.pk && DJANGO_CONTEXT.authenticated) && DJANGO_CONTEXT.username !== 'NOT_LOGGED_IN';

export const getTargetAccessString = target => {
  const tas = target?.project?.target_access_string;
  return !target?.isLegacy && typeof tas === 'string' ? tas.trim() : '';
};

const text = value => (typeof value === 'string' ? value.trim() : '');

export const fetchAccessEntries = async tas => {
  const response = await api({
    url: `${base_url}/api/${tas === undefined ? 'user' : 'tas'}/`,
    method: METHOD.GET,
    ...(tas !== undefined && { params: { tas } })
  });
  const data = response.data;
  if (data?.ping !== undefined && data.ping !== 'OK') {
    throw new Error('The access service is unavailable. Please try again.');
  }

  const entries = tas === undefined ? data?.target_access : data?.users;
  if (!Array.isArray(entries)) {
    throw new Error('The access service returned an unexpected response. Please try again.');
  }

  return entries
    .map(entry => {
      const row =
        typeof entry === 'string'
          ? { id: text(entry), name: '' }
          : tas !== undefined && entry && typeof entry === 'object'
          ? {
              id: text(entry.preferred_username),
              name: [text(entry.given_name), text(entry.family_name)].filter(Boolean).join(' ')
            }
          : null;
      if (!row?.id) {
        throw new Error('The access service returned an unexpected response. Please try again.');
      }
      return row;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
};
