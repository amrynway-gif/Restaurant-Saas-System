const translate = require('google-translate-api-x');
const fs = require('fs');

async function run() {
  const arabicStrings = JSON.parse(fs.readFileSync('arabic-strings.json', 'utf8'));
  const dictionary = {};
  
  console.log(`Translating ${arabicStrings.length} strings...`);
  
  // Translate in batches to avoid rate limits
  const batchSize = 50;
  for (let i = 0; i < arabicStrings.length; i += batchSize) {
    const batch = arabicStrings.slice(i, i + batchSize);
    try {
      const res = await translate(batch, { from: 'ar', to: 'de' });
      for (let j = 0; j < batch.length; j++) {
        // Post-processing to make it "Du-Form" and professional if possible (rough)
        let translatedText = Array.isArray(res) ? res[j].text : res.text;
        
        // Minor fixes for German translation context
        translatedText = translatedText.replace(/Ihr /g, "Dein ").replace(/Ihre /g, "Deine ");
        translatedText = translatedText.replace(/Sie /g, "Du ").replace(/Ihnen/g, "Dir");

        dictionary[batch[j]] = translatedText;
      }
      console.log(`Translated batch ${i / batchSize + 1}/${Math.ceil(arabicStrings.length / batchSize)}`);
      
      // Delay to avoid IP ban
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`Error translating batch ${i / batchSize + 1}:`, err);
    }
  }

  fs.writeFileSync('translated-strings.json', JSON.stringify(dictionary, null, 2));
  console.log('Translation complete. Saved to translated-strings.json');
}

run();
