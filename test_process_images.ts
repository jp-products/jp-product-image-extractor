import { processImages } from './services/extractor';

const images = [
    {
        url: 'https://www.elastrongroup.com/image_temp/1000X1000_1bf9f2c2f2dfb3ed22439a37d75ab1c8.jpg',
        sourceType: 'variant' as const,
        variantName: 'Dark Brown 155007',
        confidence: 100
    }
];

const processed = processImages(images, true);
console.log("Processed:", processed.length);
console.log(processed);
