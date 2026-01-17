import React, { useRef, useState } from 'react';
import { Upload, FileVideo, Image as ImageIcon } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
      // Reset input value to allow uploading the same file again if needed
      e.target.value = '';
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full p-8 md:p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group
        ${isDragging 
          ? 'border-primary bg-primary/10 scale-[1.01]' 
          : 'border-slate-700 hover:border-primary/50 hover:bg-slate-800/50'
        }
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        className="hidden"
        multiple
        accept="image/*,video/*"
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={`
          p-4 rounded-full transition-colors duration-300
          ${isDragging ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400 group-hover:text-primary group-hover:bg-slate-700'}
        `}>
          <Upload size={32} />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-slate-200 mb-1">
            Unggah Gambar atau Video
          </h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Tarik & lepas file di sini atau klik untuk mencari.
            <br />
            <span className="text-xs text-slate-500 mt-1 block">Mendukung JPG, PNG, MP4, MOV, WEBM</span>
          </p>
        </div>

        <div className="flex gap-4 text-slate-500 text-xs">
           <span className="flex items-center gap-1"><ImageIcon size={14} /> Gambar</span>
           <span className="flex items-center gap-1"><FileVideo size={14} /> Video</span>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;