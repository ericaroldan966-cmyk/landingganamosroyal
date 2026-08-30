import { useMemo, type CSSProperties } from 'react';
import { shouldUseHeavyEffects } from '../lib/perf';
import './DepthText.css';

export interface DepthTextProps {
  text?: string;
  layers?: number;
  depth?: number;
  faceColor?: string;
  depthColor?: string;
  tilt?: number;
  pointerTracking?: boolean;
  smoothing?: number;
  perspective?: number;
  autoOrbit?: boolean;
  orbitSpeed?: number;
  fontSize?: string;
  fontWeight?: number | string;
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface DepthLayer {
  index: number;
  color: string;
  transform: string;
}

const MAX_LAYERS = 8;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const getLayerColor = (faceColor: string, depthColor: string, index: number, total: number): string => {
  const progress = total <= 1 ? 1 : index / total;
  const eased = progress * progress;
  const faceMix = Math.round((1 - eased) * 72 + 4);
  return `color-mix(in srgb, ${faceColor} ${faceMix}%, ${depthColor})`;
};

const DepthText = ({
  text = 'Elevate',
  layers = 8,
  depth = 2.4,
  faceColor = '#f8fafc',
  depthColor = '#7c3aed',
  tilt = 7.5,
  perspective = 900,
  fontSize = 'clamp(3rem, 12vw, 7rem)',
  fontWeight = 900,
  shadow = true,
  className = '',
  style = {},
}: DepthTextProps) => {
  const heavy = shouldUseHeavyEffects();
  const safeLayers = heavy ? clamp(Math.round(Number(layers) || 1), 2, MAX_LAYERS) : 0;
  const safeDepth = clamp(Number(depth) || 0, 0, 12);
  const safePerspective = clamp(Number(perspective) || 900, 300, 2000);

  const depthLayers = useMemo<DepthLayer[]>(
    () =>
      Array.from({ length: safeLayers }, (_, layerIndex) => {
        const index = safeLayers - layerIndex;
        return {
          index,
          color: getLayerColor(faceColor, depthColor, index, safeLayers),
          transform: `translateZ(${-index * safeDepth}px)`,
        };
      }),
    [safeLayers, safeDepth, faceColor, depthColor],
  );

  const rootStyle = {
    ...style,
    '--depth-text-perspective': `${safePerspective}px`,
    '--depth-text-font-size': fontSize,
    '--depth-text-font-weight': fontWeight,
    '--depth-text-face-color': faceColor,
    '--depth-text-depth-color': depthColor,
    '--depth-text-shadow': shadow
      ? `0 22px 34px color-mix(in srgb, ${depthColor} 36%, transparent), 0 4px 8px rgba(0, 0, 0, 0.28)`
      : 'none',
    '--depth-text-tilt-x': `${(-tilt * 0.32).toFixed(2)}deg`,
    '--depth-text-tilt-y': `${(tilt * 0.42).toFixed(2)}deg`,
  } as CSSProperties;

  const modeClass = heavy ? 'depth-text--animated' : 'depth-text--flat';

  return (
    <span className={['depth-text', modeClass, className].filter(Boolean).join(' ')} style={rootStyle}>
      <span className="depth-text__stage">
        {depthLayers.map((layer) => (
          <span
            aria-hidden="true"
            className="depth-text__layer"
            key={layer.index}
            style={{ color: layer.color, transform: layer.transform }}
          >
            {text}
          </span>
        ))}
        <span className="depth-text__face">{text}</span>
      </span>
    </span>
  );
};

export default DepthText;
