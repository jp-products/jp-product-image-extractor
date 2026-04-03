
import { ExtractionResult, ExtractedImage } from '../types';

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

export const fetchProductPage = async (url: string): Promise<string> => {
  const fetchHtml = async (targetUrl: string): Promise<string> => {
    // 1. Try Direct Fetch (Works if in Electron with webSecurity: false)
    try {
      const directResponse = await fetchWithTimeout(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'max-age=0',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      if (directResponse.ok) {
        const text = await directResponse.text();
        if (text.length > 500) return text;
      }
    } catch (e) {
      // Silent failure on direct fetch
    }

    // 2. Fallback to Proxies
    const encodedUrl = encodeURIComponent(targetUrl);
    
    // Strategy: Prioritize AllOrigins (JSON Proxy) as it often bypasses standard blocks better
    try {
        const aoRes = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodedUrl}`);
        if (aoRes.ok) {
            const json = await aoRes.json();
            if (json.contents && json.contents.length > 500) return json.contents;
        }
    } catch(e) {}

    const rawProxies = [
      `https://corsproxy.io/?${encodedUrl}`, 
      `https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`,
      `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
      `https://cors-anywhere.herokuapp.com/${targetUrl}`
    ];

    for (const proxyUrl of rawProxies) {
      try {
        const response = await fetchWithTimeout(proxyUrl);
        if (response.ok) {
          const text = await response.text();
          if (text && text.length > 500 && !text.includes('Challenge Validation') && !text.includes('Cloudflare')) {
               return text;
          }
        }
      } catch (e) {}
    }
    throw new Error("Target website is blocking the request. Try a different URL or check your connection.");
  };

  let finalHtml = await fetchHtml(url);

  // Check for pugirg iframe
  if (url.includes('pugirg.it')) {
      const iframeMatch = finalHtml.match(/<iframe[^>]+src\s*=\s*["']?(https:\/\/tessuti\.pugirg\.it\/[^"'\s>]+)["']?/i);
      if (iframeMatch) {
          try {
              const iframeHtml = await fetchHtml(iframeMatch[1]);
              finalHtml += "\n" + iframeHtml;
          } catch(e) {
              console.warn("Failed to fetch pugirg iframe", e);
          }
      }
  }

  // Check for elastrongroup
  if (url.includes('elastrongroup.com')) {
      try {
          const langMatch = url.match(/elastrongroup\.com\/([a-z]{2})\//);
          const lang = langMatch ? langMatch[1] : 'en';
          const baseUrl = url.split('?')[0];
          const ajaxUrl = `${baseUrl}?action=ajax`;

          let totalCollections = 182;
          const totalMatch = finalHtml.match(/<input type="hidden" id="colecoes_total" value="(\d+)" \/>/);
          if (totalMatch) {
              totalCollections = parseInt(totalMatch[1], 10);
          }

          const totalPages = Math.ceil(totalCollections / 4);
          const allProducts: any[] = [];

          const fetchPage = async (page: number) => {
              const start = page * 4;
              const bodyStr = `lang=${lang}&start=${start}`;
              
              let res;
              try {
                  res = await fetchWithTimeout(ajaxUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                      body: bodyStr
                  });
              } catch (e) {
                  // Fallback 1: corsproxy.io
                  try {
                      const encodedUrl = encodeURIComponent(ajaxUrl);
                      res = await fetchWithTimeout(`https://corsproxy.io/?${encodedUrl}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                          body: bodyStr
                      });
                  } catch (e2) {
                      // Fallback 2: codetabs
                      try {
                          res = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${ajaxUrl}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                              body: bodyStr
                          });
                      } catch (e3) {
                          console.warn("All proxies failed for Elastron AJAX");
                      }
                  }
              }
              
              if (res && res.ok) {
                  const data = await res.json();
                  if (data && data.produtos) {
                      Object.values(data.produtos).forEach((cat: any) => {
                          if (cat.produtos) {
                              allProducts.push(...cat.produtos);
                          }
                      });
                  }
              }
          };

          const batchSize = 3;
          for (let i = 0; i < totalPages; i += batchSize) {
              const batch = [];
              for (let j = 0; j < batchSize && i + j < totalPages; j++) {
                  batch.push(fetchPage(i + j));
              }
              await Promise.all(batch);
              // Small delay to prevent rate limiting from proxies
              await new Promise(r => setTimeout(r, 300));
          }

          let dummyHtml = '<!-- ELASTRON DUMMY HTML -->\n';
          allProducts.forEach(prod => {
              if (prod.imagem) {
                  let hqUrl = prod.imagem.replace(/_\d+X\d+_/i, '_');
                  dummyHtml += `<div class="elastron-product"><img src="${hqUrl}" alt="${prod.titulo_imagem || prod.produto}" data-variant="${prod.produto}" data-high-res="${hqUrl}"></div>\n`;
              }
          });
          finalHtml += "\n" + dummyHtml;
      } catch (e) {
          console.warn("Failed to fetch elastron products", e);
      }
  }

  return finalHtml;
};

// HELPER: Check if element is inside a "Related Products" or irrelevant container
const isSafeElement = (element: Element): boolean => {
  const ignoreKeywords = [
    'related', 'recommend', 'also-bought', 'upsell', 'cross-sell', 
    'customers-also', 'you-may-also', 'frequently-bought', 'sidebar',
    'post-card', 'fusion-post-cards', 'recently-viewed', 
    'instagram', 'footer', 'header', 'nav', 'similar'
  ];

  let current: Element | null = element.parentElement;
  while (current && current.tagName !== 'BODY') {
    const cls = (current.getAttribute('class') || '').toLowerCase();
    const id = (current.getAttribute('id') || '').toLowerCase();
    const context = `${cls} ${id}`;
    
    // Explicit exclusions for Related/Upsell sections
    if (ignoreKeywords.some(kw => context.includes(kw))) {
      return false;
    }
    current = current.parentElement;
  }
  return true;
};

export const fallbackManualExtraction = (html: string, pageUrl: string): ExtractedImage[] => {
  const images: ExtractedImage[] = [];
  
  // --- 0. ELASTRON SPECIFIC ---
  if (pageUrl.includes('elastrongroup.com')) {
    const elastronRegex = /<div class="elastron-product"><img src="([^"]+)" alt="([^"]*)" data-variant="([^"]*)"/gi;
    let eMatch;
    while ((eMatch = elastronRegex.exec(html)) !== null) {
      images.push({
        url: eMatch[1],
        sourceType: 'variant',
        variantName: eMatch[3] || eMatch[2],
        confidence: 100
      });
    }
    if (images.length > 0) return images;
  }

  // --- 0. PUGIRG SPECIFIC (REGEX SCANNER) ---
  if (pageUrl.includes('pugirg')) {
    const seenFiles = new Set<string>();

    // Strategy A: Targeted Variant Scanner
    // Look for: <a ... title="4057" ...> <img src="...img=convert-melange-4057.jpg...">
    // This regex matches the block structure provided in your HTML snippet
    const variantBlockRegex = /<div class="variante_thumb"[\s\S]*?<a[^>]*title="([^"]+)"[\s\S]*?miniatura_variante\.aspx\?([^"'>]+)/gi;
    let vMatch;
    while ((vMatch = variantBlockRegex.exec(html)) !== null) {
        try {
            const variantName = vMatch[1].trim();
            const queryParams = vMatch[2].replace(/&amp;/g, '&');
            
            const idMatch = queryParams.match(/id=(\d+)/i);
            const imgMatch = queryParams.match(/img=([^&]+)/i);

            if (idMatch && imgMatch) {
                const id = idMatch[1];
                const filename = decodeURIComponent(imgMatch[1]);
                const hqUrl = `https://tessuti.pugirg.it/public/images/Articoli/${id}/${filename}`;
                
                if (!seenFiles.has(hqUrl)) {
                    seenFiles.add(hqUrl);
                    images.push({ 
                        url: hqUrl, 
                        sourceType: 'variant', 
                        variantName: variantName, 
                        confidence: 100 
                    });
                }
            }
        } catch(e) {}
    }

    // Strategy B: Loose Miniatura Fallback (If DOM structure differs but link exists)
    const looseRegex = /miniatura_variante\.aspx\?([^"'\s>]+)/gi;
    let looseMatch;
    while ((looseMatch = looseRegex.exec(html)) !== null) {
        try {
            const query = looseMatch[1].replace(/&amp;/g, '&');
            const idMatch = query.match(/id=(\d+)/i);
            const imgMatch = query.match(/img=([^&]+)/i);
            
            if (idMatch && imgMatch) {
                const id = idMatch[1];
                const filename = decodeURIComponent(imgMatch[1]);
                const hqUrl = `https://tessuti.pugirg.it/public/images/Articoli/${id}/${filename}`;
                
                if (!seenFiles.has(hqUrl)) {
                    seenFiles.add(hqUrl);
                    // Try to guess variant name from filename
                    let variantName = '';
                    const vNameMatch = filename.match(/[-_](\d{3,})\./);
                    if (vNameMatch) variantName = vNameMatch[1];

                    images.push({ 
                        url: hqUrl, 
                        sourceType: 'variant', 
                        variantName, 
                        confidence: 90 
                    });
                }
            }
        } catch(e) {}
    }

    // Strategy C: Main/Hero Image Scanner
    // Matches: /public/images/Articoli/115/filename.jpg inside a regex
    const heroRegex = /src=["']\/?public\/images\/Articoli\/(\d+)\/([^"']+)["']/gi;
    let hMatch;
    while ((hMatch = heroRegex.exec(html)) !== null) {
        try {
            const id = hMatch[1];
            const filename = hMatch[2];
            // Skip icons or UI elements if they happen to be in this folder structure
            if (filename.includes('icon') || filename.includes('ico_')) continue;
            
            const hqUrl = `https://tessuti.pugirg.it/public/images/Articoli/${id}/${filename}`;
            if (!seenFiles.has(hqUrl)) {
                seenFiles.add(hqUrl);
                const isBase = filename.includes('base-tipo');
                images.push({ 
                    url: hqUrl, 
                    sourceType: isBase ? 'hero' : 'gallery', 
                    confidence: isBase ? 100 : 80 
                });
            }
        } catch(e) {}
    }

    if (images.length > 0) return images;
  }

  // --- GENERAL PLATFORM EXTRACTORS (Shopify, Woo, etc.) ---
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. MAGENTO 2
  const magentoScripts = doc.querySelectorAll('script[type="text/x-magento-init"]');
  magentoScripts.forEach(script => {
    try {
        const json = JSON.parse(script.textContent || '{}');
        const findGallery = (obj: any) => {
            for (const key in obj) {
                if (key === 'mage/gallery/gallery') {
                     const data = obj[key].data;
                     if (Array.isArray(data)) {
                         data.forEach((item: any) => {
                             if (item.full) images.push({ url: item.full, sourceType: 'gallery', confidence: 98 });
                             else if (item.img) images.push({ url: item.img, sourceType: 'gallery', confidence: 95 });
                         });
                     }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    findGallery(obj[key]);
                }
            }
        };
        findGallery(json);
    } catch(e) {}
  });

  // 2. WOOCOMMERCE
  const variationForms = doc.querySelectorAll('form[data-product_variations]');
  variationForms.forEach(form => {
      if (!isSafeElement(form)) return;
      try {
          const jsonStr = form.getAttribute('data-product_variations');
          if (jsonStr) {
              const variations = JSON.parse(jsonStr);
              variations.forEach((v: any) => {
                  if (v.image && v.image.full_src) {
                      images.push({ url: v.image.full_src, sourceType: 'variant', variantName: v.attributes ? Object.values(v.attributes).join(' ') : '', confidence: 95 });
                  } else if (v.image && v.image.url) {
                      images.push({ url: v.image.url, sourceType: 'variant', variantName: v.attributes ? Object.values(v.attributes).join(' ') : '', confidence: 90 });
                  }
                  if (v.variation_gallery_images && Array.isArray(v.variation_gallery_images)) {
                      v.variation_gallery_images.forEach((gImg: any) => {
                          if (gImg.full_src) images.push({ url: gImg.full_src, sourceType: 'gallery', confidence: 90 });
                          else if (gImg.url) images.push({ url: gImg.url, sourceType: 'gallery', confidence: 85 });
                      });
                  }
              });
          }
      } catch(e) {}
  });

  const wooGallery = doc.querySelectorAll('.woocommerce-product-gallery__image');
  wooGallery.forEach(div => {
      const a = div.querySelector('a');
      const img = div.querySelector('img');
      if (a) {
          const href = a.getAttribute('href');
          if (href && /\.(jpg|jpeg|png|webp)/i.test(href)) {
              images.push({ url: href, sourceType: 'gallery', confidence: 95 });
          }
      }
      if (img) {
          const large = img.getAttribute('data-large_image') || img.getAttribute('data-src');
          if (large) images.push({ url: large, sourceType: 'gallery', confidence: 92 });
      }
  });

  // 3. SHOPIFY
  const scriptTags = doc.querySelectorAll('script');
  scriptTags.forEach(script => {
      const content = script.textContent || '';
      if (content.includes('Shopify.Image') || content.includes('"images":')) {
           const jsonMatch = content.match(/"images"\s*:\s*(\[.*?\])/);
           if (jsonMatch) {
               try {
                   const imgs = JSON.parse(jsonMatch[1]);
                   if (Array.isArray(imgs)) {
                       imgs.forEach((url: any) => {
                           if (typeof url === 'string') {
                               if (url.startsWith('//')) url = 'https:' + url;
                               images.push({ url, sourceType: 'gallery', confidence: 88 });
                           }
                       });
                   }
               } catch(e) {}
           }
      }
  });

  // 4. AMAZON
  if (pageUrl.includes('amazon') || pageUrl.includes('amzn')) {
    const scriptRegex = /'colorImages':\s*({.*?}),\s*'|var\s+obj\s*=\s*jQuery\.parseJSON\('({.*?})'\);/s;
    const match = html.match(scriptRegex);
    if (match) {
      const jsonStr = match[1] || match[2];
      try {
        const data = JSON.parse(jsonStr.replace(/'/g, '"')); 
        const findHiRes = (obj: any) => {
          for (const key in obj) {
            if (key === 'hiRes' && typeof obj[key] === 'string' && obj[key]) {
               images.push({ url: obj[key], sourceType: 'gallery', confidence: 99 });
            } else if (key === 'large' && typeof obj[key] === 'string' && obj[key]) {
               images.push({ url: obj[key], sourceType: 'gallery', confidence: 90 });
            } else if (typeof obj[key] === 'object') {
               findHiRes(obj[key]);
            }
          }
        };
        findHiRes(data);
      } catch(e) {}
    }
  }

  // 5. FLIPKART
  if (pageUrl.includes('flipkart')) {
    const fkRegex = /http:\/\/rukminim1\.flixcart\.com\/image\/[0-9]+\/[0-9]+\/([^"]+)/g;
    let fkMatch;
    while ((fkMatch = fkRegex.exec(html)) !== null) {
      const cleanPath = fkMatch[1];
      const originalUrl = `http://rukminim1.flixcart.com/image/original/${cleanPath}`;
      images.push({ url: originalUrl, sourceType: 'gallery', confidence: 95 });
    }
  }

  // --- GENERAL DOM EXTRACTION ---
  const highResAttrs = [
    'data-zoom', 'data-zoom-image', 'data-large', 'data-large-image', 'data-large_image', 
    'data-native', 'data-original', 'data-high-res', 'data-src-hq',
    'data-cloudzoom', 'data-magnify-src', 'data-image-full', 'data-main-image', 'href'
  ];

  const elements = doc.querySelectorAll('img, a');
  elements.forEach((el) => {
    if (!isSafeElement(el)) return;

    highResAttrs.forEach(attr => {
      const val = el.getAttribute(attr);
      if (val) {
        let url = val.trim();
        if (url.startsWith('javascript') || url.startsWith('mailto') || url.startsWith('#') || url.includes('base64')) return;
        
        if (url.startsWith('/')) {
            try { url = new URL(url, pageUrl).href; } catch(e) { if(!url.startsWith('//')) return; }
        }
        if (url.startsWith('//')) url = 'https:' + url;

        if (/\.(jpg|jpeg|png|webp|avif)/i.test(url)) {
          if (attr === 'href') {
            const hasImgChild = el.querySelector('img');
            const classNames = (el.className || '').toLowerCase();
            const looksLikeGallery = /(zoom|lightbox|gallery|fancybox|photo)/.test(classNames);
            if (!hasImgChild && !looksLikeGallery) return;
          }
          images.push({ url, sourceType: 'gallery', confidence: 85 });
        }
      }
    });

    if (el.tagName === 'IMG') {
       const src = el.getAttribute('src');
       if (src) {
         let parent = el.parentElement;
         let isGallery = false;
         for (let i = 0; i < 4 && parent; i++) {
            const pClass = (parent.getAttribute('class') || '').toLowerCase();
            const pId = (parent.getAttribute('id') || '').toLowerCase();
            const context = pClass + ' ' + pId;

            if (/(gallery|slider|slick|owl|swiper|product-image|main-image|carousel|zoom)/.test(context)) {
                isGallery = true;
                break;
            }
            parent = parent.parentElement;
         }

         if (isGallery) {
             let url = src;
             if (url.startsWith('//')) url = 'https:' + url;
             images.push({ url, sourceType: 'gallery', confidence: 70 });
         }
       }
    }
  });

  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach(script => {
    try {
      const json = JSON.parse(script.textContent || '{}');
      const processNode = (node: any) => {
        if (node.isRelatedTo || node.similarTo) return;
        if (node['@type'] === 'Product' || node.image) {
            if (node.image) {
                const imgs = Array.isArray(node.image) ? node.image : [node.image];
                imgs.forEach((img: any) => {
                    const u = typeof img === 'string' ? img : img.url;
                    if (u) images.push({ url: u, sourceType: 'gallery', confidence: 80 });
                });
            }
        }
        if (node['@graph']) processNode(node['@graph']);
        if (Array.isArray(node)) node.forEach(processNode);
      };
      processNode(json);
    } catch(e) {}
  });

  return images;
};

export const processImages = (images: ExtractedImage[], enableQualityFilter: boolean = true): ExtractedImage[] => {
  const map = new Map<string, ExtractedImage>();
  
  images.forEach(img => {
    try {
      if (!img.url || img.url.length < 10) return;
      let url = img.url;
      if (url.startsWith('//')) url = 'https:' + url;
      
      if (url.includes('amazon') || url.includes('m.media-amazon')) {
        const hqUrl = url.replace(/\._AC_[a-zA-Z0-9_]+_/, ''); 
        if (hqUrl !== url) {
             url = hqUrl;
             img.confidence += 20;
        }
      }

      if (url.includes('pugirg.it')) {
          url = url.replace('www.pugirg.it', 'tessuti.pugirg.it');
      }

      const cleanUrl = url.split('?')[0];
      let baseIdentity = cleanUrl
        .replace(/\/stencil\/[^\/]+\//i, '/stencil/normalized/')
        .replace(/\/\d+x\d+\//i, '/normalized-size/')
        .replace(/(_\d{3,}x\d{3,}(_crop_center)?)(\.(jpg|png|webp|avif))/i, '$3') 
        .replace(/(_master|_large|_grande|_zoom|_thumb|_medium|_small)(\.(jpg|png|webp|avif))/i, '$2') 
        .replace(/(\.S[A-Z0-9_]{5,}\.)/i, '.')
        .replace(/-\d{3,}x\d{3,}\.(jpg|png|webp)/i, '.$1')
        .replace(/\/odnHeight=\d+,odnWidth=\d+,odnBg=[A-F0-9]+/i, '')
        .replace(/_s-l\d+\.(jpg|png)/i, '_s-l1600.$1')
        .replace(/il_\d+xN\./i, 'il_fullxfull.')
        .replace(/\/image\/\d+\/\d+\//, '/image/original/')
        .toLowerCase();

      const existing = map.get(baseIdentity);
      
      const getScore = (u: string, confidence: number) => {
        const low = u.toLowerCase();
        let score = 0;
        score += confidence * 1000; 
        const queryDims = low.match(/[?&](?:w|width|h|height)=(\d+)/);
        if (queryDims && queryDims[1]) score += parseInt(queryDims[1]) * 20; 
        const pathDims = low.match(/(\d{3,})x(\d{3,})/);
        if (pathDims) score += (parseInt(pathDims[1]) + parseInt(pathDims[2])) * 20;

        if (low.includes('master') || low.includes('fullxfull') || low.includes('1600')) score += 10000;
        if (low.includes('/original/')) {
             if (low.includes('/stencil/')) score += 1000;
             else score += 10000;
        }
        if (low.includes('hires') || low.includes('zoom') || low.includes('max')) score += 5000;
        if (low.includes('large') || low.includes('big')) score += 2000;
        
        if (low.includes('thumb') || low.includes('100x') || low.includes('small') || low.includes('50x50') || low.includes('compact') || low.includes('mini')) score -= 20000;
        if (low.includes('swatch') || low.includes('icon') || low.includes('sprite') || low.includes('badge')) score -= 50000;
        
        return score + (u.length / 10);
      };

      const currentScore = getScore(url, img.confidence);
      const existingScore = existing ? getScore(existing.url, existing.confidence) : -Infinity;

      if (!existing || currentScore > existingScore) {
        map.set(baseIdentity, { ...img, url });
      }
    } catch (e) {
      map.set(img.url, img);
    }
  });
  
  return Array.from(map.values()).filter(img => {
    const low = img.url.toLowerCase();
    const isUI = /logo|icon|badge|spinner|loader|placeholder|banner|footer|arrow|btn|social|app-store|play-store|promo|pixel|blank|transparent|rating|star|empty|trans\.gif/i.test(low);
    const isValidExt = /\.(jpg|jpeg|png|webp|avif)/i.test(low);
    if (isUI || !isValidExt) return false;

    if (enableQualityFilter) {
       // Allow known main images even if they lack high-res markers
       if (low.includes('base-tipo')) return true;

       if (/(32x32|50x50|100x100)/.test(low) && !low.includes('fullxfull') && !low.includes('original')) return false;
       if (img.confidence <= 60 && (low.includes('blog') || low.includes('article') || low.includes('banner'))) return false;
    }
    return true;
  });
};
