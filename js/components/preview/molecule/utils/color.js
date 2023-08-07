export const colourList = [
  '#FFEBEA',
  '#EEFFEE',
  '#ECF6FF',
  '#F5E9FF',
  '#FFEFDB',
  '#DCFFDE',
  '#CED1FF',
  '#FFD5EC',
  '#E0FFB5',
  '#B7FFE0',
  '#9F98FF',
  '#FFA5AB'
];

export const getRandomColor = molecule => colourList[molecule.id % colourList.length];
