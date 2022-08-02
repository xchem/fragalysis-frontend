// eslint-disable-next-line import/extensions
import fragmensteinSpec from '../../jobconfigs/fragmenstein-combine.json';
// eslint-disable-next-line import/extensions
import jobsSpec from '../../jobconfigs/fragalysis-job-spec-1.1.json';
import { useMemo } from 'react';

// Merges job definitions with fragalysis-jobs definitions
const getSchemaDefinition = (configDefinitions, overrideDefinitions) => {
  const mergedDefinitions = { ...configDefinitions };

  Object.entries(overrideDefinitions).forEach(([key, overrideDefinition]) => {
    let mergedDefinition = mergedDefinitions[key] || {};

    mergedDefinitions[key] = { ...mergedDefinition, ...overrideDefinition };
  });

  return mergedDefinitions;
};

export const useGetJobDefinition = () => {
  const selectedJob = fragmensteinSpec;

  return useMemo(() => {
    const inputs = JSON.parse(selectedJob.variables.inputs);
    const options = JSON.parse(selectedJob.variables.options);
    const outputs = JSON.parse(selectedJob.variables.outputs);

    const jobOverrides = jobsSpec['fragalysis-jobs'].find(job => job.job_name === selectedJob.job);

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
  }, [selectedJob.job, selectedJob.variables.inputs, selectedJob.variables.options, selectedJob.variables.outputs]);
};
