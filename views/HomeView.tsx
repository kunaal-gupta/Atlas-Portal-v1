
import React from 'react';
import NewsSection from '../components/Home/NewsSection';
import EasyAccessGrid from '../components/Home/EasyAccessGrid';

const HomeView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Resources for <span className="bg-gradient-to-r from-pink-500 to-indigo-400 bg-clip-text text-transparent">Agents</span>
          </h2>
          <div className="text-slate-500 text-sm">
            Welcome back, <span className="text-white font-medium">Alex</span>
          </div>
        </div>
        
        <NewsSection />
      </section>

      <section className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800/50">
        <h3 className="text-xl font-bold mb-8 uppercase tracking-widest text-slate-500">Easy Access</h3>
        <EasyAccessGrid />
      </section>
    </div>
  );
};

export default HomeView;
