import { motion } from 'motion/react';

interface ConviaLogoProps {
  size?: number;
  animated?: boolean;
  color?: string;
}

export function ConviaLogo({ size = 40, animated = false, color = 'currentColor' }: ConviaLogoProps) {
  if (animated) {
    return (
      <svg width={size} height={size} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
        <style>{`
          .ring-anim {
            fill: none;
            stroke: currentColor;
            stroke-width: 18;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 340;
            stroke-dashoffset: 340;
            animation: draw 1.6s ease-in-out infinite;
          }
          .flow-anim {
            fill: none;
            stroke: currentColor;
            stroke-width: 18;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 120;
            stroke-dashoffset: 120;
            animation: flow 1.6s ease-in-out infinite;
          }
          .dot-anim {
            fill: currentColor;
            transform-origin: 160px 128px;
            animation: pulse 1.6s ease-in-out infinite;
          }
          @keyframes draw {
            0%   { stroke-dashoffset: 340; opacity: .3; }
            50%  { stroke-dashoffset: 0; opacity: 1; }
            100% { stroke-dashoffset: -340; opacity: .3; }
          }
          @keyframes flow {
            0%   { stroke-dashoffset: 120; }
            50%  { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -120; }
          }
          @keyframes pulse {
            0%,100% { transform: scale(1); opacity: .6; }
            50%     { transform: scale(1.4); opacity: 1; }
          }
        `}</style>
        <path className="ring-anim" d="M182 64 A72 72 0 1 0 182 192" />
        <path className="flow-anim" d="M150 92 Q120 128 150 164" />
        <circle className="dot-anim" cx="160" cy="128" r="8" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <g fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
        <path d="M182 64 A72 72 0 1 0 182 192" />
        <path d="M150 92 Q120 128 150 164" />
        <circle cx="160" cy="128" r="8" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
