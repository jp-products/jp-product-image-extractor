
import React, { useState } from 'react';
import { ExtractedImage } from '../types';

interface ImageCardProps {
  image: ExtractedImage;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const [imgSrc, setImgSrc] = useState(image.url);
  const [hasError, setHasError] = useState(false);
  const [retryStage, setRetryStage] = useState(0); // 0: Initial, 1: Proxy 1, 2: Proxy 2

  const handleError = () => {
    if (retryStage === 0) {
      // Stage 1: Try corsproxy.io
      console.log(`Retry 1 (Proxy) for: ${image.url}`);
      setRetryStage(1);
      setImgSrc(`https://corsproxy.io/?url=${encodeURIComponent(image.url)}`);
    } else if (retryStage === 1) {
      // Stage 2: Try allorigins.win (often works when others fail)
      console.log(`Retry 2 (AllOrigins) for: ${image.url}`);
      setRetryStage(2);
      setImgSrc(`https://api.allorigins.win/raw?url=${encodeURIComponent(image.url)}`);
    } else {
      // Final Failure
      setHasError(true);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
      <div className="aspect-square w-full overflow-hidden bg-slate-100 flex items-center justify-center relative">
        {!hasError ? (
          <img
            src={imgSrc}
            alt="Product asset"
            className={`object-contain w-full h-full group-hover:scale-105 transition-transform duration-500 ${retryStage > 0 ? 'opacity-90' : ''}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 p-4 text-center">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold uppercase">Load Failed</span>
          </div>
        )}
        
        {/* Loading Spinner for Retry */}
        {retryStage > 0 && !hasError && (
          <div className="absolute top-2 right-2">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-white">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
            image.sourceType === 'gallery' ? 'bg-indigo-100 text-indigo-700' : 
            image.sourceType === 'hero' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {image.sourceType}
          </span>
          {image.variantName && (
             <span className="text-[10px] bg-slate-800 text-white font-bold px-1.5 py-0.5 rounded ml-1 truncate max-w-[60px]">
               {image.variantName}
             </span>
          )}
        </div>
        <div className="truncate text-xs text-slate-400 font-mono">
          {image.url.split('/').pop()?.split('?')[0] || 'Asset'}
        </div>
      </div>
      
      {!hasError && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <a 
            href={imgSrc} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-white rounded-full text-slate-900 hover:bg-indigo-600 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};
