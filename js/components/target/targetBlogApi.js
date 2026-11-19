import { api, getCsrfToken, METHOD } from '../../utils/api';
import { base_url, isRemoteDebugging } from '../routes/constants';

const endpoint = `${base_url}/api/target-blogs/`;

export const targetBlogImageUrl = (image, refreshToken) => {
  if (!image) return null;
  const url = new URL(image, base_url);
  const origin = new URL(base_url);
  // The media API emits HTTPS URLs even on the local HTTP Django stack.
  if (url.host === origin.host) {
    url.protocol = origin.protocol;
    // The backend reuses this media URL when the image is replaced.
    if (refreshToken !== undefined) url.searchParams.set('__cacheBust', refreshToken);
  }
  return url.toString();
};

export const fetchTargetBlog = async targetId => {
  const response = await api({ url: endpoint, method: METHOD.GET, params: { target: targetId } });
  const results = response.data?.results;
  if (
    !Array.isArray(results) ||
    results.length > 1 ||
    results.some(blog => !blog.id || String(blog.target) !== String(targetId))
  ) {
    throw new Error('The blog service returned an unexpected response.');
  }
  return results[0] || null;
};

export const saveTargetBlog = async (targetId, blogId, draft) => {
  const fields = {
    ...(!blogId && { target: targetId }),
    title: draft.title.trim(),
    url: draft.url.trim(),
    published: draft.published || null,
    overview: draft.overview
  };
  let data = fields;
  let headers;
  if (draft.imageMode === 'upload' && draft.file) {
    data = new FormData();
    Object.entries(fields).forEach(([key, value]) => data.append(key, value ?? ''));
    data.append('image', draft.file);
    // Let the browser supply the multipart boundary, retaining the API's authentication policy.
    headers = {
      accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(!isRemoteDebugging && { 'X-CSRFToken': getCsrfToken() })
    };
  } else if (draft.imageMode === 'url' && draft.imageUrl.trim()) {
    data = { ...fields, image_url: draft.imageUrl.trim() };
  }
  const response = await api({
    url: blogId ? `${endpoint}${blogId}/` : endpoint,
    method: blogId ? METHOD.PATCH : METHOD.POST,
    data,
    ...(headers && { headers })
  });
  return response.data;
};

const messageText = value =>
  Array.isArray(value)
    ? value.map(messageText).join(' ')
    : value && typeof value === 'object'
    ? Object.values(value)
        .map(messageText)
        .join(' ')
    : String(value || '');

export const blogApiErrors = (error, fallback) => {
  const data = error.response?.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return Object.fromEntries(Object.entries(data).map(([field, value]) => [field, messageText(value)]));
  }
  return { detail: error.response ? fallback : error.message || fallback };
};
