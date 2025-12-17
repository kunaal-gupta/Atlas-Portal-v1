
import React from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  'HOME', 
  'NEW AGENTS', 
  'QUICK FORMS / HOT STUFF', 
  'EVENT CALENDAR', 
  'SALES', 
  'MARKETING', 
  'CONDOS'
];

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center h-12">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 h-full text-xs font-medium tracking-wider transition-all relative border-b-2 flex items-center
                ${activeTab === tab 
                  ? 'text-pink-500 border-pink-500 bg-slate-800/50' 
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
