import { addToQualityCache } from '../reducers/ngl/actions';

export const readQualityInformation = (name, text) => (dispatch, getState) => {
  const qualityCache = getState().nglReducers.qualityCache;
  let qualityInformation = {};

  if (Object.prototype.hasOwnProperty.call(qualityCache, name)) {
    qualityInformation = qualityCache[name];
  } else {
    qualityInformation = loadQualityInformation(text);
    dispatch(addToQualityCache(name, qualityInformation));
  }
  return qualityInformation;
};

const readGoodAtomsFromFile = (text, badIds) => {
  if (!badIds?.length) return [];

  const matches = text.match(/[CSONF]/g) || [];
  return [...Array(matches.length).keys()].filter(index => !badIds.includes(index));
};

export const loadQualityInformation = text => {
  const badIdsResult = /[\n\r].*<BADATOMS>\s*([^\n\r]*)/.exec(text);
  const badCommentsResult = /[\n\r].*<BADCOMMENTS>\s*([^\n\r]*)/.exec(text);
  const badAtomNamesResult = /[\n\r].*<BADATOMNAMES>\s*([^\n\r]*)/.exec(text);
  const badIdsValue = badIdsResult?.[1] || '';
  const badCommentsValue = badCommentsResult?.[1] || '';
  const badAtomNamesValue = badAtomNamesResult?.[1] || '';
  const badIdsAll = badIdsValue ? badIdsValue.split(';').map(Number) : [];
  const badCommentsAll = badCommentsValue ? badCommentsValue.split(';') : [];
  const badAtomNamesAll = badAtomNamesValue ? badAtomNamesValue.split(';') : [];
  const goodIdsAll = readGoodAtomsFromFile(text, badIdsAll);
  const allAtomsCount = badIdsAll.length + goodIdsAll.length;
  const badIds = [];
  const badComments = [];
  const badAtomNames = [];
  const badProteinIds = [];
  const badProteinComments = [];
  const badProteinAtomNames = [];

  badAtomNamesAll.forEach((atomName, index) => {
    const firstNumber = /^[^\d]*(\d+)/.exec(atomName)?.[1] || '';
    const isProtein = !atomName.startsWith('[HET]') || Number(firstNumber) > allAtomsCount;
    if (isProtein) {
      badProteinIds.push(badIdsAll[index]);
      badProteinAtomNames.push(atomName);
      badProteinComments.push(badCommentsAll[index]);
    } else {
      badIds.push(badIdsAll[index]);
      badAtomNames.push(atomName);
      badComments.push(badCommentsAll[index]);
    }
  });

  if (!badAtomNamesAll.length) {
    return {
      goodids: goodIdsAll,
      badids: badIdsAll,
      badcomments: badCommentsAll,
      badatomsnames: badAtomNamesAll,
      goodproteinids: [],
      badproteinids: [],
      badproteincomments: [],
      badproteinatomnames: []
    };
  }

  return {
    goodids: readGoodAtomsFromFile(text, badIds),
    badids: badIds,
    badcomments: badComments,
    badatomsnames: badAtomNames,
    goodproteinids: readGoodAtomsFromFile(text, badProteinIds),
    badproteinids: badProteinIds,
    badproteincomments: badProteinComments,
    badproteinatomnames: badProteinAtomNames
  };
};
