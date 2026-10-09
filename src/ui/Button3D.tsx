// Big FDJ-style 3D button (orange by default) with an outlined label.

import type { CSSProperties, ReactNode } from 'react';
import { OutlinedText } from './OutlinedText';
import { sfx } from '../audio/sfx';

export function Button3D({
  children,
  onClick,
  variant = 'orange',
  width,
  height,
  fontSize = 72,
  disabled,
  style,
  silent,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'orange' | 'purple' | 'blue' | 'green' | 'red';
  width: number;
  height: number;
  fontSize?: number;
  disabled?: boolean;
  style?: CSSProperties;
  silent?: boolean;
}) {
  return (
    <button
      className={`btn3d btn-${variant}`}
      style={{ width, height, ...style }}
      disabled={disabled}
      onClick={() => {
        if (!silent) sfx.click();
        onClick?.();
      }}
    >
      <span className="btn3d-depth" />
      <span className="btn3d-face">
        <OutlinedText size={fontSize} stroke="#2a1640" shadow="#2a1640">
          {children}
        </OutlinedText>
      </span>
    </button>
  );
}
