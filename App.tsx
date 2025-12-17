
import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Navbar from './components/Layout/Navbar';
import HomeView from './views/HomeView';
import CalendarView from './views/CalendarView';
import CondoView from './views/CondoView';
import GeminiChat from './components/Chat/GeminiChat';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('HOME');

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return <HomeView />;
      case 'EVENT CALENDAR':
        return <CalendarView />;
      case 'CONDOS':
        return <CondoView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 py-20">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
               <span className="text-2xl">🚧</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{activeTab}</h2>
            <p className="text-sm">This module is currently being optimized for the new portal.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      <Header />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-grow container mx-auto px-8 py-10 max-w-[1500px]">
        {renderContent()}
      </main>

      <footer className="border-t border-white/5 py-12 bg-slate-900/50">
        <div className="container mx-auto px-8 max-w-[1500px]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
              <div className="w-6 h-6 bg-rose-500 rounded-md"></div>
              <span className="font-black tracking-tighter text-sm">MOZAIC REALTY</span>
            </div>
            <div className="flex space-x-10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-rose-500 transition-colors">Safety</a>
              <a href="#" className="hover:text-rose-500 transition-colors">Compliance</a>
              <a href="#" className="hover:text-rose-500 transition-colors">Support</a>
              <a href="#" className="hover:text-rose-500 transition-colors">Feedback</a>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">© 2025 Mozaic Realty Group. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <GeminiChat />
    </div>
  );
};

export default App;
