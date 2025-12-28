
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CaptionSegment, AssetSegment, CaptionStyle, StyleConfig, CaptionAnimation, Language } from './types';
import VideoUploader from './components/VideoUploader';
import AnimatedCaptions from './components/AnimatedCaptions';
import AssetOverlay from './components/AssetOverlay';
import ExportModal from './components/ExportModal';
import { removeBackgroundAI } from './services/geminiService';
import { makeColorTransparent } from './utils/imageProcessor';

const GLOBAL_FONTS = [
  "Alexandria", "Almarai", "Amiri", "Aref Ruqaa", "Baloo Bhaijaan 2", "Bebas Neue", 
  "Cairo", "Changa", "El Messiri", "IBM Plex Sans Arabic", "Inter", "Jomhuria", 
  "Kufam", "Lateef", "Lemonada", "Mada", "Markazi Text", "Montserrat", 
  "Noto Sans Arabic", "Oswald", "Playfair Display", "Poppins", "Qahiri", 
  "Readex Pro", "Reem Kufi", "Roboto Condensed", "Tajawal", "Vibur", "Anton", "Righteous"
];

const TRANSLATIONS: Record<Language, any> = {
  [Language.AR]: {
    dir: 'rtl',
    subtitle: 'هندسة ذكاء الفيديو',
    aboutDev: 'عن البرنامج والمطور',
    importText: 'استيراد نص',
    addAsset: 'إضافة ملصق',
    timeline: 'إطار العمل (التايم لاين)',
    add: 'إضافة نص',
    export: 'تصدير نهائي',
    fontSize: 'الحجم',
    fontFamily: 'الخط',
    animation: 'المؤثر الحركي',
    yPos: 'الارتفاع',
    styleLabel: 'النمط البصري',
    colorText: 'لون النص',
    colorBox: 'لون الخلفية',
    cancel: 'إلغاء',
    importTitle: 'استيراد نص السيناريو',
    importBtn: 'توزيع النص الآن',
    processing: 'جاري المعالجة الرقمية...',
    assetTitle: 'مكتبة الملصقات',
    assetSub: 'اختر ملصقاً أو ارفع صورتك',
    geometry3d: 'هندسة النصوص (3D)',
    assetGeometry3d: 'مفتش الملصق الذكي',
    perspective: 'المنظور',
    rotationX: 'دوران X',
    rotationY: 'دوران Y',
    rotationZ: 'دوران Z',
    skewX: 'التواء X',
    skewY: 'التواء Y',
    assetAnimation: 'المؤثر',
    assetScale: 'الحجم',
    assetX: 'أفقي',
    assetY: 'رأسي',
    dragTip: 'اسحب الملصق مباشرة في الشاشة للموضع'
  },
  [Language.EN]: {
    dir: 'ltr',
    subtitle: 'Video Intelligence Engine',
    aboutDev: 'About Program & Developer',
    importText: 'Import Script',
    addAsset: 'Add Asset',
    timeline: 'Timeline Precision',
    add: 'Add Caption',
    export: 'Export Video',
    fontSize: 'Size',
    fontFamily: 'Font',
    animation: 'Motion Effect',
    yPos: 'Height',
    styleLabel: 'Visual Style',
    colorText: 'Text Color',
    colorBox: 'Box Color',
    cancel: 'Cancel',
    importTitle: 'Import Script Text',
    importBtn: 'Process Text',
    processing: 'Digital Processing...',
    assetTitle: 'Asset Library',
    assetSub: 'Choose sticker or upload image',
    geometry3d: 'Text Geometry (3D)',
    assetGeometry3d: 'Smart Asset Inspector',
    perspective: 'Perspective',
    rotationX: 'Rotate X',
    rotationY: 'Rotate Y',
    rotationZ: 'Rotate Z',
    skewX: 'Skew X',
    skewY: 'Skew Y',
    assetAnimation: 'Effect',
    assetScale: 'Scale',
    assetX: 'X Pos',
    assetY: 'Y Pos',
    dragTip: 'Drag sticker directly on screen to position'
  }
};

const BASE_3D = { rotateX: 0, rotateY: 0, rotateZ: 0, perspective: 1000, skewX: 0, skewY: 0 };

