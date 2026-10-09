// Purple panel with the gold FDJ frame.

import type { CSSProperties, ReactNode } from 'react';

export function FdjPanel({ children, style, bodyStyle }: { children: ReactNode; style?: CSSProperties; bodyStyle?: CSSProperties }) {
  return (
    <div className="fdj-panel" style={style}>
      <div className="fdj-panel-gold">
        <div className="fdj-panel-inner">
          <div className="fdj-panel-body" style={bodyStyle}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ badge, children }: { badge: ReactNode; children: ReactNode }) {
  return (
    <div className="fdj-section-title">
      {badge}
      {children}
    </div>
  );
}

/** Round badge left of a section title: purple icon disc or gold number disc. */
export function TitleBadge({ kind, children }: { kind: 'purple' | 'gold'; children: ReactNode }) {
  const bg =
    kind === 'purple'
      ? 'radial-gradient(circle at 50% 30%, #b98bff, #7a3fe0 60%, #5a24b8)'
      : 'radial-gradient(circle at 50% 30%, #ffe892, #f2b52e 55%, #c98a17)';
  return (
    <div
      style={{
        width: 84,
        height: 84,
        borderRadius: '50%',
        background: bg,
        boxShadow: '0 0 0 5px #140e24, inset 0 -5px 0 rgba(0,0,0,0.25), inset 0 4px 0 rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-title)',
        fontSize: 56,
        color: '#2a1640',
      }}
    >
      {children}
    </div>
  );
}
