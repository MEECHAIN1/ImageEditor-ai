
import React from 'react';
import { MeeBotDefaultIcon } from '../../../components/Icons';

interface MeeBotWidgetProps {
  mood: 'joyful' | 'curious' | 'helpful';
  message: string;
}

const MeeBotWidget: React.FC<MeeBotWidgetProps> = ({ mood, message }) => {
  return (
    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg">
      <div className="meebot-avatar meebot-bounce" style={{width: '64px', height: '64px'}}>
        <MeeBotDefaultIcon />
      </div>
      <p className="text-lg font-medium text-purple-300">{message}</p>
    </div>
  );
};

export default MeeBotWidget;
