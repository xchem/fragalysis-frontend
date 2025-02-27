export const getToBeDisplayedStructures = (toBeDisplayed, displayedList, type, toBeRemoved = false) => {
  let structures = [];

  structures = toBeDisplayed.filter(
    struct =>
      struct.type === type &&
      struct.display === !toBeRemoved &&
      (toBeRemoved || !displayedList.find(id => id === struct.id))
  );

  return structures;
};

export const getToBeDisplayedStructuresDataset = (toBeDisplayed, displayedList, type, toBeRemoved = false) => {
  let result = [];

  Object.keys(toBeDisplayed).forEach(datasetID => {
    const displayedDatasetLigands = displayedList[datasetID] || [];
    const toBeDisplayedDataset = toBeDisplayed[datasetID] || [];
    result = [
      ...result,
      ...getToBeDisplayedStructures(toBeDisplayedDataset, displayedDatasetLigands, type, toBeRemoved)
    ];
    // result.push(...getToBeDisplayedStructures(toBeDisplayedDataset, displayedDatasetLigands, type, toBeRemoved));
  });

  return result;
};

export const isEverythingInQueueRendered = toBeDisplayed => {
  return toBeDisplayed.every(item => item.rendered);
};

export const isEverythingInQueueRenderedDataset = toBeDisplayed => {
  let result = true;

  Object.keys(toBeDisplayed).forEach(datasetID => {
    const toBeDisplayedDataset = toBeDisplayed[datasetID] || [];
    result &= toBeDisplayedDataset.every(item => item.rendered);
  });

  return result;
};

export const howManyInQueueRendered = toBeDisplayed => {
  return toBeDisplayed.filter(item => item.rendered).length;
};

export const howManyInQueueRenderedDataset = toBeDisplayed => {
  let result = 0;

  Object.keys(toBeDisplayed).forEach(datasetID => {
    const toBeDisplayedDataset = toBeDisplayed[datasetID] || [];
    result += toBeDisplayedDataset.filter(item => item.rendered).length;
  });

  return result;
};
