
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { BulkInput } from './components/BulkInput';
import { ResultsSection } from './components/ResultsSection';
import { AppStatus, ExtractionJob, ExtractionResult } from './types';
import { fetchProductPage, processImages, fallbackManualExtraction } from './services/extractor';
import { analyzeProductHtml } from './services/geminiService';

declare const window: any;
declare const JSZip: any;

const App: React.FC = () => {
  const [jobs, setJobs] = useState<ExtractionJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{current: number, total: number} | null>(null);
  const [outputDir, setOutputDir] = useState<string>('');
  
  // Settings
  const [enableQualityFilter, setEnableQualityFilter] = useState(true);
  const [useAI, setUseAI] = useState(true);

  // Check if we are in Electron mode
  const isDesktop = !!(window.electron && window.electron.isDesktop);

  // Auto-detect environment
  React.useEffect(() => {
    if (!isDesktop) {
      console.log("Web Mode Active: Using ZIP download engine.");
    } else {
      console.log("Desktop Mode Active: Using Direct Save engine.");
    }
  }, [isDesktop]);

  const addJobs = (newJobs: Partial<ExtractionJob>[]) => {
    const jobsWithIds: ExtractionJob[] = newJobs.map(j => ({
      id: Math.random().toString(36).substr(2, 9),
      url: j.url || '',
      folderName: j.folderName || '',
      status: AppStatus.QUEUED,
    }));
    setJobs(prev => [...prev, ...jobsWithIds]);
    processQueue(jobsWithIds);
  };

  const processQueue = async (jobsToProcess: ExtractionJob[]) => {
    setIsProcessing(true);
    for (const job of jobsToProcess) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: AppStatus.FETCHING } : j));
      try {
        const html = await fetchProductPage(job.url);
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: AppStatus.ANALYZING } : j));
        
        let processedImages;
        let aiResult: ExtractionResult = { 
          images: [], 
          productName: '', 
          platform: 'Unknown', 
          success: false 
        };

        // 1. Try AI Analysis (ONLY IF AI MODE IS ON)
        if (useAI) {
          try {
            aiResult = await analyzeProductHtml(html, job.url);
          } catch (e) {
            console.warn("AI analysis warning:", e);
          }
        } else {
          console.log("Unlimited Mode: Skipping AI analysis.");
        }

        // 2. Run Manual Extraction (The "Unlimited" Engine)
        const manualImages = fallbackManualExtraction(html, job.url);
        
        // 3. Smart Merge
        if (aiResult.images.length > 1) {
             const combined = [...aiResult.images, ...manualImages];
             processedImages = processImages(combined, enableQualityFilter);
        } else {
             processedImages = processImages(manualImages, enableQualityFilter);
        }
        
        if (processedImages.length === 0) throw new Error("Universal engine found no assets.");

        // Force at least one image to be 'hero' if none exists
        const hasHero = processedImages.some((img: any) => img.sourceType === 'hero');
        if (!hasHero && processedImages.length > 0) {
            processedImages[0].sourceType = 'hero';
        }

        const finalResult: ExtractionResult = { 
          productName: aiResult.productName || 'Product',
          platform: aiResult.platform || 'Web',
          images: processedImages, 
          success: true 
        };
        
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: AppStatus.SUCCESS, result: finalResult } : j));
      } catch (err: any) {
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: AppStatus.ERROR, error: err.message } : j));
      }
    }
    setIsProcessing(false);
  };

  const handleSelectFolder = async () => {
    if (!isDesktop) return;
    const path = await window.electron.selectFolder();
    if (path) setOutputDir(path);
  };

  const getFileName = (img: any, safeFolderName: string, variantCounters: Record<string, number>) => {
      // --- DETERMINE EXTENSION FROM URL ---
      let ext = 'jpg';
      try {
        const cleanUrl = img.url.split('?')[0];
        const parts = cleanUrl.split('.');
        const possibleExt = parts[parts.length - 1].toLowerCase();
        if (['png', 'webp', 'jpeg', 'avif', 'gif'].includes(possibleExt)) {
          ext = possibleExt;
        } else if (possibleExt === 'jpg') {
          ext = 'jpg';
        }
      } catch(e) {}

      // --- NAMING LOGIC ---
      const rawVariant = img.variantName || '';
      const variantName = rawVariant.replace(/[^a-z0-9]/gi, '').toUpperCase();
      
      let finalFileName = '';

      if (img.sourceType === 'hero') {
         if (variantName) {
             finalFileName = `${safeFolderName}_${variantName}_HeroImage.${ext}`;
         } else {
             finalFileName = `${safeFolderName}_HeroImage.${ext}`;
         }
      } else {
         const counterKey = variantName || 'general';
         if (!variantCounters[counterKey]) variantCounters[counterKey] = 0;
         variantCounters[counterKey]++;
         const countStr = variantCounters[counterKey].toString().padStart(3, '0');

         if (variantName) {
             finalFileName = `${safeFolderName}_${variantName}_${countStr}.${ext}`;
         } else {
             finalFileName = `${safeFolderName}_${countStr}.${ext}`;
         }
      }
      return finalFileName;
  };

  // Helper to fetch blob with multiple proxy fallbacks
  const fetchImageBlob = async (url: string): Promise<Blob | null> => {
      // 1. Try Direct
      try {
          const res = await fetch(url);
          if (res.ok) return await res.blob();
      } catch (e) {
          // Direct failed
      }

      // 2. Try Proxies
      const encodedUrl = encodeURIComponent(url);
      const proxies = [
          `https://corsproxy.io/?url=${encodedUrl}`,
          `https://api.allorigins.win/raw?url=${encodedUrl}`, 
          `https://thingproxy.freeboard.io/fetch/${url}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`
      ];

      for (const proxy of proxies) {
          try {
              const res = await fetch(proxy);
              if (res.ok) {
                  const blob = await res.blob();
                  if (blob.size > 0) return blob;
              }
          } catch (e) {
              continue;
          }
      }
      return null;
  };

  const downloadAsZip = async () => {
    const successfulJobs = jobs.filter(j => j.status === AppStatus.SUCCESS && j.result);
    if (successfulJobs.length === 0) return alert("Nothing to save.");

    setIsSaving(true);
    const totalImages = successfulJobs.reduce((acc, job) => acc + (job.result?.images.length || 0), 0);
    setSaveProgress({ current: 0, total: totalImages });

    try {
        const zip = new JSZip();
        let processedCount = 0;

        for (const job of successfulJobs) {
            const result = job.result!;
            const safeFolderName = (job.folderName || result.productName || 'product').replace(/[^a-z0-9\-_ ]/gi, '_').trim();
            const folder = zip.folder(safeFolderName);
            if (!folder) continue;

            const variantCounters: Record<string, number> = {};

            // Limit concurrent fetches to avoid browser throttle
            const chunkArray = (arr: any[], size: number) => {
                 const chunks = [];
                 for (let i = 0; i < arr.length; i += size) {
                     chunks.push(arr.slice(i, i + size));
                 }
                 return chunks;
            };

            const imageChunks = chunkArray(result.images, 5); // Process 5 images at a time

            for (const chunk of imageChunks) {
                await Promise.all(chunk.map(async (img: any) => {
                    const finalFileName = getFileName(img, safeFolderName, variantCounters);
                    try {
                        const blob = await fetchImageBlob(img.url);
                        if (blob) {
                            folder.file(finalFileName, blob);
                        } else {
                            console.warn(`Could not download: ${img.url}`);
                            folder.file(`FAILED_${finalFileName}.txt`, `Failed to download: ${img.url}`);
                        }
                    } catch (e) {
                        console.error("Failed to add to zip", img.url);
                    } finally {
                        processedCount++;
                        setSaveProgress(prev => ({ current: processedCount, total: totalImages }));
                    }
                }));
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `ecom-assets-${new Date().toISOString().slice(0,10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (e) {
        console.error("Zip failed", e);
        alert("Failed to create ZIP archive. Check console for details.");
    } finally {
        setIsSaving(false);
        setSaveProgress(null);
    }
  };

  const saveToDisk = async () => {
    if (!outputDir) {
      alert("Please select an output folder first.");
      return;
    }
    const successfulJobs = jobs.filter(j => j.status === AppStatus.SUCCESS && j.result);
    if (successfulJobs.length === 0) return alert("Nothing to save.");

    setIsSaving(true);
    const totalImages = successfulJobs.reduce((acc, job) => acc + (job.result?.images.length || 0), 0);
    setSaveProgress({ current: 0, total: totalImages });

    let processedCount = 0;

    for (const job of successfulJobs) {
      const result = job.result!;
      const safeFolderName = (job.folderName || result.productName || 'product').replace(/[^a-z0-9\-_ ]/gi, '_').trim();
      const jobPath = `${outputDir}/${safeFolderName}`; 

      try {
        await window.electron.createDirectory(jobPath);
        const variantCounters: Record<string, number> = {};
        
        for (let i = 0; i < result.images.length; i++) {
          const img = result.images[i];
          const finalFileName = getFileName(img, safeFolderName, variantCounters);

          try {
              await window.electron.downloadFile(img.url, `${jobPath}/${finalFileName}`);
          } catch (e) {
            console.error("Save failed for image", img.url, e);
          } finally {
            processedCount++;
            setSaveProgress({ current: processedCount, total: totalImages });
          }
        }
      } catch (e) {
        console.error("Folder creation failed", e);
      }
    }

    setIsSaving(false);
    alert("Batch extraction complete! Files saved to your selected folder.");
  };

  return (
    <Layout>
      <BulkInput 
        onAddJobs={addJobs} 
        isProcessing={isProcessing} 
        qualityFilter={enableQualityFilter}
        setQualityFilter={setEnableQualityFilter}
        useAI={useAI}
        setUseAI={setUseAI}
      />

      <div className="w-full max-w-4xl mx-auto mt-10">
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
                  {isDesktop ? 'Desktop Mode' : 'Web Preview Mode'}
              </p>
              <h4 className="text-lg font-bold">
                  {isDesktop ? 'Save Directly to Disk' : 'Download Assets'}
              </h4>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
            {/* Select Folder Button - Only on Desktop */}
            {isDesktop && (
                <button 
                  onClick={handleSelectFolder}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {outputDir ? 'Change Folder' : 'Select Destination'}
                </button>
            )}

            {/* Save Button */}
            <button 
              onClick={isDesktop ? saveToDisk : downloadAsZip}
              disabled={isSaving || (isDesktop && !outputDir) || jobs.filter(j => j.status === AppStatus.SUCCESS).length === 0}
              className="px-10 py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 w-full md:w-auto min-w-[180px]"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{saveProgress ? `${Math.round((saveProgress.current / saveProgress.total) * 100)}%` : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isDesktop ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    )}
                  </svg>
                  <span>{isDesktop ? 'Start Batch Save' : 'Download ZIP'}</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {isDesktop && outputDir && (
          <div className="mt-4 text-center">
             <span className="text-xs text-slate-500 font-mono bg-slate-200 px-3 py-1 rounded-md">Output: {outputDir}</span>
          </div>
        )}
      </div>

      <div className="mt-12 w-full max-w-5xl mx-auto space-y-8 pb-40">
        {jobs.map((job) => (
          <div key={job.id} className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all ${
            job.status === AppStatus.SUCCESS ? 'border-emerald-100' : 
            job.status === AppStatus.ERROR ? 'border-rose-100' : 'border-slate-100 shadow-xl'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  job.status === AppStatus.SUCCESS ? 'bg-emerald-500' :
                  job.status === AppStatus.ERROR ? 'bg-rose-500' : 'bg-indigo-500 animate-pulse'
                }`}></div>
                <h3 className="font-bold text-lg text-slate-800 truncate">{job.result?.productName || job.url}</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full text-slate-500">
                {job.status}
              </span>
            </div>

            {job.status === AppStatus.SUCCESS && job.result && (
              <ResultsSection result={job.result} />
            )}
            
            {job.status === AppStatus.ERROR && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium">
                {job.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;
