
import React from 'react';
import { ExtractionResult } from '../types';
import { ImageCard } from './ImageCard';

interface ResultsSectionProps {
  result: ExtractionResult;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Found {result.images.length} High-Res Assets ({result.platform})
        </h4>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {result.images.map((img, idx) => (
          <ImageCard key={idx} image={img} />
        ))}
      </div>
    </div>
  );
};
