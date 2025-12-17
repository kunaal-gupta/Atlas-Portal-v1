
import React from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { name: 'HOME', color: 'text-rose-500', border: 'border-rose-500', bg: 'hover:bg-rose-500/10' },
  { name: 'NEW AGENTS', color: 'text-emerald-500', border: 'border-emerald-500', bg: 'hover:bg-emerald-500/10' },
  { name: 'QUICK FORMS / HOT STUFF', color: 'text-amber-500', border: 'border-amber-500', bg: 'hover:bg-amber-500/10' },
  { name: 'EVENT CALENDAR', color: 'text-purple-500', border: 'border-purple-500', bg: 'hover:bg-purple-500/10' },
  { name: 'SALES', color: 'text-indigo-500', border: 'border-indigo-500', bg: 'hover:bg-indigo-500/10' },
  { name: 'MARKETING', color: 'text-pink-500', border: 'border-pink-500', bg: 'hover:bg-pink-500/10' },
  { name: 'CONDOS', color: 'text-cyan-500', border: 'border-cyan-500', bg: 'hover:bg-cyan-500/10' }
];

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-[1600px]">
        <div className="flex items-center justify-center h-16">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => onTabChange(tab.name)}
                className={`px-6 h-full text-[13px] font-bold tracking-[0.05em] transition-all relative border-b-2 flex items-center
                  ${isActive 
                    ? `${tab.color} ${tab.border} bg-slate-800/40 shadow-[inset_0_-4px_12px_rgba(255,255,255,0.02)]` 
                    : `text-slate-400 border-transparent hover:text-slate-200 ${tab.bg}`}`}
              >
                <span className="relative z-10">{tab.name}</span>
                {isActive && (
                  <span className={`absolute inset-0 opacity-10 bg-current`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
