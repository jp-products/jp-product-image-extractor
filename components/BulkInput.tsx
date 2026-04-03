
import React, { useState, useRef } from 'react';
import { ExtractionJob, AppStatus } from '../types';

interface BulkInputProps {
  onAddJobs: (jobs: Partial<ExtractionJob>[]) => void;
  isProcessing: boolean;
  qualityFilter: boolean;
  setQualityFilter: (val: boolean) => void;
  useAI: boolean;
  setUseAI: (val: boolean) => void;
}

declare const XLSX: any;

export const BulkInput: React.FC<BulkInputProps> = ({ 
  onAddJobs, 
  isProcessing, 
  qualityFilter, 
  setQualityFilter,
  useAI,
  setUseAI
}) => {
  const [rows, setRows] = useState<{ url: string; folder: string }[]>(
    Array(5).fill({ url: '', folder: '' })
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRowChange = (index: number, field: 'url' | 'folder', value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const addRow = () => setRows([...rows, { url: '', folder: '' }]);
  
  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const headers = ["URL", "Folder"];
    const sampleData = [
      ["https://example-shop.com/products/item-1", "Summer Collection"],
      ["https://another-store.com/p/blue-shirt", "Apparel/Shirts"]
    ];
    
    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ecom_lens_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validJobs = rows
      .filter(r => r.url.trim().startsWith('http'))
      .map(r => ({ url: r.url.trim(), folderName: r.folder.trim() }));
    
    if (validJobs.length === 0) {
      alert("Please enter at least one valid product URL (starting with http:// or https://).");
      return;
    }
    
    setImportStatus(null);
    onAddJobs(validJobs);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Analyzing file structure...");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Use header: 1 to get raw rows first to check for variations
        const rawJson = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        if (rawJson.length < 1) throw new Error("File is empty");

        const headers = (rawJson[0] || []).map(h => String(h).toLowerCase().trim());
        const urlIdx = headers.findIndex(h => h.includes('url') || h.includes('link') || h === 'product');
        const folderIdx = headers.findIndex(h => h.includes('folder') || h.includes('dir') || h.includes('category') || h === 'name');

        if (urlIdx === -1) {
          setImportStatus("Header Error: No URL column found.");
          alert("Could not find a 'URL' column. Please use our template for the best results.");
          return;
        }

        const dataRows = rawJson.slice(1);
        const importedRows = dataRows.map(row => {
          const url = String(row[urlIdx] || '').trim();
          const folder = folderIdx !== -1 ? String(row[folderIdx] || '').trim() : '';
          return { url, folder };
        }).filter(item => item.url.startsWith('http'));

        if (importedRows.length > 0) {
          setRows(importedRows);
          setImportStatus(`Imported ${importedRows.length} items successfully.`);
        } else {
          setImportStatus("Data Error: No valid http links found.");
          alert("Found the columns, but no valid website links were found in the rows.");
        }
      } catch (err) {
        setImportStatus("Import Failed.");
        alert("We couldn't read this file. Please ensure it's a valid CSV or XLSX.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800">Batch Asset Import</h2>
            <p className="text-sm text-slate-500 font-medium">Add products manually or sync from your inventory file.</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
            <button 
              type="button"
              onClick={downloadTemplate}
              className="px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Template
            </button>

            <div className="relative">
              <input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Import Data
              </button>
            </div>
          </div>
        </div>

        {importStatus && (
          <div className={`px-8 py-3 text-xs font-black text-center border-b transition-all uppercase tracking-widest ${
            importStatus.includes('Imported') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
            importStatus.includes('Error') || importStatus.includes('Failed') ? 'bg-rose-50 text-rose-600 border-rose-100' : 
            'bg-indigo-50 text-indigo-600 border-indigo-100'
          }`}>
            {importStatus}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="max-h-[380px] overflow-y-auto pr-3 space-y-3 custom-scrollbar">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-4 group animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${idx * 40}ms` }}>
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors font-black text-[10px] pointer-events-none">URL</span>
                  <input
                    type="url"
                    placeholder="https://myshopify.com/products/blue-denim-jacket"
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-sm font-medium transition-all shadow-inner"
                    value={row.url}
                    onChange={(e) => handleRowChange(idx, 'url', e.target.value)}
                  />
                </div>
                <div className="hidden sm:block sm:w-1/3 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors font-black text-[10px] pointer-events-none">DIR</span>
                  <input
                    type="text"
                    placeholder="Product Category / Folder"
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-sm font-medium transition-all shadow-inner"
                    value={row.folder}
                    onChange={(e) => handleRowChange(idx, 'folder', e.target.value)}
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete row"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-50">
            <div className="flex flex-wrap items-center gap-4">
                <button 
                  type="button" 
                  onClick={addRow}
                  className="px-6 py-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-sm font-black flex items-center gap-2 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Row
                </button>
                
                {/* SETTINGS TOGGLES */}
                <div className="flex items-center gap-2">
                    {/* Quality Filter */}
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400 pl-2">Filter Quality</span>
                        <div className="flex items-center">
                            <button
                            type="button"
                            onClick={() => setQualityFilter(!qualityFilter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                qualityFilter 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            >
                            {qualityFilter ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>

                    {/* AI Mode Toggle */}
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400 pl-2">Mode</span>
                        <div className="flex items-center">
                            <button
                            type="button"
                            onClick={() => setUseAI(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                useAI 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            >
                            AI Smart
                            </button>
                            <button
                            type="button"
                            onClick={() => setUseAI(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                !useAI 
                                ? 'bg-white text-emerald-600 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            >
                            Unlimited
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full sm:w-auto px-16 py-5 rounded-[1.5rem] font-black text-white shadow-2xl transition-all flex items-center justify-center gap-4 text-xl ${
                isProcessing 
                ? 'bg-slate-400 cursor-not-allowed scale-95' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95 hover:-translate-y-1'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Extract Now</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
