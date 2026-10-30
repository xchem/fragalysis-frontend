import axios from 'axios';
import { fetchTargetBlog, saveTargetBlog, targetBlogImageUrl } from './targetBlogApi';

let mockRemote = false;
jest.mock('../routes/constants', () => ({
  base_url: 'http://localhost',
  get isRemoteDebugging() {
    return mockRemote;
  }
}));
jest.mock('axios', () => {
  const mockedAxios = jest.fn();
  mockedAxios.CancelToken = function CancelToken(executor) {
    executor(() => undefined);
  };
  return mockedAxios;
});
const draft = {
  title: ' Blog ',
  url: 'https://example.org/blog',
  overview: '',
  published: '',
  imageMode: 'upload',
  file: null
};
const last = () => axios.mock.calls.at(-1)[0];

describe('target blog API transport', () => {
  it('resolves same-host media through the API origin while retaining external image URLs', () => {
    expect.hasAssertions();
    expect(targetBlogImageUrl('https://localhost/media/target_blog/1/')).toBe('http://localhost/media/target_blog/1/');
    expect(targetBlogImageUrl('/media/target_blog/1/')).toBe('http://localhost/media/target_blog/1/');
    expect(targetBlogImageUrl('/media/target_blog/1/', 'fresh')).toBe(
      'http://localhost/media/target_blog/1/?__cacheBust=fresh'
    );
    expect(targetBlogImageUrl('https://example.org/image.png')).toBe('https://example.org/image.png');
    expect(targetBlogImageUrl('https://example.org/image.png', 'fresh')).toBe('https://example.org/image.png');
    expect(targetBlogImageUrl(null)).toBeNull();
  });

  it('filters by target and uses the existing read-cache policy', async () => {
    expect.hasAssertions();
    axios.mockResolvedValue({ data: { results: [] } });
    expect(await fetchTargetBlog(3)).toBeNull();
    expect(last().params).toStrictEqual({ target: 3, __cacheBust: expect.any(String) });
    expect(last().headers['Cache-Control']).toContain('no-cache');
  });

  it.each([
    {},
    { results: [{ id: 1, target: 2 }] },
    {
      results: [
        { id: 1, target: 3 },
        { id: 2, target: 3 }
      ]
    }
  ])('rejects an unexpected blog lookup response: %o', async data => {
    expect.hasAssertions();
    axios.mockResolvedValue({ data });
    await expect(fetchTargetBlog(3)).rejects.toThrow('unexpected response');
  });

  it.each([false, true])('uploads multipart with the correct CSRF policy (remote debugging: %s)', async remote => {
    expect.hasAssertions();
    mockRemote = remote;
    document.cookie = 'csrftoken=blog-csrf; path=/';
    axios.mockResolvedValue({ data: { id: 8 } });
    const file = new File(['png'], 'blog.png', { type: 'image/png' });
    await saveTargetBlog(3, null, { ...draft, file });
    const request = last();
    expect(request.method).toBe('POST');
    expect(request.params).toBeUndefined();
    expect(request.data).toBeInstanceOf(FormData);
    expect(request.data.get('target')).toBe('3');
    expect(request.data.get('title')).toBe('Blog');
    expect(request.data.get('published')).toBe('');
    expect(request.data.get('image')).toBe(file);
    expect(request.headers['content-type']).toBeUndefined();
    expect(request.headers['X-Requested-With']).toBe('XMLHttpRequest');
    expect(request.headers['X-CSRFToken']).toBe(remote ? undefined : 'blog-csrf');
    mockRemote = false;
    document.cookie = 'csrftoken=; Max-Age=0; path=/';
  });

  it('patches only blog data and sends image_url as JSON', async () => {
    expect.hasAssertions();
    axios.mockResolvedValue({ data: { id: 8 } });
    await saveTargetBlog(3, 8, { ...draft, imageMode: 'url', imageUrl: 'https://example.org/image.png' });
    expect(last()).toStrictEqual(
      expect.objectContaining({
        method: 'PATCH',
        url: 'http://localhost/api/target-blogs/8/',
        data: {
          title: 'Blog',
          url: draft.url,
          published: null,
          overview: '',
          image_url: 'https://example.org/image.png'
        }
      })
    );
    expect(last().params).toBeUndefined();
  });
});
