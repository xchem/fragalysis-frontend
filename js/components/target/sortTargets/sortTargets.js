export const compareIdAsc = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};

export const compareIdDesc = (a, b) => {
  if (a.id > b.id) {
    return -1;
  }
  if (a.id < b.id) {
    return 1;
  }
  return 0;
};

export const compareTargetAsc = (a, b) => {
  if (a.title < b.title) {
    return -1;
  }
  if (a.title > b.title) {
    return 1;
  }
  return 0;
};

export const compareTargetDesc = (a, b) => {
  if (a.title > b.title) {
    return -1;
  }
  if (a.title < b.title) {
    return 1;
  }
  return 0;
};

export const compareNumberOfChainAsc = (a, b) => {
  if (a.numberOfChains < b.numberOfChains) {
    return -1;
  }
  if (a.numberOfChains > b.numberOfChains) {
    return 1;
  }
  return 0;
};

export const compareNumberOfChainDesc = (a, b) => {
  if (a.numberOfChains > b.numberOfChains) {
    return -1;
  }
  if (a.numberOfChains < b.numberOfChains) {
    return 1;
  }
  return 0;
};

export const comparePrimaryChainAsc = (a, b) => {
  if (a.primaryChain < b.primaryChain) {
    return -1;
  }
  if (a.primaryChain > b.primaryChain) {
    return 1;
  }
  return 0;
};

export const comparePrimaryChainDesc = (a, b) => {
  if (a.primaryChain > b.primaryChain) {
    return -1;
  }
  if (a.primaryChain < b.primaryChain) {
    return 1;
  }
  return 0;
};

export const compareUniprotAsc = (a, b) => {
  if (a.uniprot < b.uniprot) {
    return -1;
  }
  if (a.uniprot > b.uniprot) {
    return 1;
  }
  return 0;
};

export const compareUniprotDesc = (a, b) => {
  if (a.uniprot > b.uniprot) {
    return -1;
  }
  if (a.uniprot < b.uniprot) {
    return 1;
  }
  return 0;
};

export const compareRangeAsc = (a, b) => {
  if (a.range < b.range) {
    return -1;
  }
  if (a.range > b.range) {
    return 1;
  }
  return 0;
};

export const compareRangeDesc = (a, b) => {
  if (a.range > b.range) {
    return -1;
  }
  if (a.range < b.range) {
    return 1;
  }
  return 0;
};

export const compareProteinNameAsc = (a, b) => {
  if (a.proteinName < b.proteinName) {
    return -1;
  }
  if (a.proteinName > b.proteinName) {
    return 1;
  }
  return 0;
};

export const compareProteinNameDesc = (a, b) => {
  if (a.proteinName > b.proteinName) {
    return -1;
  }
  if (a.proteinName < b.proteinName) {
    return 1;
  }
  return 0;
};

export const compareGeneNameAsc = (a, b) => {
  if (a.geneName < b.geneName) {
    return -1;
  }
  if (a.geneName > b.geneName) {
    return 1;
  }
  return 0;
};

export const compareGeneNameDesc = (a, b) => {
  if (a.geneName > b.geneName) {
    return -1;
  }
  if (a.geneName < b.geneName) {
    return 1;
  }
  return 0;
};

export const compareSpeciesIdAsc = (a, b) => {
  if (a.speciesId < b.speciesId) {
    return -1;
  }
  if (a.speciesId > b.speciesId) {
    return 1;
  }
  return 0;
};

export const compareSpeciesIdDesc = (a, b) => {
  if (a.speciesId > b.speciesId) {
    return -1;
  }
  if (a.speciesId < b.speciesId) {
    return 1;
  }
  return 0;
};

export const compareSpeciesAsc = (a, b) => {
  if (a.species < b.species) {
    return -1;
  }
  if (a.species > b.species) {
    return 1;
  }
  return 0;
};

export const compareSpeciesDesc = (a, b) => {
  if (a.species > b.species) {
    return -1;
  }
  if (a.species < b.species) {
    return 1;
  }
  return 0;
};

export const compareDomainAsc = (a, b) => {
  if (a.domain < b.domain) {
    return -1;
  }
  if (a.domain > b.domain) {
    return 1;
  }
  return 0;
};

export const compareDomainDesc = (a, b) => {
  if (a.domain > b.domain) {
    return -1;
  }
  if (a.domain < b.domain) {
    return 1;
  }
  return 0;
};

export const compareECNumberAsc = (a, b) => {
  if (a.ECNumber < b.ECNumber) {
    return -1;
  }
  if (a.ECNumber > b.ECNumber) {
    return 1;
  }
  return 0;
};

export const compareECNumberDesc = (a, b) => {
  if (a.ECNumber > b.ECNumber) {
    return -1;
  }
  if (a.ECNumber < b.ECNumber) {
    return 1;
  }
  return 0;
};
export const compareNHitsAsc = (a, b) => {
  if (a.NHits < b.NHits) {
    return -1;
  }
  if (a.NHits > b.NHits) {
    return 1;
  }
  return 0;
};

export const compareNHitsDesc = (a, b) => {
  if (a.NHits > b.NHits) {
    return -1;
  }
  if (a.NHits < b.NHits) {
    return 1;
  }
  return 0;
};
export const compareDateLastEditAsc = (a, b) => {
  if (a.dateLastEdit < b.dateLastEdit) {
    return -1;
  }
  if (a.dateLastEdit > b.dateLastEdit) {
    return 1;
  }
  return 0;
};

export const compareDateLastEditDesc = (a, b) => {
  if (a.dateLastEdit > b.dateLastEdit) {
    return -1;
  }
  if (a.dateLastEdit < b.dateLastEdit) {
    return 1;
  }
  return 0;
};

export const compareVersionIdAsc = (a, b) => {
  if (a.versionId < b.versionId) {
    return -1;
  }
  if (a.versionId > b.versionId) {
    return 1;
  }
  return 0;
};

export const compareVersionIdDesc = (a, b) => {
  if (a.versionId > b.versionId) {
    return -1;
  }
  if (a.versionId < b.versionId) {
    return 1;
  }
  return 0;
};
