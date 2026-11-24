import React, { useState } from 'react';
import { GENERATED_ASSETS, type Role } from '../types/game';

interface CustomSceneBackdropProps {
  /** Primary custom path requested by user, e.g. /assets/scene1-p2.jpg */
  customSrc: string;
  alt: string;
  /** Rich atmospheric SVG fallback rendered when customSrc is missing */
  fallbackSvg: React.ReactNode;
  /** Optional dim overlay when a custom photo IS loaded so HUD/hotspots remain readable */
  photoScrimClass?: string;
}

/**
 * Loads custom images from /assets/scene*.jpg first; falls back seamlessly to rich atmospheric SVG
 * if the file does not exist so there are never broken image frames.
 */
export const SceneBackdrop: React.FC<CustomSceneBackdropProps> = ({
  customSrc,
  alt,
  fallbackSvg,
  photoScrimClass = 'bg-slate-950/20',
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none">
      {/* Always render atmospheric SVG fallback underneath until custom image succeeds */}
      {status !== 'loaded' && <div className="w-full h-full">{fallbackSvg}</div>}

      {status !== 'error' && (
        <img
          src={customSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      )}

      {status === 'loaded' && (
        <div className={`absolute inset-0 pointer-events-none ${photoScrimClass}`} />
      )}
    </div>
  );
};

interface PlayerAvatarProps {
  role: Role;
  name: string;
  sizeClass?: string;
  ringClass?: string;
}

/**
 * Tries custom /assets/avatar-p1.png or /assets/avatar-p2.png first,
 * then falls back to the generated graphic-novel portrait,
 * and finally falls back to a crisp typographic monogram.
 */
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  role,
  name,
  sizeClass = 'w-10 h-10',
  ringClass = 'ring-1 ring-slate-600/80',
}) => {
  const customSrc = role === 'p1' ? '/assets/avatar-p1.png' : '/assets/avatar-p2.png';
  const generatedSrc = role === 'p1' ? GENERATED_ASSETS.avatarP1 : GENERATED_ASSETS.avatarP2;

  const [step, setStep] = useState<'custom' | 'generated' | 'monogram'>('custom');

  const activeSrc = step === 'custom' ? customSrc : generatedSrc;
  const initials = (name.trim().slice(0, 2) || (role === 'p1' ? 'ЮЯ' : 'СЯ')).toUpperCase();

  return (
    <div
      className={`relative shrink-0 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center ${sizeClass} ${ringClass}`}
    >
      {step !== 'monogram' ? (
        <img
          src={activeSrc}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setStep((prev) => (prev === 'custom' ? 'generated' : 'monogram'))}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-display text-xs font-bold text-amber-300">{initials}</span>
      )}
    </div>
  );
};
