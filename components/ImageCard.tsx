
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
      // Stage 1: Try original URL if it exists and is different
      if (image.originalUrl && image.originalUrl !== image.url) {
        console.log(`Retry 1 (Original) for: ${image.url}`);
        setRetryStage(1);
        setImgSrc(image.originalUrl);
      } else {
        // Skip to proxy if no original URL
        handleRetry(2);
      }
    } else if (retryStage === 1) {
      handleRetry(2);
    } else if (retryStage === 2) {
      handleRetry(3);
    } else {
      setHasError(true);
    }
  };

  const handleRetry = (stage: number) => {
    setRetryStage(stage);
    if (stage === 2) {
      console.log(`Retry 2 (Proxy) for: ${image.url}`);
      setImgSrc(`https://corsproxy.io/?url=${encodeURIComponent(image.url)}`);
    } else if (stage === 3) {
      console.log(`Retry 3 (AllOrigins) for: ${image.url}`);
      setImgSrc(`https://api.allorigins.win/raw?url=${encodeURIComponent(image.url)}`);
    }
  };

  if (hasError) return null;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
      <div className="aspect-square w-full overflow-hidden bg-slate-100 flex items-center justify-center relative">
        <img
          src={imgSrc}
          alt="Product asset"
          className={`object-contain w-full h-full group-hover:scale-105 transition-transform duration-500 ${retryStage > 0 ? 'opacity-90' : ''}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
        
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
    </div>
  );
};
