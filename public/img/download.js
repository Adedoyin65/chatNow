const https = require('https');
const fs = require('fs');

const url = 'https://mailmeteor.com/logos/assets/PNG/Google_Chat_Logo_512px.png';
const file = fs.createWriteStream("image.png");

https.get(url, response => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed!');
  });
});