const DEFAULT_STYLE_CONFIGS: Record<CaptionStyle, StyleConfig> = {
  [CaptionStyle.POP]: { ...BASE_3D, textColor: '#facc15', backgroundColor: 'transparent', fontSize: 90, fontFamily: 'Cairo', animation: CaptionAnimation.POP_ELASTIC, yPos: 50, isVisible: true },
  [CaptionStyle.HIGHLIGHT]: { ...BASE_3D, rotateX: 10, rotateZ: -3, textColor: '#ffffff', backgroundColor: '#e11d48', fontSize: 60, fontFamily: 'Alexandria', animation: CaptionAnimation.ROTATE, yPos: 75, isVisible: true },
  [CaptionStyle.SHINE]: { ...BASE_3D, textColor: '#38bdf8', backgroundColor: 'transparent', fontSize: 75, fontFamily: 'Bebas Neue', animation: CaptionAnimation.FLASH, yPos: 50, isVisible: true },
  [CaptionStyle.MINIMAL]: { ...BASE_3D, textColor: '#ffffff', backgroundColor: 'rgba(0,0,0,0.8)', fontSize: 40, fontFamily: 'Tajawal', animation: CaptionAnimation.FADE, yPos: 85, isVisible: true },
  [CaptionStyle.NEON]: { ...BASE_3D, textColor: '#00d4ff', backgroundColor: 'transparent', fontSize: 80, fontFamily: 'Anton', animation: CaptionAnimation.PULSE, yPos: 45, isVisible: true },
  [CaptionStyle.LUXURY]: { ...BASE_3D, rotateX: 20, perspective: 500, textColor: '#d4af37', backgroundColor: 'transparent', fontSize: 65, fontFamily: 'Playfair Display', animation: CaptionAnimation.FADE, yPos: 50, isVisible: true },
  [CaptionStyle.CYBER]: { ...BASE_3D, skewX: -10, textColor: '#00ffff', backgroundColor: 'transparent', fontSize: 85, fontFamily: 'Righteous', animation: CaptionAnimation.GLITCH, yPos: 55, isVisible: true },
  [CaptionStyle.RETRO]: { ...BASE_3D, textColor: '#ff0055', backgroundColor: '#000', fontSize: 70, fontFamily: 'Changa', animation: CaptionAnimation.WOBBLE, yPos: 60, isVisible: true },
  [CaptionStyle.IMPACT]: { ...BASE_3D, rotateY: 15, textColor: '#fff', backgroundColor: 'transparent', fontSize: 120, fontFamily: 'Anton', animation: CaptionAnimation.ZOOM_IN, yPos: 50, isVisible: true },
  [CaptionStyle.GLASS]: { ...BASE_3D, textColor: '#fff', backgroundColor: 'transparent', fontSize: 55, fontFamily: 'Montserrat', animation: CaptionAnimation.BLUR_IN, yPos: 70, isVisible: true },
  [CaptionStyle.STICKER]: { ...BASE_3D, rotateZ: 5, textColor: '#000', backgroundColor: '#fff', fontSize: 60, fontFamily: 'Poppins', animation: CaptionAnimation.RUBBER_BAND, yPos: 65, isVisible: true },
  [CaptionStyle.OUTLINE]: { ...BASE_3D, textColor: '#007bff', backgroundColor: 'transparent', fontSize: 100, fontFamily: 'Oswald', animation: CaptionAnimation.SKEW, yPos: 50, isVisible: true },
  [CaptionStyle.GRADIENT]: { ...BASE_3D, textColor: '#0066ff', backgroundColor: '#00d4ff', fontSize: 90, fontFamily: 'Inter', animation: CaptionAnimation.SPIRAL, yPos: 50, isVisible: true },
  [CaptionStyle.SHADOW_DEEP]: { ...BASE_3D, textColor: '#fff', backgroundColor: 'transparent', fontSize: 80, fontFamily: 'Roboto Condensed', animation: CaptionAnimation.SLIDE_UP, yPos: 50, isVisible: true },
  [CaptionStyle.SKEWED]: { ...BASE_3D, skewX: 15, textColor: '#fde047', backgroundColor: 'transparent', fontSize: 90, fontFamily: 'Cairo', animation: CaptionAnimation.SKEW, yPos: 50, isVisible: true },
  [CaptionStyle.FIRE]: { ...BASE_3D, textColor: '#ff4500', backgroundColor: 'transparent', fontSize: 85, fontFamily: 'Cairo', animation: CaptionAnimation.WAVE, yPos: 50, isVisible: true },
  [CaptionStyle.CLEAN]: { ...BASE_3D, textColor: '#1e293b', backgroundColor: '#f1f5f9', fontSize: 45, fontFamily: 'Readex Pro', animation: CaptionAnimation.FADE, yPos: 80, isVisible: true },
  [CaptionStyle.TYPEWRITER]: { ...BASE_3D, textColor: '#007bff', backgroundColor: 'rgba(0,0,0,0.9)', fontSize: 50, fontFamily: 'IBM Plex Sans Arabic', animation: CaptionAnimation.NONE, yPos: 70, isVisible: true },
  [CaptionStyle.FLASHY]: { ...BASE_3D, textColor: '#fff', backgroundColor: 'transparent', fontSize: 110, fontFamily: 'Anton', animation: CaptionAnimation.FLASH, yPos: 50, isVisible: true },
  [CaptionStyle.BOLD_BOX]: { ...BASE_3D, textColor: '#000', backgroundColor: '#007bff', fontSize: 65, fontFamily: 'Tajawal', animation: CaptionAnimation.JELLO, yPos: 50, isVisible: true },
  [CaptionStyle.FLOATING]: { ...BASE_3D, textColor: '#94a3b8', backgroundColor: 'transparent', fontSize: 55, fontFamily: 'Lateef', animation: CaptionAnimation.SWING, yPos: 40, isVisible: true },
  [CaptionStyle.SOFT_GLOW]: { ...BASE_3D, textColor: '#fff', backgroundColor: 'transparent', fontSize: 75, fontFamily: 'Cairo', animation: CaptionAnimation.HEARTBEAT, yPos: 50, isVisible: true },
  [CaptionStyle.GHOST_STYLE]: { ...BASE_3D, textColor: '#ffffff', backgroundColor: 'transparent', fontSize: 80, fontFamily: 'Bebas Neue', animation: CaptionAnimation.GHOST, yPos: 50, isVisible: true },
  [CaptionStyle.MODERN_BOLD]: { ...BASE_3D, textColor: '#fff', backgroundColor: '#000', fontSize: 70, fontFamily: 'Alexandria', animation: CaptionAnimation.SLIDE_UP, yPos: 85, isVisible: true },
  [CaptionStyle.EXPLOSION]: { ...BASE_3D, textColor: '#ffcc00', backgroundColor: 'transparent', fontSize: 110, fontFamily: 'Anton', animation: CaptionAnimation.EXPLODE, yPos: 50, isVisible: true },
  [CaptionStyle.MATRIX]: { ...BASE_3D, textColor: '#00ff41', backgroundColor: '#000', fontSize: 60, fontFamily: 'IBM Plex Sans Arabic', animation: CaptionAnimation.GLITCH, yPos: 50, isVisible: true },
  [CaptionStyle.COMIC]: { ...BASE_3D, rotateX: 15, rotateZ: 5, textColor: '#000', backgroundColor: '#ffcc00', fontSize: 80, fontFamily: 'Changa', animation: CaptionAnimation.STAMP, yPos: 50, isVisible: true },
  [CaptionStyle.ECHO]: { ...BASE_3D, rotateY: -20, textColor: '#ffffff', backgroundColor: 'transparent', fontSize: 70, fontFamily: 'Montserrat', animation: CaptionAnimation.SHATTER, yPos: 50, isVisible: true },
  [CaptionStyle.CYBERPUNK]: { ...BASE_3D, skewX: -15, rotateX: 5, textColor: '#f0f', backgroundColor: '#0ff', fontSize: 85, fontFamily: 'Righteous', animation: CaptionAnimation.LIGHT_SPEED, yPos: 50, isVisible: true },
  [CaptionStyle.PHANTOM]: { ...BASE_3D, textColor: '#999', backgroundColor: 'transparent', fontSize: 75, fontFamily: 'Cairo', animation: CaptionAnimation.SMOKE, yPos: 50, isVisible: true },
};

