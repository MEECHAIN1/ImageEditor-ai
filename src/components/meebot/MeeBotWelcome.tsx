import React from 'react';
import { MeeBotDefaultIcon } from '../../../components/Icons';

export interface MeeBotWelcomeProps {
  name?: string;
  small?: boolean;
}

/**
 * MeeBotWelcome
 * - No CSS imports here — use className only.
 * - Global styles must be imported from src/pages/_app.tsx
 */
export const MeeBotWelcome: React.FC<MeeBotWelcomeProps> = ({ name = 'MeeBot', small = false }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className={`meebot-avatar meebot-bounce`} aria-hidden>
        <MeeBotDefaultIcon />
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>{`คุยกับ ${name}`}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>ผู้ช่วยประจำระบบ</div>
      </div>
    </div>
  );
};

export default MeeBotWelcome;