
import React, { useEffect, useState } from 'react';
import { CaptionSegment, CaptionStyle, StyleConfig, CaptionAnimation } from '../types';

interface AnimatedCaptionsProps {
  currentTime: number;
  segments: CaptionSegment[];
  style: CaptionStyle;
  config: StyleConfig;
  testMode?: boolean;
}

const AnimatedCaptions: React.FC<AnimatedCaptionsProps> = ({ currentTime, segments, style, config, testMode }) => {
  const [activeSegment, setActiveSegment] = useState<CaptionSegment | null>(null);

  useEffect(() => {
    if (testMode) {
      setActiveSegment({ id: 'test', start: 0, end: 9999, text: 'DT-CAPTION PRO PREVIEW' });
      return;
    }
    
    const current = segments.find(s => currentTime >= s.start && currentTime <= s.end);
    setActiveSegment(current || null);
  }, [currentTime, segments, testMode]);

  if (!config.isVisible || !activeSegment) return null;

  const getAnimationClass = () => {
    if (config.animation === CaptionAnimation.NONE) return "";
    return `animate-${config.animation}`;
  };

  const getStyleClasses = () => {
    let styleClass = "";
    switch (style) {
      case CaptionStyle.POP: styleClass = "font-black uppercase tracking-tighter"; break;
      case CaptionStyle.HIGHLIGHT: styleClass = "font-bold px-8 py-2 rounded-2xl shadow-2xl"; break;
      case CaptionStyle.SHINE: styleClass = "font-black"; break;
      case CaptionStyle.MINIMAL: styleClass = "font-bold px-6 py-1 rounded-lg bg-black/80"; break;
      case CaptionStyle.NEON: styleClass = "font-bold italic"; break;
      case CaptionStyle.LUXURY: styleClass = "font-light tracking-[0.2em] italic"; break;
      case CaptionStyle.CYBER: styleClass = "font-black tracking-widest"; break;
      case CaptionStyle.RETRO: styleClass = "font-mono border-b-4 border-r-4"; break;
      case CaptionStyle.IMPACT: styleClass = "font-black uppercase scale-y-125"; break;
      case CaptionStyle.GLASS: styleClass = "backdrop-blur-md border border-white/20 px-8 py-4 rounded-[2rem]"; break;
      case CaptionStyle.STICKER: styleClass = "font-black px-6 py-2 rounded-full"; break;
      case CaptionStyle.OUTLINE: styleClass = "font-black"; break;
      case CaptionStyle.GRADIENT: styleClass = "font-black uppercase"; break;
      case CaptionStyle.EXPLOSION: styleClass = "font-black text-yellow-400"; break;
      case CaptionStyle.MATRIX: styleClass = "font-mono tracking-tighter"; break;
      case CaptionStyle.COMIC: styleClass = "font-black italic uppercase border-4 border-black px-4 py-1"; break;
      case CaptionStyle.ECHO: styleClass = "font-bold tracking-widest"; break;
      case CaptionStyle.CYBERPUNK: styleClass = "font-black"; break;
      case CaptionStyle.PHANTOM: styleClass = "font-bold opacity-70"; break;
      default: styleClass = "font-bold"; break;
    }
    return `${styleClass} ${getAnimationClass()}`;
  };

  const getInnerStyles = (): React.CSSProperties => {
    // بناء مصفوفة التحويلات
    const transforms = [
      'translateX(-50%)',
      `rotateX(${config.rotateX}deg)`,
      `rotateY(${config.rotateY}deg)`,
      `rotateZ(${config.rotateZ}deg)`,
      `skew(${config.skewX}deg, ${config.skewY}deg)`
    ].join(' ');

    const base: React.CSSProperties = {
      color: config.textColor,
      fontSize: `${config.fontSize}px`,
      fontFamily: `${config.fontFamily}, sans-serif`,
      backgroundColor: config.backgroundColor,
      textAlign: 'center',
      display: 'inline-block',
      padding: '0.1em 0.5em',
      lineHeight: '1.1',
      zIndex: 10000,
      pointerEvents: 'none',
      transition: 'all 0.1s ease-out',
      top: `${config.yPos}%`,
      left: '50%',
      transform: transforms,
      perspective: `${config.perspective}px`,
      transformStyle: 'preserve-3d',
      position: 'absolute'
    };

    if (style === CaptionStyle.EXPLOSION) {
        base.textShadow = `0 0 10px #f00, 0 0 20px #ff0, 0 0 40px #f90`;
    }
    if (style === CaptionStyle.MATRIX) {
        base.textShadow = `0 0 8px #0f4`;
    }
    
    return base;
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 99999, perspective: `${config.perspective}px` }}>
      <div 
        key={activeSegment.id + activeSegment.text + style} 
        className={getStyleClasses()}
        style={getInnerStyles()}
      >
        {activeSegment.text}
      </div>
    </div>
  );
};

export default AnimatedCaptions;
