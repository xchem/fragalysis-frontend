export const categories = [
  { id: 1, text: 'Site' },
  { id: 2, text: 'Series' },
  { id: 3, text: 'Forum' },
  { id: 4, text: 'Test' },
  { id: 5, text: 'Temp' },
  { id: 6, text: 'Category' }
];

export const tags = generateTags();

function generateTags() {
  let tags = [];
  for (let i = 1; i < 21; i++) {
    let category = Math.floor(Math.random() * 6) + 1;
    let colourToggle = getRandomColor(i + 100);

    let tag = { id: i, text: 'Tag' + i, color: colourToggle, category: category };
    tags.push(tag);
  }
  return tags;
}

function getRandomColor(number) {
  let colourList = [
    '#EFCDB8',
    '#CC6666',
    '#FF6E4A',
    '#78DBE2',
    '#1F75FE',
    '#FAE7B5',
    '#FDBCB4',
    '#C5E384',
    '#95918C',
    '#F75394',
    '#80DAEB',
    '#ADADD6'
  ];

  return colourList[number % colourList.length];
}
