
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const fetchData = async (sheetID) => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/Sheet1?key=${process.env.apiKey}`;
    const response = await fetch(url);
    const responseJson = await response.json();
    if (responseJson?.error?.code) {
      throw new Error(responseJson?.error?.message);
    }
    if (!responseJson?.values?.length) throw new Error('No Values found');
    return responseJson.values
  } catch (error) {
    throw error;
  }
}

const formattedGoogleSheetData = async (sheetID) => {

  try {
    const data = await fetchData(sheetID)
    const sheetHead = data[0]
    const sheetBody = data.slice(1)
    let mainObject = {}
    sheetHead.forEach((language, index) => {
      mainObject[language] = {};
    });
    sheetBody.toSorted().forEach((row) => {
      const englishKey = row[0];
      sheetHead.forEach((language, langIndex) => {
        mainObject[language][englishKey] = row[langIndex] || ''
      });
    });
    return mainObject;

  } catch (error) {
    throw error;
  }


}

const generateLocalizationFile = (formattedData, outputDir) => {
  if (!formattedData || typeof formattedData !== 'object') throw new Error('Formatted data is invalid');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  Object.entries(formattedData).forEach(([language, translations]) => {
    const fileName = `${outputDir}/${language.toLowerCase()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(translations, null, 2), 'utf-8');
    console.log(`Generated file: ${fileName}`);
  });
};

export const localizationGoogleSheetTOJson = async (sheetID, outputDir = "./") => {
  try {
    if (!sheetID) throw new Error('Please Provide sheetID');
    const formattedData = await formattedGoogleSheetData(sheetID)
    generateLocalizationFile(formattedData, outputDir)
  } catch (error) {
    console.log(error)
  }
}




