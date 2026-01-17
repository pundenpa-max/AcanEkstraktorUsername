import React, { useState, useCallback } from 'react';
import Dropzone from './components/Dropzone';
import FileCard from './components/FileCard';
import { UploadedFile, ToastMessage } from './types';
import { cleanFilename, generateId, getFileType } from './utils/fileUtils';
import { Toaster, toast } from 'react-hot-toast';
import { Github, Fingerprint, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const processedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      filename: cleanFilename(file.name),
      type: getFileType(file),
      status: 'idle',
    }));

    setFiles((prev) => [...processedFiles, ...prev]);
    if (processedFiles.length > 0) {
      toast.success(`${processedFiles.length} file ditambahkan`);
    }
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Disalin ke clipboard!', {
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155',
        },
        iconTheme: {
          primary: '#4ade80',
          secondary: '#1e293b',
        },
      });
    });
  }, []);

  const handleUpdateAiName = useCallback((id: string, name: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, aiExtractedName: name } : f));
    toast.success('Username berhasil diekstrak!', {
        icon: '🤖',
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #7c3aed',
        }
    });
  }, []);

  const handleClearAll = () => {
    if (files.length === 0) return;

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-slate-200">
          Yakin ingin menghapus semua file?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Cleanup URLs
              files.forEach(f => URL.revokeObjectURL(f.previewUrl));
              setFiles([]);
              toast.dismiss(t.id);
              toast.success('Semua file dihapus');
            }}
            className="flex-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-sm font-medium hover:bg-red-500/30 transition-colors"
          >
            Ya, Hapus
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-3 py-1.5 bg-slate-700 text-slate-300 border border-slate-600 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#1e293b',
        border: '1px solid #334155',
        padding: '16px',
        color: '#f1f5f9',
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-primary/30">
      <Toaster position="bottom-center" />
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-xl mb-4">
            <Fingerprint className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Acan Ekstraktor Username
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Unggah gambar atau video untuk mengekstrak <span className="text-white font-medium">nama file</span> sebagai username secara instan. 
            <br className="hidden md:block"/>
            Atau gunakan <span className="text-purple-400 font-medium">Gemini AI</span> untuk memindai teks pada gambar.
          </p>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          
          <Dropzone onFilesAdded={handleFilesAdded} />

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-semibold text-slate-200">
                  File Terkstrak <span className="text-slate-500 text-sm font-normal ml-2">({files.length})</span>
                </h2>
                <button 
                  onClick={handleClearAll}
                  className="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                  Hapus Semua
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {files.map((file) => (
                  <FileCard 
                    key={file.id} 
                    fileData={file} 
                    onRemove={handleRemoveFile} 
                    onCopy={handleCopy}
                    onUpdateAiName={handleUpdateAiName}
                  />
                ))}
              </div>
            </div>
          )}

          {files.length === 0 && (
            <div className="text-center py-12 text-slate-600">
               <p>Belum ada file yang diunggah.</p>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Acan Ekstraktor Username.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;