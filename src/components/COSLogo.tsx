/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface COSLogoProps {
  className?: string;
  variant?: 'full' | 'white' | 'monochrome';
}

const CYCLE_DURATION = '7.2s';

export default function COSLogo({ className = 'w-16 h-16', variant = 'full' }: COSLogoProps) {
  const facets = [
    {
      id: 'f1',
      points: '15.36,30 50,10 84.64,30 67.32,40 50,30 32.68,40',
      full: '#4065B3',
      opacity: 1,
    },
    {
      id: 'f2',
      points: '84.64,30 84.64,70 50,90 50,70 67.32,60 67.32,40',
      full: '#264288',
      opacity: 1,
    },
    {
      id: 'f3',
      points: '50,90 15.36,70 32.68,60 50,70',
      full: '#182A5C',
      opacity: 0.94,
    },
    {
      id: 'f4',
      points: '15.36,70 15.36,30 32.68,40 32.68,60',
      full: '#6C84B8',
      opacity: 0.9,
    },
  ];

  const facetFill = (full: string) => {
    if (variant === 'white') return '#FFFFFF';
    if (variant === 'monochrome') return '#182A5C';
    return full;
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Central Operating System logo"
    >
      <style>{`
        .cos-logo-assembly {
          transform-box: view-box;
          transform-origin: 50px 50px;
          animation: cos-logo-breathe ${CYCLE_DURATION} ease-in-out infinite;
        }

        .cos-logo-facet {
          transform-box: view-box;
          transform-origin: 50px 50px;
          will-change: transform, opacity;
        }

        .cos-logo-f1 { animation: cos-logo-f1 ${CYCLE_DURATION} cubic-bezier(.22,.82,.32,1) infinite; }
        .cos-logo-f2 { animation: cos-logo-f2 ${CYCLE_DURATION} cubic-bezier(.22,.82,.32,1) infinite; }
        .cos-logo-f3 { animation: cos-logo-f3 ${CYCLE_DURATION} cubic-bezier(.22,.82,.32,1) infinite; }
        .cos-logo-f4 { animation: cos-logo-f4 ${CYCLE_DURATION} cubic-bezier(.22,.82,.32,1) infinite; }

        @keyframes cos-logo-f1 {
          0%, 2% { opacity: 0; transform: scale(.04) rotate(-72deg); }
          13% { opacity: 1; transform: scale(1.04) rotate(7deg); }
          17%, 72% { opacity: 1; transform: scale(1) rotate(0); }
          84%, 100% { opacity: 0; transform: scale(.04) rotate(58deg); }
        }

        @keyframes cos-logo-f2 {
          0%, 6% { opacity: 0; transform: scale(.04) rotate(68deg); }
          18% { opacity: 1; transform: scale(1.04) rotate(-7deg); }
          22%, 70% { opacity: 1; transform: scale(1) rotate(0); }
          82%, 100% { opacity: 0; transform: scale(.04) rotate(-62deg); }
        }

        @keyframes cos-logo-f3 {
          0%, 10% { opacity: 0; transform: scale(.04) rotate(-64deg); }
          23% { opacity: 1; transform: scale(1.04) rotate(6deg); }
          27%, 68% { opacity: 1; transform: scale(1) rotate(0); }
          80%, 100% { opacity: 0; transform: scale(.04) rotate(60deg); }
        }

        @keyframes cos-logo-f4 {
          0%, 14% { opacity: 0; transform: scale(.04) rotate(62deg); }
          28% { opacity: 1; transform: scale(1.04) rotate(-6deg); }
          32%, 66% { opacity: 1; transform: scale(1) rotate(0); }
          78%, 100% { opacity: 0; transform: scale(.04) rotate(-56deg); }
        }

        @keyframes cos-logo-breathe {
          0%, 27%, 32%, 66%, 100% { transform: scale(1); }
          41%, 57% { transform: scale(1.018); }
          49% { transform: scale(.995); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cos-logo-assembly,
          .cos-logo-facet {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <g className="cos-logo-assembly">
        {facets.map((facet) => (
          <polygon
            key={facet.id}
            className={`cos-logo-facet cos-logo-${facet.id}`}
            points={facet.points}
            fill={facetFill(facet.full)}
            opacity={variant === 'white' ? Math.max(facet.opacity - 0.04, 0.82) : facet.opacity}
            stroke={variant === 'white' ? 'rgba(255,255,255,0.08)' : 'rgba(21,32,43,0.08)'}
            strokeWidth="0.5"
          />
        ))}
      </g>
    </svg>
  );
}
