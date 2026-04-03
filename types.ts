
export interface ExtractedImage {
  url: string;
  altText?: string;
  resolution?: string;
  sourceType: 'gallery' | 'hero' | 'thumbnail' | 'variant';
  variantName?: string; // Added for specific file naming
  confidence: number;
}

export interface ExtractionResult {
  productName: string;
  images: ExtractedImage[];
  platform: string;
  success: boolean;
  message?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',
  FETCHING = 'FETCHING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ExtractionJob {
  id: string;
  url: string;
  folderName: string;
  status: AppStatus;
  result?: ExtractionResult;
  error?: string;
}
