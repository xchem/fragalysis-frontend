import { useMemo } from 'react';
import { useGetJobDefinition } from '../../../hooks/useGetJobDefinition';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
// eslint-disable-next-line import/extensions
import jobsSpec from '../../../../jobconfigs/fragalysis-job-spec-1.1.json';
import { useSelector } from 'react-redux';

const ignoreFirstRound = jobsSpec?.precompilation_ignore || [];

const firstRoundRegex = new RegExp(`{(${ignoreFirstRound.length ? `(?!${ignoreFirstRound.join('|')})` : ''}.*?)}`);
const secondRoundRegex = /{(.*?)}/;

export const expandVars = (string, data, firstRound = true) => {
  let resultingString = string;
  let result;

  const regex = firstRound ? firstRoundRegex : secondRoundRegex;

  while ((result = regex.exec(resultingString)) !== null) {
    resultingString = resultingString.replace(result[0], data[result[1]]);
  }

  return resultingString;
};

export const getCompileData = (target, djangoContext, jobLauncherData, fragalysisJobsVars = {}) => ({
  target,
  inputs_dir: jobLauncherData?.inputs_dir,
  username: djangoContext?.username,
  job_name: jobLauncherData?.job?.slug,
  timestamp: new Date().getTime(),
  ...(jobLauncherData?.data || {}),
  ...fragalysisJobsVars
});

const compileProperty = (property, data) => {
  const copy = { ...property };
  const { from, items, value, default: dflt } = copy;
  const dataObject = data || {};

  if (from) {
    const itemsData = dataObject[from] || [];

    copy.enum = itemsData.map(item => {
      const localData = { ...dataObject, item };
      return expandVars(copy.enum, localData);
    });
    copy.enumNames = itemsData.map(item => {
      const localData = { ...dataObject, item };
      return expandVars(copy.enumNames, localData);
    });
  }

  if (items) {
    const itemsData = dataObject[items.from] || [];

    copy.items = {
      enum: itemsData.map(item => {
        const localData = { ...dataObject, item };
        return expandVars(items.enum, localData);
      }),
      enumNames: itemsData.map(item => {
        const localData = { ...dataObject, item };
        return expandVars(items.enumNames, localData);
      })
    };
  }

  if (value) {
    copy.value = expandVars(value, dataObject);
  }

  if (dflt) {
    copy.default = expandVars(dflt, dataObject);
  }

  return copy;
};

export const useJobSchema = jobLauncherData => {
  const jobDefinition = useGetJobDefinition();

  const targetName = useSelector(state => state.apiReducers.target_on_name);

  const recompileSchemaResult = (result, postSubmitLauncherData) => {
    let data = getCompileData(targetName, DJANGO_CONTEXT, jobLauncherData, jobsSpec?.global);
    data = { ...data, ...postSubmitLauncherData };

    return Object.fromEntries(
      Object.entries(result).map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, expandVars(value, data, false)];
        }

        if (Array.isArray(value)) {
          return [key, value.map(val => expandVars(val, data, false))];
        }

        return [key, value];
      })
    );
  };

  const schemas = useMemo(() => {
    const { inputs, options, outputs } = jobDefinition;

    const data = getCompileData(targetName, DJANGO_CONTEXT, jobLauncherData, jobsSpec?.global);

    // Prepare schema
    const schema = {
      type: options.type,
      required: [...(inputs.required || []), ...(options.required || []), ...(outputs.required || [])],
      properties: Object.fromEntries(
        Object.entries({
          ...inputs.properties,
          ...options.properties,
          ...outputs.properties
        }).map(([key, property]) => {
          return [key, compileProperty(property, data)];
        })
      )
    };

    // Prepare UI schema
    const uiSchema = {
      ...inputs.properties,
      ...options.properties,
      ...outputs.properties
    };

    return { schema, uiSchema };
  }, [jobDefinition, jobLauncherData, targetName]);

  return { schemas, recompileSchemaResult };
};
