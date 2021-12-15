export const changeButtonClassname = (givenList = [], moleculeList = []) => {
  if (moleculeList.length === givenList.length) {
    return true;
  } else if (givenList.length > 0) {
    return null;
  }
  return false;
};

export const sortMoleculesByDragDropState = (moleculeList, dragDropState) => {
  const sortedMoleculeList = [];
  moleculeList.forEach(molecule => {
    const sortedIndex = dragDropState[molecule.name];
    sortedMoleculeList[sortedIndex] = molecule;
  });
  return sortedMoleculeList;
};
