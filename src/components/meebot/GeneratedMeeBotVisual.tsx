import React from 'react';

interface GeneratedMeeBotVisualProps extends React.SVGProps<SVGSVGElement> {
  attributes: { trait_type: string; value: string }[];
}

const GeneratedMeeBotVisual: React.FC<GeneratedMeeBotVisualProps> = ({ attributes, ...props }) => {
  const getAttr = (type: string) => attributes.find(a => a.trait_type === type)?.value;

  const body = getAttr('BODY');
  const core = getAttr('CORE');
  const head = getAttr('HEAD');
  const effect = getAttr('EFFECT');

  // Define the color map separately for clarity and robustness.
  const bodyFillMap = {
    "Clear Crystal": "rgba(30, 41, 59, 0.2)",
    "Chrome": "#9ca3af",
    "Obsidian": "#111827",
    "Golden Aura": "#f59e0b"
  };

  // Safely look up the color from the map, providing a default.
  const bodyFill = (body && bodyFillMap[body as keyof typeof bodyFillMap]) || "#1E293B";
  
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="meebot-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Effect Layer */}
      {effect === 'Soft Glow' && <circle cx="32" cy="32" r="28" fill="#67E8F9" filter="url(#meebot-glow)" opacity="0.7" />}
      {effect === 'Lightning Spark' && (
        <g stroke="#fef08a" strokeWidth="1">
          <path d="M32 2 L29 12 L35 12 L32 22" />
          <path d="M14 22 L20 25 L17 32" />
          <path d="M50 22 L44 25 L47 32" />
        </g>
      )}

      {/* Main Structure (from MeeBotDefaultIcon) */}
      <circle cx="32" cy="32" r="26" fill="#0EA5E9"/>
      <circle cx="32" cy="32" r="23" fill="#F8FAFC"/>
      <path d="M32 9C19.8497 9 10 18.8497 10 31V37C10 49.1503 19.8497 59 32 59C44.1503 59 54 49.1503 54 37V31C54 18.8497 44.1503 9 32 9Z" fill="#F8FAFC"/>
      <path d="M48 31V37C48 45.8366 40.8366 53 32 53C23.1634 53 16 45.8366 16 37V31C16 22.1634 23.1634 15 32 15C40.8366 15 48 22.1634 48 31Z" fill={bodyFill}/>
      
      {/* Core Layer */}
      {core === 'Blue Orb' && <circle cx="32" cy="32" r="8" fill="#38BDF8" />}
      {core === 'Spinning Gear' && (
        <g>
            <path transform="translate(32, 32) scale(1.2)" d="M-8 2 H-5 L-2 8 H2 L5 2 H8 L5 -2 L2 -8 H-2 L-5 -2 Z" fill="#94a3b8" />
             <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="5s" repeatCount="indefinite" />
        </g>
      )}
      {core === 'Quantum Flame' && (
        <path d="M32 28 C 30 31, 30 35, 32 38 C 34 35, 34 31, 32 28 Z" fill="#f43f5e">
          <animate attributeName="d" values="M32 28 C 30 31, 30 35, 32 38 C 34 35, 34 31, 32 28 Z; M32 26 C 28 30, 28 34, 32 38 C 36 34, 36 30, 32 26 Z; M32 28 C 30 31, 30 35, 32 38 C 34 35, 34 31, 32 28 Z" dur="0.8s" repeatCount="indefinite"/>
        </path>
      )}
      
      {/* Face features (always on top of core) */}
      <circle cx="26" cy="33" r="4" fill="#67E8F9"/>
      <circle cx="38" cy="33" r="4" fill="#67E8F9"/>
      <path d="M28 41C28 41 30.5 43 32 43C33.5 43 36 41 36 41" stroke={bodyFill === '#111827' ? '#9ca3af' : '#F8FAFC'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Head Layer */}
      {head === 'Standard Dome' && <rect x="30" y="3" width="4" height="8" rx="2" fill="#F8FAFC" />}
      {head === 'Headphones' && (
        <>
            <path d="M18 24 A 14 14 0 0 1 46 24" stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />
            <rect x="15" y="24" width="6" height="10" rx="2" fill="#475569" />
            <rect x="43" y="24" width="6" height="10" rx="2" fill="#475569" />
        </>
      )}
      {head === 'Crown' && <path d="M22 18 L26 12 L32 16 L38 12 L42 18" stroke="#facc15" strokeWidth="2.5" fill="#fef08a" strokeLinejoin="round" strokeLinecap="round" />}
        
      {head !== 'Headphones' && <circle cx="32" cy="5" r="2" fill="#0EA5E9" />}
    </svg>
  );
};

export default GeneratedMeeBotVisual;