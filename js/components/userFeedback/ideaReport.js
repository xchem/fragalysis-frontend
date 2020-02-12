/**
 * This component creates a button for reporting new ideas and handling them.
 */

import React, { memo } from 'react';
import { ReportForm, FORM_TYPE } from './reportForm';

export const IdeaReport = memo(() => {
  return <ReportForm formType={FORM_TYPE.IDEA} />;
});
