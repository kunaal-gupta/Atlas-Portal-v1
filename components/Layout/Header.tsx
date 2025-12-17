
import React from 'react';
import { Bell, User, Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 h-20 flex items-center justify-between max-w-[1600px]">
        <div className="flex items-center space-x-5">
          <div className="flex space-x-1.5">
            <div className="w-5 h-5 rounded-sm bg-purple-500 shadow-lg shadow-purple-500/20"></div>
            <div className="w-5 h-5 rounded-sm bg-blue-500 shadow-lg shadow-blue-500/20"></div>
            <div className="w-5 h-5 rounded-sm bg-green-500 shadow-lg shadow-green-500/20"></div>
          </div>
          <h1 className="text-2xl font-black tracking-tight">MOZAIC <span className="text-slate-500 font-light italic">PORTAL</span></h1>
        </div>

        <div className="flex-grow max-w-xl mx-12 hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search resources, links, or articles..."
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none transition-all placeholder-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <button className="relative p-2.5 text-slate-400 hover:text-white transition-all hover:bg-slate-800 rounded-xl">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-slate-900 shadow-sm"></span>
          </button>
          <button className="flex items-center space-x-4 group">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">Alex Rivera</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Senior Agent</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center border-2 border-slate-800 shadow-xl group-hover:scale-105 transition-transform">
              <User className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
