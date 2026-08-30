import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import './SpecularButton.css';

type ButtonSize = 'sm' | 'md' | 'lg';

export interface SpecularButtonProps {
  children?: ReactNode;
  size?: ButtonSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

const SpecularButton = ({
  children = 'Get Started',
  size = 'lg',
  radius = 14,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#ffffff',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  href,
  target,
  rel,
  ariaLabel,
}: SpecularButtonProps) => {
  const style = {
    '--sb-radius': `${radius}px`,
    '--sb-tint': tint,
    '--sb-tint-opacity': tintOpacity,
    '--sb-blur': blur ? `${blur}px` : '0px',
    '--sb-text-color': textColor,
  } as CSSProperties;

  const cls = ['specular-button', `specular-button--${size}`, 'specular-button--css', className]
    .filter(Boolean)
    .join(' ');

  const inner = <span className="specular-button__label">{children}</span>;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} aria-label={ariaLabel} onClick={onClick} className={cls} style={style}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls} style={style} aria-label={ariaLabel}>
      {inner}
    </button>
  );
};

export default SpecularButton;
