
import React from 'react';
import { AssetSegment, CaptionAnimation } from '../types';

interface AssetOverlayProps {
  currentTime: number;
  assets: AssetSegment[];
  selectedId: string | null;
  onAssetClick: (id: string) => void;
}

const AssetOverlay: React.FC<AssetOverlayProps> = ({ currentTime, assets, selectedId, onAssetClick }) => {
  const activeAssets = assets.filter(a => currentTime >= a.start && currentTime <= a.end);

  if (activeAssets.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 99998 }}>
      {activeAssets.map((asset) => {
        const isSelected = selectedId === asset.id;
        
        const transform = [
          'translate(-50%, -50%)',
          `rotateX(${asset.rotateX || 0}deg)`,
          `rotateY(${asset.rotateY || 0}deg)`,
          `rotateZ(${(asset.rotateZ || 0) + (asset.rotation || 0)}deg)`,
          `skew(${asset.skewX || 0}deg, ${asset.skewY || 0}deg)`,
          `scale(${asset.scale || 1})`
        ].join(' ');

        // تأثير التوهج المتقدم
        const glowStyles: React.CSSProperties = {
          filter: asset.glowIntensity ? `drop-shadow(0 0 ${asset.glowIntensity}px ${asset.glowColor || '#0066ff'})` : 'none',
        };

        return (
          <div
            key={asset.id}
            onClick={(e) => {
              e.stopPropagation();
              onAssetClick(asset.id);
            }}
            className={`absolute transition-transform duration-75 pointer-events-auto cursor-move group ${isSelected ? 'z-[1001]' : 'z-[1000]'}`}
            style={{
              left: `${asset.x}%`,
              top: `${asset.y}%`,
              transform: transform,
              perspective: `${asset.perspective || 1000}px`,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className={`relative ${asset.animation !== CaptionAnimation.NONE ? `animate-${asset.animation}` : ''}`} style={glowStyles}>
               
               {/* Halo Effect Layer */}
               {asset.haloEffect && (
                 <div 
                   className="absolute inset-0 rounded-full animate-pulse opacity-50 blur-2xl" 
                   style={{ background: `radial-gradient(circle, ${asset.glowColor || '#0066ff'} 0%, transparent 70%)`, transform: 'scale(1.5)' }} 
                 />
               )}

               {isSelected && (
                 <div className="absolute -inset-6 border-2 border-cyan-400 rounded-3xl animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                   <div className="absolute -top-3 -left-3 w-5 h-5 bg-cyan-400 rounded-full shadow-lg" />
                   <div className="absolute -top-3 -right-3 w-5 h-5 bg-cyan-400 rounded-full shadow-lg" />
                   <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-cyan-400 rounded-full shadow-lg" />
                   <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-cyan-400 rounded-full shadow-lg" />
                 </div>
               )}
               
               {asset.type === 'video' ? (
                 <video
                   src={asset.url}
                   autoPlay
                   loop
                   muted
                   className={`max-w-[600px] max-h-[600px] object-contain transition-all duration-300 ${isSelected ? 'brightness-110 contrast-110' : 'group-hover:brightness-105'}`}
                   draggable={false}
                 />
               ) : (
                 <img
                   src={asset.url}
                   alt="asset"
                   className={`max-w-[500px] max-h-[500px] object-contain transition-all duration-300 ${isSelected ? 'brightness-110 contrast-110' : 'group-hover:brightness-105'}`}
                   draggable={false}
                 />
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssetOverlay;
