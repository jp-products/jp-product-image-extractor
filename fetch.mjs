import fs from 'fs';

async function fetchHtml() {
  const url = 'https://www.elastrongroup.com/en/en/upholstery/upholstery-/alabama/155007-dark-brown/';
  const res = await fetch(url);
  const html = await res.text();
  fs.writeFileSync('elastron.html', html);
}

fetchHtml();
