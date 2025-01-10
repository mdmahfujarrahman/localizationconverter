import fs from 'fs';
import XLSX from 'xlsx';

// Convert Excel data to JSON
const convertJsonData = (filePath) => {
  if (!filePath) throw new Error('File path is required');

  const fileData = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileData);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  if (!jsonData.length) throw new Error('Excel sheet is empty or invalid');
  return jsonData;
};

// Convert JSON to language-specific key-value pairs
const convertKeyPairValue = (jsonData) => {
  if (!jsonData || !Array.isArray(jsonData)) throw new Error('Invalid JSON data provided');

  const languageData = {};
  jsonData
    .toSorted((a, b) => {
      const valueA = a['English'] || '';
      const valueB = b['English'] || '';
      return valueA.toString().localeCompare(valueB.toString(), undefined, { numeric: true });
    })
    .forEach((row) => {
      const englishWord = row['English'];
      if (!englishWord) return;
      Object.entries(row).forEach(([language, translation]) => {
        languageData[language] = languageData[language] || {};
        languageData[language][englishWord] = translation || '';

      });
    });

  return languageData;
};


const generateLocalizationFile = (formattedData, outputDir) => {
  if (!formattedData || typeof formattedData !== 'object') throw new Error('Formatted data is invalid');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  Object.entries(formattedData).forEach(([language, translations]) => {
    const fileName = `${outputDir}/${language.toLowerCase()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(translations, null, 2), 'utf-8');
    console.log(`Generated file: ${fileName}`);
  });
};


export const main = (int = ".", out = ".") => {

  try {
    const localizationJsonData = convertJsonData(int);
    const convertedData = convertKeyPairValue(localizationJsonData);
    generateLocalizationFile(convertedData, out);
  } catch (error) {
    console.error('Error:', error.message);
  }
}