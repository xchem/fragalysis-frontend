import { useMemo } from 'react';
import { deepMerge } from '../utils/merge';

// Merges job definitions with fragalysis-jobs definitions
const getSchemaDefinition = (configDefinitions, overrideDefinitions) => {
  const mergedDefinitions = { ...configDefinitions };

  Object.entries(overrideDefinitions).forEach(([key, overrideDefinition]) => {
    let mergedDefinition = mergedDefinitions[key] || {};

    // mergedDefinitions[key] = { ...mergedDefinition, ...overrideDefinition };
    mergedDefinitions[key] = deepMerge({ ...mergedDefinition }, { ...overrideDefinition });
  });

  return mergedDefinitions;
};

export const useGetJobDefinition = jobInfo => {
  console.log(`useGetJobDefinition: jobInfo = ${JSON.stringify(jobInfo)}`);
  // const selectedJob = jobInfo?.spec;
  const selectedJob = jobInfo?.spec ?? JSON.parse(jobInfo?.squonk_job_spec);
  console.log(`useGetJobDefinition: selectedJob = ${JSON.stringify(selectedJob)}`);
  const overrideIndex = jobInfo?.overrideIndex;
  const overrides = jobInfo?.overrides;
  console.log(`useGetJobDefinition: variables = ${JSON.stringify(selectedJob?.variables)}`);
  const inputsJson = selectedJob?.variables.inputs;
  console.log(`useGetJobDefinition: inputsJson = ${inputsJson}`);
  const optionsJson = selectedJob?.variables.options;
  console.log(`useGetJobDefinition: optionsJson = ${optionsJson}`);
  const outputsJson = selectedJob?.variables.outputs;
  console.log(`useGetJobDefinition: outputsJson = ${outputsJson}`);

  return useMemo(() => {
    if (jobInfo) {
      const inputs = JSON.parse(inputsJson);
      const options = JSON.parse(optionsJson);
      const outputs = JSON.parse(outputsJson);

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
