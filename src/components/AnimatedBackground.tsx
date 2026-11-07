import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#070B16]">
      {/* Top-left slow ambient violet glow */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[130px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #7C5CFC 0%, rgba(124, 92, 252, 0.05) 70%, transparent 100%)',
          animation: 'pulse-slow 12s infinite ease-in-out',
        }}
      />

      {/* Top-right electric cyan highlight */}
      <div
        className="absolute top-[10%] -right-[15%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[140px] opacity-20"
        style={{
          background: 'radial-gradient(circle, #00D4FF 0%, rgba(0, 212, 255, 0.05) 70%, transparent 100%)',
          animation: 'pulse-slow 15s infinite ease-in-out reverse',
        }}
      />

      {/* Center-bottom deep navy ambient pool */}
      <div
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[160px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #3B82F6 0%, rgba(13, 20, 37, 0.2) 70%, transparent 100%)',
          animation: 'pulse-slow 18s infinite ease-in-out 3s',
        }}
      />

      {/* Subtle futuristic matrix grid lines */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};
