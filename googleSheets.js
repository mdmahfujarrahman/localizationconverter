
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


const fetchSheetValues = async (sheetID, sheetName) => {
  try {
    const translations = {};
    const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=${process.env.apiKey}`;

    const response = await fetch(valuesUrl);
    const responseJson = await response.json();
    if (responseJson?.error?.code) {
      throw new Error(responseJson?.error?.message);
    }
    responseJson?.values?.forEach(row => {
      const key = row[0];
      const value = row[1];
      buildNestedObject(translations, key, value);
    });
    fs.writeFileSync(`./${sheetName}.json`, JSON.stringify(translations, null, 2), 'utf-8');
    console.log(`Translations saved to ./${sheetName}.json`);
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

const localizationGoogleSheetTOJson = async (sheetID, outputDir = "./") => {
  try {
    if (!sheetID) throw new Error('Please Provide sheetID');
    // const formattedData = await formattedGoogleSheetData(sheetID)
    const formattedData = await fetchFullSheets(sheetID)


    if (!formattedData?.sheets?.length) throw new Error('No Data Found');

    const allSheets = formattedData?.sheets
    allSheets.forEach(sheet => {
      const sheetName = sheet.properties.title;

      fetchSheetValues(sheetID, sheetName)
    });


  } catch (error) {
    console.log(error)
  }
}



localizationGoogleSheetTOJson("1i3qB8O7MD6kDeQ6eBopvjNxALajbz-4plWuAQ_iVwT8")
