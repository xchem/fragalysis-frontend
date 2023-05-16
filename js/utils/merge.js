export const deepMerge = (a, b) =>
  [a, b].reduce(
    (r, o) =>
      Object.entries(o).reduce(
        (q, [k, v]) => ({
          ...q,
          [k]: v && typeof v === 'object' ? deepMerge(q[k] || {}, v) : v
        }),
        r
      ),
    {}
  );
