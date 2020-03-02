/**
 * This component creates a button for reporting new issues and handling them.
 */

import React, { memo } from 'react';
import { ReportForm, FORM_TYPE } from './reportForm';

export const IssueReport = memo(() => {
  return <ReportForm formType={FORM_TYPE.ISSUE} />;
});
