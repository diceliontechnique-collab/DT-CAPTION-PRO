
export interface CaptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface AssetSegment {
  id: string;
  url: string;
  type: 'image' | 'video'; // جديد: تحديد نوع المورد
  start: number;
  end: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
  animation: CaptionAnimation;
  // 3D Controls for Assets
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  perspective: number;
  skewX: number;
  skewY: number;
  // Professional Effects
  glowColor?: string;
  glowIntensity?: number;
  haloEffect?: boolean;
}

export enum Language {
  AR = 'ar',
  EN = 'en'
}

export enum CaptionStyle {
  POP = 'pop',
  HIGHLIGHT = 'highlight',
  SHINE = 'shine',
  MINIMAL = 'minimal',
  NEON = 'neon',
  LUXURY = 'luxury',
  CYBER = 'cyber',
  RETRO = 'retro',
  IMPACT = 'impact',
  GLASS = 'glass',
  STICKER = 'sticker',
  OUTLINE = 'outline',
  GRADIENT = 'gradient',
  SHADOW_DEEP = 'shadow-deep',
  SKEWED = 'skewed',
  FIRE = 'fire',
  CLEAN = 'clean',
  TYPEWRITER = 'typewriter',
  FLASHY = 'flashy',
  BOLD_BOX = 'bold-box',
  FLOATING = 'floating',
  SOFT_GLOW = 'soft-glow',
  GHOST_STYLE = 'ghost-style',
  MODERN_BOLD = 'modern-bold',
  EXPLOSION = 'explosion',
  MATRIX = 'matrix',
  COMIC = 'comic',
  ECHO = 'echo',
  CYBERPUNK = 'cyberpunk',
  PHANTOM = 'phantom'
}

export enum CaptionAnimation {
  NONE = 'none',
  POP_ELASTIC = 'pop-elastic',
  FADE = 'fade',
  SLIDE_UP = 'slide-up',
  SLIDE_DOWN = 'slide-down',
  SLIDE_LEFT = 'slide-left',
  SLIDE_RIGHT = 'slide-right',
  GLITCH = 'glitch',
  BLUR_IN = 'blur-in',
  ZOOM_IN = 'zoom-in',
  ZOOM_OUT = 'zoom-out',
  FLIP_X = 'flip-x',
  FLIP_Y = 'flip-y',
  SHAKE = 'shake',
  PULSE = 'pulse',
  ROTATE = 'rotate',
  SKEW = 'skew',
  SPIRAL = 'spiral',
  SWING = 'swing',
  RUBBER_BAND = 'rubber-band',
  FLASH = 'flash',
  WAVE = 'wave',
  JELLO = 'jello',
  HEARTBEAT = 'heartbeat',
  WOBBLE = 'wobble',
  EXPLODE = 'explode',
  SHATTER = 'shatter',
  SMOKE = 'smoke',
  FIREWORKS = 'fireworks',
  VORTEX = 'vortex',
  LIGHT_SPEED = 'light-speed',
  BOUNCE = 'bounce',
  STAMP = 'stamp',
  GHOST = 'ghost'
}

export interface StyleConfig {
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
  animation: CaptionAnimation;
  yPos: number; // Percentage from top (0-100)
  isVisible: boolean;
  // 3D Controls
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  perspective: number;
  skewX: number;
  skewY: number;
}
