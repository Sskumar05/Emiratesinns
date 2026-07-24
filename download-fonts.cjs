const https = require('https');
const fs = require('fs');

function downloadFont(url, name) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const b64 = Buffer.concat(chunks).toString('base64');
        resolve(b64);
      });
    });
  });
}

async function run() {
  console.log('Downloading fonts...');
  const reg = await downloadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'regular');
  const med = await downloadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf', 'medium');
  
  const content = `// Auto-generated Roboto fonts for jsPDF
export const robotoRegular = "${reg}";
export const robotoMedium = "${med}";
`;
  fs.writeFileSync('src/lib/fonts.ts', content);
  console.log('Fonts saved to src/lib/fonts.ts');
}

run();
