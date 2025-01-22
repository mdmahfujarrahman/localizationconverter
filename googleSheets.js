
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const fetchFullSheets = async (sheetID) => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?key=${process.env.apiKey}`;
    const response = await fetch(url);
    const responseJson = await response.json();
    if (responseJson?.error?.code) {
      throw new Error(responseJson?.error?.message);
    }
    return responseJson
  } catch (error) {
    throw error;
  }
}
function buildNestedObject(target, key, value) {
  const keys = key?.split('.');
  let currentLevel = target;
  keys?.forEach((keyPart, index) => {
    if (index === keys?.length - 1) {
      currentLevel[keyPart] = value;
    } else {
      if (!currentLevel[keyPart]) {
        currentLevel[keyPart] = {};
      }
      currentLevel = currentLevel[keyPart];
    }
  });
}


const fetchSheetValues = async (sheetID, sheetName, outputDir) => {
  try {
    const translations = {};
    const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=${process.env.apiKey}`;
    const response = await fetch(valuesUrl);
    const responseJson = await response.json();
    if (responseJson?.error?.code) {
      throw new Error(responseJson?.error?.message);
    }
    const [headerRow, ...dataRows] = responseJson?.values || [];
    const languages = headerRow.slice(1).filter(lang => lang !== 'KEY');
    languages.forEach(lang => {
      translations[lang] = { [sheetName]: {} };
    });
    dataRows.forEach(row => {
      const key = row[0];
      languages.forEach((lang, index) => {
        const value = row[index + 1];
        buildNestedObject(translations[lang][sheetName], key, value);
      });
    });
    generateLocalizationFile(sheetName, translations, outputDir)
  } catch (error) {
    console.error(`Error processing sheet "${sheetName}":`, error.message);
    throw error;
  }
}


const generateLocalizationFile = (sheetName, formattedData, outputDir) => {
  if (!formattedData || typeof formattedData !== 'object') throw new Error('Formatted data is invalid');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  Object.entries(formattedData).forEach(([language, translations]) => {
    const languageDir = `${outputDir}/${language}`;
    if (!fs.existsSync(languageDir)) fs.mkdirSync(languageDir, { recursive: true });
    const outputPath = `${languageDir}/${sheetName}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2), 'utf-8');
    console.log(`Translations saved to ${outputPath}`);
  });
};



const localizationGoogleSheetTOJson = async (sheetID, outputDir = "./") => {
  try {
    if (!sheetID) throw new Error('Please Provide sheetID');
    const formattedData = await fetchFullSheets(sheetID)
    if (!formattedData?.sheets?.length) throw new Error('No Data Found');
    const allSheets = formattedData?.sheets
    allSheets.forEach(sheet => {
      const sheetName = sheet.properties.title;
      fetchSheetValues(sheetID, sheetName, outputDir)
    });

  } catch (error) {
    console.log(error)
  }
}



localizationGoogleSheetTOJson("1i3qB8O7MD6kDeQ6eBopvjNxALajbz-4plWuAQ_iVwT8", "./output")
