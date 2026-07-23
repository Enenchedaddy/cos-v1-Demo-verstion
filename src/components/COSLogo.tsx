/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface COSLogoProps {
  className?: string;
  variant?: 'full' | 'white' | 'monochrome';
}

export default function COSLogo({ className = 'w-16 h-16', variant = 'full' }: COSLogoProps) {
  // Point calculations for pointed-top regular hexagon:
  // Center is (50, 50). Outer radius is 40. Inner radius is 20.
  // We define the 6 facets as SVG paths.
  
  // Outer points:
  // 5: Top, 0: Top-right, 1: Bottom-right, 2: Bottom, 3: Bottom-left, 4: Top-left
  const P5 = "50,10";
  const P0 = "84.64,30";
  const P1 = "84.64,70";
  const P2 = "50,90";
  const P3 = "15.36,70";
  const P4 = "15.36,30";

  // Inner points:
  const I5 = "50,30";
  const I0 = "67.32,40";
  const I1 = "67.32,60";
  const I2 = "50,70";
  const I3 = "32.68,60";
  const I4 = "32.68,40";

  // Facet paths:
  // Facet 1: Top-Right (P5 -> P0 -> I0 -> I5)
  // Facet 2: Right (P0 -> P1 -> I1 -> I0)
  // Facet 3: Bottom-Right (P1 -> P2 -> I2 -> I1)
  // Facet 4: Bottom-Left (P2 -> P3 -> I3 -> I2)
  // Facet 5: Left (P3 -> P4 -> I4 -> I3)
  // Facet 6: Top-Left (P4 -> P5 -> I5 -> I4)
  const facets = [
    { points: `${P5} ${P0} ${I0} ${I5}`, colors: { full: '#4065B3', white: '#FFFFFF', monochrome: '#182A5C' }, opacity: { full: 0.95, white: 0.85, monochrome: 0.9 } },
    { points: `${P0} ${P1} ${I1} ${I0}`, colors: { full: '#264288', white: '#FFFFFF', monochrome: '#182A5C' }, opacity: { full: 1.0,  white: 0.95, monochrome: 1.0 } },
    { points: `${P1} ${P2} ${I2} ${I1}`, colors: { full: '#182A5C', white: '#FFFFFF', monochrome: '#182A5C' }, opacity: { full: 1.0,  white: 1.0,  monochrome: 1.0 } },
    { points: `${P2} ${P3} ${I3} ${I2}`, colors: { full: '#264288', white: '#FFFFFF', monochrome: '#182A5C' }, opacity: { full: 0.9,  white: 0.9,  monochrome: 0.95 } },
    { points: `${P3} ${P4} ${I4} ${I3}`, colors: { full: '#899FD1', white: '#FFFFFF', monochrome: '#182A5C' }, opacity: { full: 0.8,  white: 0.75, monochrome: 0.8 } },
    { points: `${P4} ${P5} ${I5} ${I4}`, colors: { full: '#6C84B8', white: '#FFFFFF', monochrome: '#182A5C' }, opacity: { full: 0.85, white: 0.8,  monochrome: 0.85 } },
  ];

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {facets.map((facet, idx) => (
        <polygon 
          key={idx}
          points={facet.points}
          fill={variant === 'white' ? facet.colors.white : variant === 'monochrome' ? facet.colors.monochrome : facet.colors.full}
          opacity={facet.opacity[variant]}
          stroke={variant === 'white' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}
