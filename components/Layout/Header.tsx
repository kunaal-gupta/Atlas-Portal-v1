
import React from 'react';
import { LayoutGrid, Bell, User, Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-sm bg-purple-500"></div>
            <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">MOZAIC <span className="text-slate-400 font-light">PORTAL</span></h1>
        </div>

        <div className="flex-grow max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search resources, links, or articles..."
              className="w-full bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-magenta-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-pink-600 rounded-full border-2 border-slate-900"></span>
          </button>
          <button className="flex items-center space-x-3 group">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold">Alex Rivera</p>
              <p className="text-[10px] text-slate-500">Senior Agent</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center border-2 border-slate-800">
              <User className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
