
import React from 'react';
import { proposals } from '../../lib/mockData';

const DashboardWidget: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ title, children, className }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-4 md:p-6 ${className}`}>
    <h2 className="text-xl font-semibold mb-4 text-slate-200">{title}</h2>
    {children}
  </div>
);

const statusStyles: { [key: string]: string } = {
    active: 'text-yellow-400 bg-yellow-900/50',
    passed: 'text-green-400 bg-green-900/50',
    executed: 'text-sky-400 bg-sky-900/50',
    failed: 'text-red-400 bg-red-900/50',
};

const ProposalGrid: React.FC = () => {
  return (
    <DashboardWidget title="🗳️ ข้อเสนอเพื่อการกำกับดูแล">
        <ul className="space-y-3">
            {proposals.map(p => (
            <li key={p.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 transition-colors hover:bg-slate-800/80">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-300 text-sm pr-2">{p.title}</h3>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyles[p.status] || ''}`}>
                        {p.status}
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{p.description}</p>
            </li>
            ))}
        </ul>
    </DashboardWidget>
  );
};

export default ProposalGrid;
