
import React, { useRef } from 'react';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  translations: any;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, translations }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div 
      className="border-2 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center transition-all cursor-pointer border-blue-600/30 hover:border-blue-500 hover:bg-blue-500/5 bg-blue-950/10 group active:scale-[0.99]"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="video/*" 
        onChange={handleFileChange}
      />
      <div className="bg-blue-600 w-24 h-24 rounded-2xl flex items-center justify-center mb-8 shadow-[0_15px_40px_rgba(0,102,255,0.4)] group-hover:scale-110 transition-transform border border-blue-400/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 className="text-3xl font-black mb-4 italic tracking-tight text-blue-50">{translations.uploaderTitle}</h3>
      <p className="text-blue-400 text-center max-w-sm text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
        {translations.uploaderDesc}
      </p>
    </div>
  );
};

export default VideoUploader;
