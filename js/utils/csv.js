export const downloadRHSCSVExport = data => {
  const csvContent = generateCSVExportFromObject(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', data.filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateCSVExportFromObject = data => {
  let csvContent = '';
  const filename = data.filename;

  let newLine = '\r\n';

  csvContent += data.title + newLine;

  if (data?.dict?.length < 1) {
    return '';
  }

  const headerKeys = getReferenceDataForHeader(data.dict[0]);
  csvContent += generateCSVHeaderFromKeys(headerKeys) + newLine;

  for (let i = 0; i < data.dict.length; i++) {
    const row = data.dict[i];
    csvContent += generateCSVRowFromObject(row, headerKeys) + newLine;
  }

  return csvContent;
};

const generateCSVRowFromObject = (row, keys) => {
  let csvRow = '';

  for (let i = 0; i < keys.length; i++) {
    csvRow += row[keys[i]] ? row[keys[i]] : '';
    if (i < keys.length - 1) {
      csvRow += ',';
    }
  }

  return csvRow;
};

const generateCSVHeaderFromKeys = keys => {
  let csvHeader = '';

  for (let i = 0; i < keys.length; i++) {
    csvHeader += keys[i];
    if (i < keys.length - 1) {
      csvHeader += ',';
    }
  }

  return csvHeader;
};

const getReferenceDataForHeader = data => {
  return Object.keys(data);
};
