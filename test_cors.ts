import { fetchProductPage } from './services/extractor';

async function run() {
    try {
        const url = 'https://www.elastrongroup.com/en/en/upholstery/upholstery-/';
        const html = await fetchProductPage(url);
        console.log("HTML length:", html.length);
        console.log("Contains ELASTRON DUMMY HTML?", html.includes('ELASTRON DUMMY HTML'));
        const dummyIndex = html.indexOf('ELASTRON DUMMY HTML');
        console.log("Dummy HTML content:", html.substring(dummyIndex, dummyIndex + 500));
    } catch (e) {
        console.error(e);
    }
}
run();
