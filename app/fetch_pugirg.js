const https = require('https');
const fs = require('fs');

https.get('https://www.pugirg.it/en/product/?IDArticolo=162', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('pugirg.html', data);
    console.log('done');
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
