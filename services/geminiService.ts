
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types";

export const analyzeProductHtml = async (html: string, url: string): Promise<ExtractionResult> => {
  // Initialize inside function to prevent crash on app load if key is missing
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("API Key is missing. Skipping AI analysis.");
    return { productName: '', images: [], platform: 'Unknown', success: false };
  }

  // SPECIAL CASE: Disable AI for Pugirg.it
  // The AI tends to hallucinate filenames (e.g. 115.jpg) based on IDs, causing 404s.
  // The manual extractor is far more accurate for this specific site structure.
  if (url.includes('pugirg.it')) {
    console.log("Skipping AI for Pugirg to prevent hallucinations. Using Manual Extractor.");
    return { productName: 'Pugirg Product', images: [], platform: 'Pugirg', success: true };
  }

  const ai = new GoogleGenAI({ apiKey });

  // HEAVY OPTIMIZATION: Reduce Token Usage to avoid 429 Errors
  // 1. Remove scripts (except JSON-LD), styles, SVGs, comments, and base64 data to save tokens
  let cleanHtml = html
    .replace(/<script\b(?![^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
    .replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gim, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/src=["']data:image\/[^;]+;base64,[^"']+["']/g, 'src=""');

  // 2. Extract only relevant sections (Body usually)
  const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : cleanHtml;
  
  // 3. Aggressive Truncation: 150,000 chars is usually enough for the main gallery
  // Reducing from previous high limits to prevent Resource Exhausted errors
  if (content.length > 150000) {
    content = content.slice(0, 150000);
  }

  const prompt = `You are a World-Class E-commerce Image Specialist.
  GOAL: Identify and return only the high-resolution gallery, variant, and material/fabric swatch images for the product at ${url}.

  NAMING CONTEXT:
  I need to rename these files based on their variant (e.g., "Red", "Blue", "XL"). 
  If an image is specific to a variant (like a red shirt), extract "Red" as the 'variantName'.
  If it is a fabric/material swatch for a variant, also use that variant name.
  If it is the main generic product image, leave variantName empty.

  EXTRACT FROM THESE CONTEXTS:
  1. JSON-LD: application/ld+json blocks often have the "image" array.
  2. DYNAMIC GALLERIES: Look for "carousel", "slider", "swatches", "gallery", "cms-element-image-gallery".
  3. AMAZON/MARKETPLACE: Look for hidden JSON config objects.

  CRITICAL RULES:
  - INCLUDE: All gallery images showing different angles.
  - INCLUDE: Fabric swatches or material close-ups if they are part of the product presentation.
  - STRICTLY EXCLUDE: "Customers also viewed", "Sponsored products", "Related items".
  - STRICTLY EXCLUDE: Icons, logos, badges, star ratings.
  - ONLY return images belonging to the MAIN product.
  - 'sourceType' MUST be 'hero' for the absolute main image, 'variant' for specific color/style images, or 'gallery' for generic angles/swatches.

  Output strictly valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt + "\n\nHTML CONTEXT:\n" + content,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            platform: { type: Type.STRING },
            images: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  url: { type: Type.STRING },
                  altText: { type: Type.STRING },
                  resolution: { type: Type.STRING },
                  sourceType: { type: Type.STRING, enum: ['gallery', 'hero', 'variant'] },
                  variantName: { type: Type.STRING, description: "e.g. Red, Blue, Style A. Empty if generic." },
                  confidence: { type: Type.NUMBER }
                },
                required: ['url', 'sourceType']
              }
            }
          },
          required: ['productName', 'images', 'platform']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return { 
      productName: result.productName || 'Unknown Product',
      platform: result.platform || 'Unknown',
      images: result.images || [], 
      success: true 
    };
  } catch (error: any) {
    // Graceful handling for Quota Exceeded (429)
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn("Gemini API Quota Exceeded. Skipping AI analysis and using manual extraction.");
      return { productName: '', images: [], platform: 'Unknown', success: false };
    }

    console.error("Gemini Analysis Error:", error);
    // Return empty result to allow manual fallback to proceed without crashing
    return { productName: '', images: [], platform: 'Unknown', success: false };
  }
};
