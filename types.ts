export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  filename: string; // The extracted username from filename
  aiExtractedName?: string; // The extracted username from AI analysis
  type: 'image' | 'video' | 'unknown';
  status: 'idle' | 'analyzing' | 'success' | 'error';
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}
