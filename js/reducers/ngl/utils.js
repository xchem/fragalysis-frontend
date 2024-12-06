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
