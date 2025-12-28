
import React, { useState, useEffect } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExport: (settings: ExportSettings) => void;
  isExporting: boolean;
  progress: number;
  originalFormat?: string;
  originalWidth?: number;
  originalHeight?: number;
}

export interface ExportSettings {
  resolution: 'original' | '720p' | '1080p' | '4k';
  format: 'original' | 'mp4' | 'webm' | 'mov';
  quality: 'standard' | 'high' | 'ultra';
  fps: 30 | 60;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartExport, 
  isExporting, 
  progress,
  originalFormat,
  originalWidth,
  originalHeight
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    resolution: 'original',
    format: 'original',
    quality: 'high',
    fps: 30
  });

  // إعادة ضبط الإعدادات لتكون "الأصلية" افتراضياً عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setSettings(s => ({ ...s, resolution: 'original', format: 'original' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-12 space-y-8 shadow-2xl animate-[pop_0.4s_ease-out]">
        
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">إعدادات التصدير النهائي</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">الخيار الافتراضي يحافظ على جودة الفيديو الأصلية</p>
        </div>

        {!isExporting ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resolution */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">دقة الفيديو (Resolution)</label>
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setSettings({...settings, resolution: 'original'})}
                  className={`py-3 rounded-xl text-[10px] font-black transition-all ${settings.resolution === 'original' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  الأصلي ({originalWidth && originalHeight ? `${originalWidth}x${originalHeight}` : 'Auto'})
                </button>
                <select 
                  value={settings.resolution === 'original' ? '' : settings.resolution}
                  onChange={(e) => setSettings({...settings, resolution: e.target.value as any})}
                  className={`py-3 rounded-xl text-[10px] font-black bg-transparent outline-none text-center ${settings.resolution !== 'original' ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                  <option value="" disabled>تغيير الدقة</option>
                  <option value="720p" className="bg-slate-900">720p HD</option>
                  <option value="1080p" className="bg-slate-900">1080p Full HD</option>
                  <option value="4k" className="bg-slate-900">4K Ultra HD</option>
                </select>
              </div>
            </div>

            {/* Format */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">التنسيق (Format)</label>
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setSettings({...settings, format: 'original'})}
                  className={`py-3 rounded-xl text-[10px] font-black transition-all ${settings.format === 'original' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  الأصلي ({originalFormat?.toUpperCase() || 'Auto'})
                </button>
                <select 
                  value={settings.format === 'original' ? '' : settings.format}
                  onChange={(e) => setSettings({...settings, format: e.target.value as any})}
                  className={`py-3 rounded-xl text-[10px] font-black bg-transparent outline-none text-center ${settings.format !== 'original' ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                  <option value="" disabled>تغيير التنسيق</option>
                  <option value="mp4" className="bg-slate-900">MP4</option>
                  <option value="webm" className="bg-slate-900">WEBM</option>
                  <option value="mov" className="bg-slate-900">MOV</option>
                </select>
              </div>
            </div>

            {/* Quality/Bitrate */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">معدل البت (Quality)</label>
              <select 
                value={settings.quality}
                onChange={(e) => setSettings({...settings, quality: e.target.value as any})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black outline-none focus:border-indigo-500"
              >
                <option value="standard" className="bg-slate-900">Standard (خفيف للسوشيال)</option>
                <option value="high" className="bg-slate-900">High (جودة عالية متوازنة)</option>
                <option value="ultra" className="bg-slate-900">Ultra (أقصى جودة بدون ضغط)</option>
              </select>
            </div>

            {/* FPS */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">سلاسة الحركة (FPS)</label>
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                {[30, 60].map(fps => (
                  <button 
                    key={fps} 
                    onClick={() => setSettings({...settings, fps: fps as any})}
                    className={`py-3 rounded-xl text-[10px] font-black transition-all ${settings.fps === fps ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 space-y-8">
            <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-black italic animate-pulse">جاري دمج النصوص... {progress}%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">يرجى عدم إغلاق المتصفح حتى اكتمال التصدير</p>
            </div>
          </div>
        )}

        {!isExporting && (
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => onStartExport(settings)}
              className="flex-[2] py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>بدء التصدير</span>
            </button>
            <button 
              onClick={onClose}
              className="flex-1 py-6 bg-white/5 text-slate-400 rounded-[2rem] font-black text-sm hover:bg-white/10 transition-all"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;
