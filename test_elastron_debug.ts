import { fetchProductPage, fallbackManualExtraction } from './services/extractor';

async function run() {
    const url = 'https://www.elastrongroup.com/en/en/upholstery/upholstery-/';
    console.log("Fetching HTML...");
    const html = await fetchProductPage(url);
    console.log("HTML length:", html.length);
    console.log("Contains ELASTRON DUMMY HTML?", html.includes('ELASTRON DUMMY HTML'));
    
    const images = fallbackManualExtraction(html, url);
    console.log("Extracted images:", images.length);
    if (images.length > 0) {
        console.log(images[0]);
    }
}
run().catch(console.error);
