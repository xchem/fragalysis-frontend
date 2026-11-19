import { useEffect, useRef, useState } from 'react';
import { blogApiErrors, fetchTargetBlog, saveTargetBlog } from './targetBlogApi';

const draftFrom = blog => ({
  title: blog?.title || '',
  url: blog?.url || '',
  published: blog?.published || '',
  overview: blog?.overview || '',
  imageMode: 'upload',
  file: null,
  imageUrl: ''
});
const textFields = ['title', 'url', 'published', 'overview'];
const changed = (draft, baseline) =>
  textFields.some(field => draft[field] !== baseline[field]) ||
  (draft.imageMode === 'upload' ? Boolean(draft.file) : Boolean(draft.imageUrl.trim()));

export const useTargetBlog = (targetId, open, loadBlog = fetchTargetBlog) => {
  const scopeRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: 'idle', draft: draftFrom(null), record: null, errors: {} });

  useEffect(() => {
    const scope = { active: true, targetId, record: null, baseline: draftFrom(null) };
    scopeRef.current = scope;
    setState({ status: open && targetId ? 'loading' : 'idle', draft: draftFrom(null), record: null, errors: {} });
    if (open && targetId) {
      loadBlog(targetId)
        .then(record => {
          if (!scope.active) return;
          scope.record = record;
          scope.baseline = draftFrom(record);
          setState({ status: 'ready', record, draft: scope.baseline, errors: {} });
        })
        .catch(error => {
          if (!scope.active) return;
          setState(previous => ({
            ...previous,
            status: 'error',
            errors: blogApiErrors(error, 'Unable to load the blog. Please try again.')
          }));
        });
    }
    return () => {
      scope.active = false;
    };
  }, [targetId, open, attempt, loadBlog]);

  const change = (field, value) => {
    setState(previous => ({ ...previous, draft: { ...previous.draft, [field]: value }, errors: {} }));
  };

  const reset = () => {
    const scope = scopeRef.current;
    if (scope?.active) {
      setState(previous => ({ ...previous, draft: draftFrom(scope.record), errors: {} }));
    }
  };

  const save = async () => {
    const scope = scopeRef.current;
    if (!scope?.active || scope.targetId !== targetId || state.status !== 'ready') return false;
    if (!changed(state.draft, scope.baseline)) return true;
    const errors = {};
    if (!state.draft.title.trim()) errors.title = 'Enter a blog title.';
    if (!state.draft.url.trim()) errors.url = 'Enter the blog URL.';
    if (Object.keys(errors).length) {
      setState(previous => ({ ...previous, errors }));
      return false;
    }
    try {
      const record = await saveTargetBlog(targetId, scope.record?.id, state.draft);
      if (!scope.active) return false;
      scope.record = record;
      scope.baseline = draftFrom(record);
      setState({ status: 'ready', record, draft: scope.baseline, errors: {} });
      return true;
    } catch (error) {
      if (scope.active) {
        setState(previous => ({
          ...previous,
          errors: blogApiErrors(error, 'Unable to save the blog. Please try again.')
        }));
      }
      return false;
    }
  };

  return {
    ...state,
    dirty: state.status === 'ready' && scopeRef.current && changed(state.draft, scopeRef.current.baseline),
    change,
    save,
    reset,
    retry: () => setAttempt(value => value + 1)
  };
};
