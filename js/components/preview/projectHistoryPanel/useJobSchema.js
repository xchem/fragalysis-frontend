import { useMemo } from 'react';
import { useGetJobDefinition } from '../../../hooks/useGetJobDefinition';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

import { useSelector } from 'react-redux';

export const expandVars = (string, data, ignoreFirstRound, firstRound = true) => {
  let resultingString = string;
  let result;

  const firstRoundRegex = new RegExp(`{(${ignoreFirstRound.length ? `(?!${ignoreFirstRound.join('|')})` : ''}.*?)}`);
  const secondRoundRegex = /{(.*?)}/;
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
  // transfer_root: jobLauncherData?.transfer_root,
  // transfer_target: jobLauncherData?.transfer_target,
  timestamp: new Date().getTime(),
  ...(jobLauncherData?.data || {}),
  ...fragalysisJobsVars
});

const getMoleculeEnumName = (title, targetName) => {
  let newTitle = title.replace(new RegExp(`${targetName}-`, 'i'), '');
  newTitle = newTitle.replace(new RegExp(':.*$', 'i'), '');

  return newTitle;
};

const prepareItem = (item, config, targetName) => {
  let itemPath = '';
  let itemName = '';

  if (config?.file) {
    const file = item[config.file];
    itemPath = file;
    itemName = getMoleculeEnumName(item.code, targetName);

    if (config?.skip && config?.skip > 0) {
      const url = new URL(file);
      const parts = url.pathname.split('/');
      for (let i = 0; i <= config.skip; i++) {
        parts.shift();
      }

      itemPath = parts.join('/');
    }
  }

  return { item: itemPath, itemName };
};

const compileProperty = (property, data, ignoreFirstRound, targetName) => {
  const copy = { ...property };
  let from = copy.from;
  const { items, value, default: dflt } = copy;
  const dataObject = data || {};

  if (from) {
    const itemsData = dataObject[from.side] || [];

    copy.enum = itemsData.map(item => {
      const preparedItem = prepareItem(item, from, targetName);
      const localData = { ...dataObject, ...preparedItem };
      return expandVars(copy.enum, localData, ignoreFirstRound);
    });
    copy.enumNames = itemsData.map(item => {
      const preparedItem = prepareItem(item, from, targetName);
      const localData = { ...dataObject, ...preparedItem };
      return expandVars(copy.enumNames, localData, ignoreFirstRound);
    });
  }

  if (items) {
    from = items.from;

    if (from) {
      const itemsData = dataObject[from.side] || [];
      copy.items = {
        enum: itemsData.map(item => {
          const preparedItem = prepareItem(item, from, targetName);
          const localData = { ...dataObject, ...preparedItem };
          return expandVars(items.enum, localData, ignoreFirstRound);
        }),
        enumNames: itemsData.map(item => {
          const preparedItem = prepareItem(item, from, targetName);
          const localData = { ...dataObject, ...preparedItem };
          return expandVars(items.enumNames, localData, ignoreFirstRound);
        })
      };
    } else {
      Object.entries(items).forEach(([key, value]) => {
        if (key.startsWith('ui:')) {
          delete copy.items[key];
        }
      });
    }
  }

  if (value) {
    copy.value = expandVars(value, dataObject, ignoreFirstRound);
  }

  if (dflt) {
    copy.default = expandVars(dflt, dataObject, ignoreFirstRound);
  }

  return copy;
};

export const useJobSchema = jobLauncherData => {
  const ignoreFirstRound = jobLauncherData?.job?.overrides.precompilation_ignore || [];
  console.log(`useJobSchema - ${JSON.stringify(jobLauncherData?.job)}`);
  const jobDefinition = useGetJobDefinition(jobLauncherData?.job);

  const targetName = useSelector(state => state.apiReducers.target_on_name);

  const recompileSchemaResult = (result, postSubmitLauncherData) => {
    let data = getCompileData(targetName, DJANGO_CONTEXT, jobLauncherData, jobLauncherData?.job?.overrides?.global);
    data = { ...data, ...postSubmitLauncherData };

    return Object.fromEntries(
      Object.entries(result).map(([key, value]) => {
        // if (typeof value === 'string') {
        //   return [key, expandVars(value, data, false)];
        // }
        if (!Array.isArray(value)) {
          return [key, expandVars(value, data, false, false)];
        }
        if (Array.isArray(value)) {
          return [key, value.map(val => expandVars(val, data, false, false))];
        }

        return [key, value];
      })
    );
  };

  const schemas = useMemo(() => {
    if (jobDefinition) {
      const { inputs, options, outputs } = jobDefinition;

      const data = getCompileData(targetName, DJANGO_CONTEXT, jobLauncherData, jobLauncherData?.job?.overrides?.global);

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
            return [key, compileProperty(property, data, ignoreFirstRound, targetName)];
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
    } else {
      return { schema: null, uiSchema: null };
    }
  }, [ignoreFirstRound, jobDefinition, jobLauncherData, targetName]);

  return { schemas, recompileSchemaResult };
};
