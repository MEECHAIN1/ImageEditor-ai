
import React from 'react';
import { badges } from '../../lib/mockData';
import { BadgeIcon } from '../../../components/Icons';

const DashboardWidget: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ title, children, className }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-4 md:p-6 ${className}`}>
    <h2 className="text-xl font-semibold mb-4 text-slate-200">{title}</h2>
    {children}
  </div>
);

const BadgeGallery: React.FC = () => {
  return (
    <DashboardWidget title="🏅 เหรียญตราที่ได้รับ">
      <div className="grid grid-cols-2 gap-3">
        {badges.map(badge => (
          <div 
            key={badge.id} 
            className="bg-purple-900/30 rounded-lg p-3 text-center transition-transform hover:scale-105 hover:bg-purple-900/50"
            title={badge.description}
          >
            <BadgeIcon className="h-10 w-10 mx-auto text-purple-300" />
            <p className="text-sm font-medium mt-2 text-slate-200">{badge.name}</p>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};

export default BadgeGallery;
