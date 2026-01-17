import React, { useState } from 'react';
import { Copy, Check, Trash2, ScanLine, AlertCircle, Loader2 } from 'lucide-react';
import { UploadedFile } from '../types';
import { extractUsernameFromMedia } from '../services/geminiService';

interface FileCardProps {
  fileData: UploadedFile;
  onRemove: (id: string) => void;
  onCopy: (text: string) => void;
  onUpdateAiName: (id: string, name: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({ fileData, onRemove, onCopy, onUpdateAiName }) => {
  const [copied, setCopied] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = (text: string, isAi: boolean) => {
    onCopy(text);
    if (isAi) {
      setCopiedAi(true);
      setTimeout(() => setCopiedAi(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleScan = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isScanning) return;

    // Check file size for AI scan (client-side limits)
    if (fileData.file.size > 10 * 1024 * 1024) { // 10MB limit for safe client-side base64
       setError("File terlalu besar (>10MB)");
       return;
    }

    setIsScanning(true);
    setError(null);
    try {
      const result = await extractUsernameFromMedia(fileData.file);
      onUpdateAiName(fileData.id, result);
    } catch (err: any) {
      // Gunakan pesan error dari service jika ada (misal: API Key missing)
      setError(err.message || "Gagal memindai");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 animate-slide-up flex flex-col md:flex-row h-auto md:h-32">
      
      {/* Thumbnail Section */}
      <div className="relative w-full md:w-32 h-32 bg-slate-900 shrink-0 flex items-center justify-center overflow-hidden">
        {fileData.type === 'video' ? (
          <video 
            src={fileData.previewUrl} 
            className="w-full h-full object-cover opacity-80"
            muted
            playsInline
          />
        ) : (
          <img 
            src={fileData.previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
        
        {/* Remove Button (Mobile Overlay) */}
        <button
          onClick={() => onRemove(fileData.id)}
          className="md:hidden absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        
        {/* Header (Filename) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Nama File (Username)
            </p>
            <div 
              onClick={() => handleCopy(fileData.filename, false)}
              className="group/filename flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-full"
              title="Klik untuk menyalin"
            >
              {/* Fix: Added min-w-0 and truncate to h3, shrink-0 to button so text truncates first */}
              <h3 className="text-lg font-bold text-white truncate font-mono select-all flex-1 min-w-0">
                {fileData.filename}
              </h3>
              <div className={`shrink-0 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors whitespace-nowrap ${copied ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400 group-hover/filename:bg-slate-600'}`}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Tersalin' : 'Salin'}
              </div>
            </div>
          </div>

          {/* Desktop Remove Button */}
          <button
            onClick={() => onRemove(fileData.id)}
            className="hidden md:flex shrink-0 p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-all"
            title="Hapus file"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* AI Scan Section */}
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          {fileData.aiExtractedName ? (
             <div className="flex flex-col min-w-0">
                <p className="text-[10px] font-medium text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ScanLine size={10} /> Terdeteksi AI
                </p>
                <div 
                  onClick={() => handleCopy(fileData.aiExtractedName!, true)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 w-full"
                >
                  <span className="text-sm text-slate-200 font-mono truncate max-w-[200px] flex-1">
                    {fileData.aiExtractedName}
                  </span>
                   <div className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors whitespace-nowrap ${copiedAi ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {copiedAi ? <Check size={10} /> : <Copy size={10} />}
                  </div>
                </div>
             </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isScanning ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Memindai...
                  </>
                ) : (
                  <>
                    <ScanLine size={12} /> Pindai Gambar (AI)
                  </>
                )}
              </button>
              {error && (
                <span className="text-[10px] text-red-400 flex items-center gap-1 truncate max-w-[150px]" title={error}>
                  <AlertCircle size={10} /> {error}
                </span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FileCard;