
import React from 'react';
import { FileText, Download, Share2, Search, Filter, LayoutGrid, List, FileDown, RefreshCw, Plus } from 'lucide-react';

interface CondoResource {
  id: string;
  name: string;
  modified: string;
  modifiedBy: string;
  size: string;
  type: 'pdf' | 'doc' | 'img';
}

const RESOURCES: CondoResource[] = [
  { id: '1', name: 'Condo Fundamentlas SRG 2020.pdf', modified: 'June 2, 2021', modifiedBy: 'Marketing | MOZAIC', size: '2.4 MB', type: 'pdf' },
  { id: '2', name: 'Key Changes Summary Condominium Act .pdf', modified: 'June 2, 2021', modifiedBy: 'Marketing | MOZAIC', size: '1.1 MB', type: 'pdf' },
  { id: '3', name: 'Presentation_Images.pdf', modified: 'June 2, 2021', modifiedBy: 'Marketing | MOZAIC', size: '15.8 MB', type: 'pdf' },
  { id: '4', name: 'Condo Sales Strategy 2024.pdf', modified: 'Dec 12, 2024', modifiedBy: 'Sales | MOZAIC', size: '4.2 MB', type: 'pdf' },
  { id: '5', name: 'New Development Protocols.pdf', modified: 'Jan 15, 2025', modifiedBy: 'Legal | MOZAIC', size: '0.9 MB', type: 'pdf' },
];

const CondoView: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Banner Section */}
      <section className="relative h-[300px] rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1500" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[30%]"
          alt="Modern Architecture"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-12">
          <p className="text-rose-500 font-black text-[10px] tracking-[0.4em] uppercase mb-4 animate-in fade-in slide-in-from-left-4 duration-1000">Departmental Hub</p>
          <h2 className="text-6xl font-black tracking-tighter text-white mb-2">CONDOS</h2>
          <p className="text-slate-400 max-w-lg font-medium text-sm">
            Access internal fundamentals, act summaries, and presentation assets for our high-density residential portfolio.
          </p>
        </div>
      </section>

      {/* Control Bar */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter resources..."
              className="bg-slate-800/40 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:ring-1 focus:ring-rose-500/30 outline-none w-80 transition-all"
            />
          </div>
          <button className="h-12 w-12 flex items-center justify-center bg-slate-800/40 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
             <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-6 py-3 bg-slate-800/60 border border-white/10 rounded-2xl text-[11px] font-black text-slate-300 hover:bg-slate-700 transition-all uppercase tracking-widest">
            <FileDown className="w-4 h-4 text-rose-500" />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 bg-slate-800/60 border border-white/10 rounded-2xl text-[11px] font-black text-slate-300 hover:bg-slate-700 transition-all uppercase tracking-widest">
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            <span>Sync</span>
          </button>
          <button className="flex items-center space-x-2 px-8 py-3 bg-rose-600 rounded-2xl text-[11px] font-black text-white shadow-xl shadow-rose-600/20 hover:bg-rose-500 transition-all uppercase tracking-widest">
            <Plus className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </section>

      {/* Document Explorer */}
      <section className="bg-slate-800/20 rounded-[40px] border border-white/5 overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-slate-900/50 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
           <div className="col-span-6">Resource Name</div>
           <div className="col-span-2 text-center">Modified</div>
           <div className="col-span-2 text-center">Department</div>
           <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {RESOURCES.map((doc) => (
            <div key={doc.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center group hover:bg-white/5 transition-all">
              <div className="col-span-6 flex items-center space-x-5">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-slate-950">
                  <FileText className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">{doc.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">{doc.size}</p>
                </div>
              </div>
              
              <div className="col-span-2 text-center">
                <span className="text-[11px] font-medium text-slate-400">{doc.modified}</span>
              </div>

              <div className="col-span-2 flex justify-center">
                 <span className="px-3 py-1 bg-slate-950 border border-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:border-rose-500/20 transition-colors">
                    {doc.modifiedBy.split(' | ')[0]}
                 </span>
              </div>

              <div className="col-span-2 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2.5 rounded-xl bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:bg-rose-600 transition-all" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-xl bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 transition-all" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State / Footer */}
        <div className="p-8 bg-slate-900/20 text-center border-t border-white/5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">End of Document Stream • Total 5 Resources Available</p>
        </div>
      </section>
    </div>
  );
};

export default CondoView;
