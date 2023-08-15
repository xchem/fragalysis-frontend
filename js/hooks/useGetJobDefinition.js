import { useMemo } from 'react';
import { deepMerge } from '../utils/merge';

// Merges job definitions with fragalysis-jobs definitions
const getSchemaDefinition = (configDefinitions, overrideDefinitions) => {
  let mergedDefinitions = { ...configDefinitions };

  Object.entries(overrideDefinitions).forEach(([key, overrideDefinition]) => {
    if (overrideDefinition.hasOwnProperty('ignore') && overrideDefinition['ignore'].toLowerCase() === 'true') {
      if (mergedDefinitions.hasOwnProperty(key)) {
        delete mergedDefinitions[key];
      }
    } else {
      let mergedDefinition = mergedDefinitions[key] || {};

      // mergedDefinitions[key] = { ...mergedDefinition, ...overrideDefinition };
      mergedDefinitions[key] = deepMerge({ ...mergedDefinition }, { ...overrideDefinition });
    }
  });

  return mergedDefinitions;
};

export const useGetJobDefinition = jobInfo => {
  const selectedJob = jobInfo?.spec;
  const overrideIndex = jobInfo?.overrideIndex;
  const overrides = jobInfo?.overrides;
  const inputsJson = selectedJob?.variables.inputs;
  const optionsJson = selectedJob?.variables.options;
  const outputsJson = selectedJob?.variables.outputs;

  return useMemo(() => {
    if (jobInfo) {
      // const inputs = JSON.parse(inputsJson);
      // const options = JSON.parse(optionsJson);
      // const outputs = JSON.parse(outputsJson);
      const inputs = inputsJson;
      const options = optionsJson;
      const outputs = outputsJson;

      const jobOverrides = overrides['fragalysis-jobs'][overrideIndex];

      return {
        inputs: {
          ...inputs,
          properties: getSchemaDefinition(inputs.properties || {}, jobOverrides?.inputs || {})
        },
        options: {
          ...options,
          properties: getSchemaDefinition(options.properties || {}, jobOverrides?.options || {})
        },
        outputs: {
          ...outputs,
          properties: getSchemaDefinition(outputs.properties || {}, jobOverrides?.outputs || {})
        }
      };
    } else {
      return null;
    }
  }, [jobInfo, inputsJson, optionsJson, outputsJson, overrideIndex, overrides]);
};

export const getJobInputs = jobInfo => (dispatch, getState) => {
  const state = getState();
  const jobList = state.projectReducers.jobList;
  console.log(`getJobInputs: jobInfo = ${JSON.stringify(jobInfo)}`);
  const selectedJob = jobInfo?.squonk_job_spec;
  console.log(`getJobInputs: selectedJob = ${JSON.stringify(selectedJob)}`);
  if (selectedJob) {
    const parsedJob = JSON.parse(selectedJob);
    const jobSpec = jobList.find(jobFiltered => parsedJob.job === jobFiltered.slug);
    const jobDefinition = useGetJobDefinition(jobSpec);
    return { variables: parsedJob.variables, jobDefinition: jobDefinition };
  } else {
    return null;
  }
};
