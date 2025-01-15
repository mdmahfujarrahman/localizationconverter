## Localization Generator

This tool converts Google sheets localization data into JSON files for different languages. It collect data from google sheets using sheets api, processes it, and generates separate JSON files for each language.

## Prerequisites

1. **Google Sheets API Key**
   - Obtain an API key from the [Google Cloud Console](https://console.cloud.google.com/).
   - Ensure that the Sheets API is enabled for your project.

2. **Environment Setup**
   - Node.js installed on your system.
   - Create a `.env` file in your project root and add your API key:
     ```env
     apiKey=YOUR_GOOGLE_API_KEY
     ```

## Example

```javascript
import { localizationGoogleSheetTOJson } from './localizationGenerator';

const sheetID = '1abCdeFgHiJkLmnOpQrStUvWxYz12345';
const outputDir = './localizations';

localizationGoogleSheetTOJson(sheetID, outputDir);