const ALL_STYLE_KEYS = Object.keys(DEFAULT_STYLE_CONFIGS) as CaptionStyle[];
const ALL_ANIMATION_KEYS = Object.values(CaptionAnimation);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.AR);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [assets, setAssets] = useState<AssetSegment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeStyle, setActiveStyle] = useState<CaptionStyle>(CaptionStyle.POP);
  const [styleConfigs, setStyleConfigs] = useState<Record<CaptionStyle, StyleConfig>>(DEFAULT_STYLE_CONFIGS);
  const [originalMetadata, setOriginalMetadata] = useState<{ width: number, height: number, type: string } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS[Language.AR];

  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  const handleFileSelect = async (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setOriginalMetadata({ width: tempVideo.videoWidth, height: tempVideo.videoHeight, type: file.type });
    };
  };

  const updateAsset = useCallback((id: string, key: keyof AssetSegment, value: any) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, [key]: value } : a));
  }, []);

  const updateCaptionTime = (id: string, key: 'start' | 'end', value: number) => {
    const newVal = Math.max(0, parseFloat(value.toFixed(1)));
    setCaptions(prev => prev.map(c => c.id === id ? { ...c, [key]: newVal } : c));
    if (videoRef.current) {
      videoRef.current.currentTime = newVal; // Live seek to see synchronization
    }
  };

  const adjustCaptionTime = (id: string, key: 'start' | 'end', delta: number) => {
    const currentSeg = captions.find(c => c.id === id);
    if (!currentSeg) return;
    const newVal = Math.max(0, parseFloat((currentSeg[key] + delta).toFixed(1)));
    updateCaptionTime(id, key, newVal);
  };

  const syncTimeWithVideo = (id: string, key: 'start' | 'end') => {
    if (videoRef.current) {
      updateCaptionTime(id, key, videoRef.current.currentTime);
    }
  };

  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (!selectedAssetId) return;
    setIsDragging(true);
  };

  const handleStageMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedAssetId || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    updateAsset(selectedAssetId, 'x', Math.min(100, Math.max(0, x)));
    updateAsset(selectedAssetId, 'y', Math.min(100, Math.max(0, y)));
  };

  const handleStageMouseUp = () => {
    setIsDragging(false);
  };

  const handleLocalAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAiProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64WithPrefix = event.target?.result as string;
      const base64Data = base64WithPrefix.split(',')[1];
      try {
        const aiUrl = await removeBackgroundAI(base64Data, file.type);
        const transparentUrl = await makeColorTransparent(aiUrl);
        const newAsset: AssetSegment = { 
          id: `asset-${Date.now()}`, 
          url: transparentUrl, 
          type: 'image',
          start: currentTime, 
          end: currentTime+5, 
          x:50, y:50, scale:1, rotation:0, 
          animation: CaptionAnimation.POP_ELASTIC,
          rotateX: 0, rotateY: 0, rotateZ: 0, perspective: 1000, skewX: 0, skewY: 0 
        };
        setAssets([...assets, newAsset]);
        setSelectedAssetId(newAsset.id);
      } catch {
        const newAsset: AssetSegment = { id: `asset-${Date.now()}`, url: base64WithPrefix, type: 'image', start: currentTime, end: currentTime+5, x:50, y:50, scale:1, rotation:0, animation: CaptionAnimation.POP_ELASTIC, rotateX: 0, rotateY: 0, rotateZ: 0, perspective: 1000, skewX: 0, skewY: 0 };
        setAssets([...assets, newAsset]);
        setSelectedAssetId(newAsset.id);
      } finally {
        setIsAiProcessing(false);
        setShowAssetModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateConfig = (key: keyof StyleConfig, value: any) => {
    setStyleConfigs(prev => ({
      ...prev,
      [activeStyle]: {
        ...prev[activeStyle],
        [key]: value
      }
    }));
  };

  const handleImportText = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const newCaptions: CaptionSegment[] = lines.map((line, index) => ({
      id: `seg-${Date.now()}-${index}`,
      start: index * 2,
      end: (index + 1) * 2,
      text: line.trim()
    }));
    setCaptions(newCaptions);
    setShowImportModal(false);
    setRawText('');
  };

  const activeAsset = assets.find(a => a.id === selectedAssetId);

  return (
    <div className={`min-h-screen text-slate-100 font-['Cairo'] bg-[#00040a] ${t.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
      {isAiProcessing && (
        <div className="fixed inset-0 z-[10005] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-fade">
           <div className="w-24 h-24 border-4 border-blue-600/10 border-t-blue-500 rounded-full animate-spin mb-8 shadow-[0_0_80px_rgba(0,102,255,0.6)]" />
           <p className="text-3xl font-black italic text-blue-400 animate-pulse tracking-tighter">{t.processing}</p>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="border-b border-blue-900/40 bg-black/60 backdrop-blur-3xl sticky top-0 z-[1000] px-8 py-5 flex items-center justify-between shadow-[0_5px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-5 group cursor-pointer" onClick={() => setShowAboutModal(true)}>
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 w-14 h-14 rounded-2xl flex items-center justify-center font-black italic shadow-[0_0_30px_rgba(0,102,255,0.6)] text-white transform group-hover:rotate-12 transition-all relative border border-blue-400/30">
            <span className="text-xl">DT</span>
            <span className="absolute -bottom-1 -right-1 text-[10px] bg-blue-500 rounded-lg px-1.5 shadow-lg flex items-center justify-center border border-white/20">📽️</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">DT-CAPTION <span className="text-blue-400 bg-blue-500/10 px-2 rounded-lg border border-blue-500/30">PRO</span></h1>
            <p className="text-[9px] text-blue-400/60 uppercase font-black tracking-[0.3em]">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowAssetModal(true)} className="neon-box bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-6 py-3 rounded-2xl border border-cyan-500/30 font-black text-[11px] transition-all active:scale-95 shadow-lg">🖼️ {t.addAsset}</button>
          <button onClick={() => setShowImportModal(true)} className="neon-box bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-6 py-3 rounded-2xl border border-blue-500/30 font-black text-[11px] transition-all active:scale-95 shadow-lg">📝 {t.importText}</button>
        </div>
        <div className="flex items-center gap-6">
          <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-black text-blue-400 outline-none hover:bg-white/10 transition-all cursor-pointer">
            <option value={Language.AR} className="bg-slate-900">ARABIC</option>
            <option value={Language.EN} className="bg-slate-900">ENGLISH</option>
          </select>
          <button onClick={() => setShowAboutModal(true)} className="text-blue-500 text-2xl hover:scale-110 transition-transform active:scale-90">ℹ️</button>
        </div>
      </nav>

      <main className="max-w-[1920px] mx-auto p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Work Area */}
        <div className="lg:col-span-9 space-y-10">
          {!videoUrl ? (
            <VideoUploader onFileSelect={handleFileSelect} translations={t} />
          ) : (
            <div className="space-y-10 animate-fade">
              
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className={`xl:col-span-${activeAsset ? '8' : '12'} relative group`}>
                  {selectedAssetId && <div className="absolute -top-10 left-0 text-[11px] font-black text-cyan-400 animate-pulse flex items-center gap-2"><span>🖱️</span> {t.dragTip}</div>}
                  <div 
                    ref={stageRef}
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                    onMouseLeave={handleStageMouseUp}
                    className="neon-box flex justify-center bg-black rounded-[3.5rem] p-8 border border-blue-900/50 relative overflow-hidden min-h-[600px] items-center shadow-[0_40px_120px_rgba(0,0,0,0.9)]"
                  >
                    <div className={`relative bg-black shadow-2xl rounded-2xl overflow-hidden pointer-events-none ${originalMetadata && originalMetadata.height > originalMetadata.width ? 'h-[750px] w-auto' : 'w-full h-auto'}`}>
                      <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain" onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)} controls />
                      <AnimatedCaptions currentTime={currentTime} segments={captions} style={activeStyle} config={styleConfigs[activeStyle]} />
                      <AssetOverlay currentTime={currentTime} assets={assets} selectedId={selectedAssetId} onAssetClick={(id) => setSelectedAssetId(id)} />
                    </div>
                  </div>
                </div>

                {/* 3D Asset Floating Inspector */}
                {activeAsset && (
                  <div className="neon-box xl:col-span-4 bg-gradient-to-b from-cyan-950/40 to-black/90 p-8 rounded-[3.5rem] border border-cyan-500/40 space-y-8 animate-pop-elastic h-[750px] overflow-y-auto custom-scrollbar backdrop-blur-3xl shadow-[0_0_60px_rgba(0,102,255,0.2)]">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-5">
                       <h3 className="text-md font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2"><span>💎</span> {t.assetGeometry3d}</h3>
                       <button onClick={() => setSelectedAssetId(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-400 hover:bg-red-500 hover:text-white transition-all">✕</button>
                    </div>
                    <div className="space-y-7">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-cyan-300 uppercase block tracking-tighter">نوع التحريك (Animation)</label>
                        <select value={activeAsset.animation} onChange={(e) => updateAsset(activeAsset.id, 'animation', e.target.value as any)} className="w-full bg-black/60 border border-cyan-500/30 rounded-2xl p-4 text-[13px] font-black outline-none text-white focus:border-cyan-400 shadow-inner">
                          {ALL_ANIMATION_KEYS.map(anim => <option key={anim} value={anim} className="bg-slate-900">{anim.toUpperCase().replace(/-/g, ' ')}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-cyan-400 uppercase block">{t.assetScale} ({activeAsset.scale})</label>
                          <input type="range" min="0.1" max="5" step="0.1" value={activeAsset.scale} onChange={(e) => updateAsset(activeAsset.id, 'scale', parseFloat(e.target.value))} className="w-full accent-cyan-500" />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-cyan-400 uppercase block">{t.perspective} ({activeAsset.perspective})</label>
                          <input type="range" min="200" max="3000" step="50" value={activeAsset.perspective} onChange={(e) => updateAsset(activeAsset.id, 'perspective', parseInt(e.target.value))} className="w-full accent-cyan-500" />
                        </div>
                      </div>
                      <div className="bg-black/50 p-6 rounded-[3rem] border border-blue-500/20 space-y-6">
                         <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_#0066ff] animate-pulse" /> <span className="text-[11px] font-black text-blue-400 tracking-widest">3D MATRIX CONTROL</span></div>
                         <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase flex justify-between"><span>ROTATION X</span> <span className="text-blue-400">{activeAsset.rotateX}°</span></label>
                           <input type="range" min="-180" max="180" value={activeAsset.rotateX} onChange={(e) => updateAsset(activeAsset.id, 'rotateX', parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase flex justify-between"><span>ROTATION Y</span> <span className="text-blue-400">{activeAsset.rotateY}°</span></label>
                           <input type="range" min="-180" max="180" value={activeAsset.rotateY} onChange={(e) => updateAsset(activeAsset.id, 'rotateY', parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase flex justify-between"><span>ROTATION Z</span> <span className="text-blue-400">{activeAsset.rotateZ}°</span></label>
                           <input type="range" min="-180" max="180" value={activeAsset.rotateZ} onChange={(e) => updateAsset(activeAsset.id, 'rotateZ', parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5" />
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Caption Styling Panel */}
              <div className="neon-box bg-[#0a101f]/80 p-12 rounded-[4.5rem] border border-blue-500/20 shadow-3xl space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] ml-2">نمط النص (Style)</label>
                    <select value={activeStyle} onChange={(e) => setActiveStyle(e.target.value as CaptionStyle)} className="w-full bg-black/50 border border-blue-500/30 rounded-[2.5rem] p-6 text-sm font-black outline-none text-white focus:border-blue-500 transition-all shadow-xl">
                      {ALL_STYLE_KEYS.map(s => <option key={s} value={s} className="bg-slate-900">{s.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] ml-2">الحركة (Motion)</label>
                    <select value={styleConfigs[activeStyle].animation} onChange={(e) => updateConfig('animation', e.target.value as CaptionAnimation)} className="w-full bg-black/50 border border-indigo-500/30 rounded-[2.5rem] p-6 text-sm font-black outline-none text-white focus:border-indigo-500 transition-all shadow-xl">
                      {ALL_ANIMATION_KEYS.map(anim => <option key={anim} value={anim} className="bg-slate-900">{anim.toUpperCase().replace(/-/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] ml-2">الخط (Typography)</label>
                    <select value={styleConfigs[activeStyle].fontFamily} onChange={(e) => updateConfig('fontFamily', e.target.value)} className="w-full bg-black/50 border border-blue-500/30 rounded-[2.5rem] p-6 text-sm font-black outline-none text-white shadow-xl">
                      {GLOBAL_FONTS.map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-end">
                   <div className="space-y-5"><label className="text-[11px] font-black text-blue-400 uppercase tracking-widest ml-2">{t.fontSize} ({styleConfigs[activeStyle].fontSize}px)</label><input type="range" min="20" max="300" value={styleConfigs[activeStyle].fontSize} onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))} className="w-full accent-blue-600" /></div>
                   <div className="space-y-5"><label className="text-[11px] font-black text-blue-400 uppercase tracking-widest ml-2">{t.yPos} ({styleConfigs[activeStyle].yPos}%)</label><input type="range" min="0" max="100" value={styleConfigs[activeStyle].yPos} onChange={(e) => updateConfig('yPos', parseInt(e.target.value))} className="w-full accent-blue-600" /></div>
                   <div className="flex gap-10 justify-center bg-black/60 p-8 rounded-[3rem] border border-white/10">
                      <div className="text-center"><label className="text-[10px] font-black text-blue-400 block mb-4 uppercase tracking-tighter">TEXT COLOR</label><input type="color" value={styleConfigs[activeStyle].textColor} onChange={(e) => updateConfig('textColor', e.target.value)} className="w-14 h-14 rounded-2xl cursor-pointer bg-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]" /></div>
                      <div className="text-center"><label className="text-[10px] font-black text-blue-400 block mb-4 uppercase tracking-tighter">BG COLOR</label><input type="color" value={styleConfigs[activeStyle].backgroundColor} onChange={(e) => updateConfig('backgroundColor', e.target.value)} className="w-14 h-14 rounded-2xl cursor-pointer bg-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]" /></div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* HIGH-PRECISION TIMELINE (Core Focus) */}
        <div className="lg:col-span-3 h-[950px] flex flex-col neon-box bg-[#050810]/95 rounded-[4.5rem] border border-blue-900/60 backdrop-blur-3xl overflow-hidden shadow-4xl relative">
          
          <div className="p-10 border-b border-blue-900/40 bg-blue-950/20 flex flex-col gap-6">
            <div className="flex justify-between items-center">
               <h2 className="font-black text-2xl text-blue-50 italic tracking-tighter flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#0066ff] animate-pulse" />
                 {t.timeline}
               </h2>
               <div className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest">{captions.length} SEGMENTS</div>
            </div>
            <button 
              onClick={() => {
                const nextStart = captions.length > 0 ? captions[captions.length - 1].end : currentTime;
                setCaptions([...captions, { id: `manual-${Date.now()}`, start: nextStart, end: nextStart + 2.0, text: 'نص إعلاني جديد' }]);
              }} 
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-sm border border-blue-400/30 transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,102,255,0.3)] flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> {t.add}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {captions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20 text-center space-y-4">
                 <div className="text-6xl">📝</div>
                 <p className="font-black italic text-sm">ابدأ بإضافة نصوص للسيناريو...</p>
              </div>
            ) : captions.map((seg) => {
              const isActive = currentTime >= seg.start && currentTime <= seg.end;
              return (
                <div 
                  key={seg.id} 
                  className={`relative group p-6 rounded-[3.5rem] border transition-all duration-500 overflow-hidden ${
                    isActive 
                    ? 'bg-blue-600/25 border-blue-400 scale-[1.02] shadow-[0_15px_60px_rgba(0,102,255,0.4)]' 
                    : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100 hover:bg-white/10'
                  }`}
                >
                  {/* Playing Glow Background for Active Items */}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 animate-[tech-glow-play_5s_infinite]" />}

                  <div className="relative z-10 space-y-6">
                    
                    {/* Professional Precision Time Controls Row */}
                    <div className="flex flex-col gap-4 bg-black/40 p-4 rounded-[2.5rem] border border-white/5 shadow-inner">
                      
                      {/* Start Time Section */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-blue-400 uppercase">▶️ IN:</span>
                           <button onClick={() => syncTimeWithVideo(seg.id, 'start')} className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs hover:bg-blue-500 hover:text-white transition-all shadow-lg" title="مزامنة مع الوقت الحالي للفيديو">🕒</button>
                        </div>
                        <div className="flex items-center bg-black/60 rounded-2xl border border-blue-900/30 p-1">
                          <button onClick={() => adjustCaptionTime(seg.id, 'start', -0.1)} className="w-8 h-8 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 rounded-xl font-bold transition-all text-xl">-</button>
                          <input 
                            type="number" step="0.1" value={seg.start} 
                            onChange={(e) => updateCaptionTime(seg.id, 'start', parseFloat(e.target.value))} 
                            className="w-20 bg-transparent text-[15px] text-center font-mono font-black text-white outline-none" 
                          />
                          <button onClick={() => adjustCaptionTime(seg.id, 'start', 0.1)} className="w-8 h-8 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 rounded-xl font-bold transition-all text-xl">+</button>
                        </div>
                      </div>

                      {/* End Time Section */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-red-400 uppercase">⏹️ OUT:</span>
                           <button onClick={() => syncTimeWithVideo(seg.id, 'end')} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg" title="مزامنة مع الوقت الحالي للفيديو">🕒</button>
                        </div>
                        <div className="flex items-center bg-black/60 rounded-2xl border border-blue-900/30 p-1">
                          <button onClick={() => adjustCaptionTime(seg.id, 'end', -0.1)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-xl font-bold transition-all text-xl">-</button>
                          <input 
                            type="number" step="0.1" value={seg.end} 
                            onChange={(e) => updateCaptionTime(seg.id, 'end', parseFloat(e.target.value))} 
                            className="w-20 bg-transparent text-[15px] text-center font-mono font-black text-white outline-none" 
                          />
                          <button onClick={() => adjustCaptionTime(seg.id, 'end', 0.1)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-xl font-bold transition-all text-xl">+</button>
                        </div>
                      </div>

                    </div>

                    {/* Text Content Area - Centered & Professional Typography */}
                    <div className="bg-black/80 rounded-[2.5rem] p-6 border-2 border-white/5 group-hover:border-blue-500/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      <textarea 
                        value={seg.text} 
                        onChange={(e) => setCaptions(captions.map(c => c.id === seg.id ? {...c, text: e.target.value} : c))} 
                        className="w-full bg-transparent border-none outline-none font-black text-xl text-white resize-none leading-relaxed text-center custom-scrollbar placeholder-blue-900/50" 
                        rows={3}
                        placeholder="أدخل نص السيناريو هنا..."
                      />
                    </div>

                    {/* Quick Delete & Selection Controls */}
                    <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { if(videoRef.current) videoRef.current.currentTime = seg.start }}
                        className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all"
                      >
                        معاينة المقطع 📽️
                      </button>
                      <button 
                        onClick={() => setCaptions(captions.filter(c => c.id !== seg.id))} 
                        className="w-10 h-10 rounded-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center text-sm shadow-xl"
                      >
                        🗑️
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-10 bg-blue-950/20 border-t border-blue-900/40">
             <button onClick={() => setShowExportModal(true)} className="w-full py-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[3rem] font-black text-lg shadow-[0_25px_80px_rgba(0,102,255,0.5)] hover:brightness-125 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">{t.export}</button>
          </div>
        </div>
      </main>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[10002] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 lg:p-10 animate-fade">
           <div className="neon-box bg-[#000d1a] border border-blue-500/50 w-full max-w-6xl rounded-[5rem] p-10 lg:p-16 relative overflow-hidden shadow-4xl h-[90vh] flex flex-col">
              <button onClick={() => setShowAboutModal(false)} className="absolute top-12 right-12 w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-red-600 transition-all text-3xl z-10 shadow-2xl">✕</button>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-16">
                <div className="text-center space-y-6 relative">
                   <div className="bg-gradient-to-br from-blue-700 to-blue-950 w-36 h-36 rounded-[2.5rem] flex items-center justify-center mx-auto text-6xl shadow-[0_0_80px_rgba(0,102,255,0.8)] relative border-2 border-blue-400/30 animate-pulse">
                      <span className="font-black italic text-white tracking-tighter">DT</span>
                      <div className="absolute -bottom-4 -right-4 bg-blue-600 p-4 rounded-3xl shadow-2xl border-2 border-blue-300/30 transform hover:scale-110 transition-transform">
                         <span className="text-4xl">📽️</span>
                      </div>
                   </div>
                   <div>
                     <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase">DT-CAPTION PRO</h2>
                     <p className="text-blue-400 font-black uppercase tracking-[0.6em] text-[12px] mt-4 opacity-80">BY DICELION TECHNIQUE</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-10">
                    <div className="bg-blue-900/10 p-10 rounded-[4rem] border border-blue-500/30 space-y-8 relative overflow-hidden group">
                      <div className="flex items-center gap-6 border-b border-blue-500/20 pb-6">
                        <span className="text-4xl">🛡️</span>
                        <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">عن المطور والشركة</h3>
                      </div>
                      <div className="space-y-6 text-slate-200 font-bold text-lg">
                        <p className="flex items-center gap-4 hover:translate-x-2 transition-transform"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#0066ff]" /> مدرس خبير في المعاهد التقنية المهنية</p>
                        <p className="flex items-center gap-4 hover:translate-x-2 transition-transform"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#0066ff]" /> تطوير البرمجيات (Software, Mobile, PC)</p>
                        <p className="flex items-center gap-4 hover:translate-x-2 transition-transform"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#0066ff]" /> خبير ذكاء اصطناعي وتحليل بيانات وحلول ذكية</p>
                        <p className="flex items-center gap-4 hover:translate-x-2 transition-transform"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#0066ff]" /> خدمات التصميم المتكاملة والتسويق الرقمي</p>
                        <p className="flex items-center gap-4 hover:translate-x-2 transition-transform"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#0066ff]" /> برامج تدريب احترافية أونلاين وحضورياً</p>
                      </div>

                      <div className="space-y-6 pt-10 border-t border-blue-500/30">
                        <h4 className="text-sm font-black text-blue-400 uppercase tracking-[0.3em]">قنوات التواصل (CONTACT CHANNELS)</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <a href="tel:+212717118180" className="flex items-center justify-between bg-white/5 hover:bg-blue-600/20 p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/50 transition-all group">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">📞</div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-blue-400 uppercase">الخط الأساسي (PRIMARY)</p>
                                   <p className="text-xl font-mono font-bold tracking-widest">+212 717118180</p>
                                </div>
                             </div>
                             <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">CALL ↗</span>
                          </a>
                          <a href="mailto:diceliontechnique@gmail.com" className="flex items-center justify-between bg-indigo-900/10 hover:bg-indigo-600/20 p-6 rounded-[2rem] border border-indigo-500/10 hover:border-indigo-500/50 transition-all group">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">📧</div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-indigo-400 uppercase">البريد الإلكتروني (EMAIL)</p>
                                   <p className="text-lg font-mono font-bold">diceliontechnique@gmail.com</p>
                                </div>
                             </div>
                             <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">SEND ↗</span>
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group mt-10">
                        <div className="text-6xl font-black italic leading-none z-10">20+</div>
                        <div className="text-sm font-black uppercase tracking-tighter leading-tight z-10">عاما من الخبرة<br/><span className="text-blue-200">EXTENSIVE YEARS</span></div>
                        <div className="absolute -right-5 bottom-0 opacity-10 group-hover:rotate-12 transition-transform"><span className="text-9xl font-black italic text-white">📽️</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="bg-indigo-900/10 p-10 rounded-[4rem] border border-indigo-500/30 space-y-8">
                      <div className="flex items-center gap-6 border-b border-indigo-500/20 pb-6">
                        <span className="text-4xl">📘</span>
                        <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">كتاب تعليمات DT-CAPTION PRO</h3>
                      </div>
                      <div className="space-y-8">
                        {[
                          { step: "01", title: "بيئة العمل", desc: "ابدأ برفع فيديو الإعلان. ستظهر لوحة التحكم بجانب الفيديو بمجرد اختيار ملصق." },
                          { step: "02", title: "الهندسة الرقمية", desc: "استخدم مصفوفة الـ 3D لتغيير زاوية الرؤية (X, Y, Z) والالتواء والمنظور." },
                          { step: "03", title: "التحكم المباشر", desc: "اضغط على الملصق واسحبه بالفأرة مباشرة داخل شاشة الفيديو لتحديد مكانه." },
                          { step: "04", title: "التحريك المتزامن", desc: "اختر نوع التحريك (Pop, Elastic, Glitch) وسيتم تطبيقه فوراً على المحتوى." },
                          { step: "05", title: "المعالجة بالذكاء", desc: "عند رفع صورة كملصق، سيقوم Gemini تلقائياً بحذف الخلفية لتكون شفافة." }
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg flex-shrink-0">{item.step}</div>
                            <div>
                              <p className="font-black text-white text-xl mb-1">{item.title}</p>
                              <p className="text-[13px] text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pb-10 text-center">
                   <button onClick={() => setShowAboutModal(false)} className="px-32 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[3rem] font-black text-xl shadow-[0_20px_70px_rgba(0,102,255,0.6)] hover:brightness-125 active:scale-95 transition-all">تم الاستيعاب.. لنصنع العجائب!</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Script Importer */}
      {showImportModal && (
        <div className="fixed inset-0 z-[2001] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-fade">
          <div className="neon-box border border-blue-500/40 w-full max-w-3xl rounded-[4rem] p-12 relative animate-pop-elastic shadow-4xl">
            <button onClick={() => setShowImportModal(false)} className="absolute top-10 right-10 w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-red-500 transition-colors text-2xl">✕</button>
            <div className="text-center mb-10"><h2 className="text-4xl font-black italic text-blue-50 uppercase tracking-tighter">استيراد السيناريو التقني</h2></div>
            <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} className="w-full h-80 bg-blue-950/10 border border-blue-900/40 rounded-[2.5rem] p-10 font-bold text-xl text-white resize-none outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="ألصق كلمات السيناريو هنا..." />
            <div className="flex gap-6 mt-10">
               <button onClick={handleImportText} className="flex-[2] py-6 bg-blue-600 text-white rounded-[2.5rem] font-black shadow-2xl hover:bg-blue-500 transition-colors text-xl uppercase tracking-widest">توليد التوقيت الآلي</button>
               <button onClick={() => setShowImportModal(false)} className="flex-1 py-6 bg-white/5 text-blue-400 rounded-[2.5rem] font-black hover:bg-white/10 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Manager */}
      {showAssetModal && (
        <div className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-fade">
          <div className="neon-box border border-blue-500/40 w-full max-w-4xl rounded-[4rem] p-12 relative animate-pop-elastic overflow-hidden shadow-4xl">
            <button onClick={() => setShowAssetModal(false)} className="absolute top-10 right-10 w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-red-500 transition-colors text-2xl">✕</button>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black italic tracking-tighter text-blue-50 uppercase">مكتبة الملصقات الذكية</h2>
              <p className="text-blue-400 text-[12px] font-black uppercase tracking-[0.5em] mt-3 opacity-60">{t.assetSub}</p>
            </div>
            <div className="border-4 border-dashed border-blue-900/40 rounded-[3.5rem] bg-blue-950/5 flex flex-col items-center justify-center space-y-8 py-24 group hover:border-blue-500/60 transition-all cursor-pointer" onClick={() => assetInputRef.current?.click()}>
              <input type="file" ref={assetInputRef} className="hidden" accept="image/*" onChange={handleLocalAssetUpload} />
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(0,102,255,0.4)] group-hover:scale-110 transition-transform text-4xl">📽️</div>
              <button className="px-16 py-7 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-3xl uppercase tracking-widest">رفع صورة محلية</button>
            </div>
          </div>
        </div>
      )}

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onStartExport={() => {}} isExporting={false} progress={0} />

      <style>{`
        .shadow-4xl { box-shadow: 0 50px 150px rgba(0,0,0,1); }
        .shadow-3xl { box-shadow: 0 30px 80px rgba(0,0,0,0.8); }
        canvas, video { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 102, 255, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

export default App;
