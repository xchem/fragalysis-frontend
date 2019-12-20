import { URLS } from '../routes/constants';

export const updateClipboard = valueToClipboard => {
  navigator.clipboard.writeText(valueToClipboard);
};

export const notCheckTarget = pathname => {
  return pathname.includes(URLS.fragglebox) || pathname.includes(URLS.snapshot);
};
