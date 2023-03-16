import React, { Fragment } from 'react';
import { Dialog, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import { getJobInputs, useGetJobDefinition } from '../../../hooks/useGetJobDefinition';
import { useDispatch } from 'react-redux';

const renderListItem = item => <li key={item}>{item}</li>;

const renderInput = input => {
  if (Array.isArray(input)) {
    return input.map(i => renderListItem(i));
  } else if (typeof input === 'object') {
    return renderListItem(JSON.stringify(input));
  }
  return renderListItem(input);
};

export const JobVariablesDialog = ({ open, onClose, title, variableType, jobInfo }) => {
  const dispatch = useDispatch();
  console.log(`JobVariablesDialog: jobInfo = ${JSON.stringify(jobInfo)}`);
  // const jobDefinition = useGetJobDefinition(jobInfo);
  const jobInputs = dispatch(getJobInputs(jobInfo));
  let jobVariables;
  let variableProperties;
  if (jobInputs) {
    jobVariables = jobInputs.variables;
    const jobDefinition = jobInputs.jobDefinition;
    console.log(`JobVariablesDialog: jobInputs = ${JSON.stringify(jobInputs)}`);

    // const jobSpec = !!jobInfo ? JSON.parse(jobInfo.squonk_job_spec) : null;
    // const jobVariables = jobSpec?.variables || {};

    // variableProperties = jobDefinition?.[variableType]?.properties || {};
    variableProperties = {};
    Object.keys(jobDefinition).map(varType =>
      Object.entries(jobDefinition[varType].properties).forEach(([key, prop]) => {
        variableProperties[key] = prop;
      })
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {jobVariables &&
          variableProperties &&
          Object.entries(jobVariables).map(([key, value]) => (
            <Fragment key={key}>
              <Typography variant="h6">{!!variableProperties[key] && variableProperties[key].title}</Typography>
              {!!jobVariables[key] && <ul>{renderInput(jobVariables[key])}</ul>}
            </Fragment>
          ))}
      </DialogContent>
    </Dialog>
  );
};
